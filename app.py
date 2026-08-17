from flask import Flask, render_template, request, redirect, url_for, Response
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date, timedelta
from markupsafe import Markup
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Custom nl2br filter for line breaks
def nl2br(value):
    if value is None:
        return ''
    return Markup(value.replace('\n', '<br>'))

app.jinja_env.filters['nl2br'] = nl2br

class Task(db.Model):
    id = db.Column(db.types.Integer, primary_key=True)
    title = db.Column(db.types.String(100), nullable=False)
    description = db.Column(db.types.String)
    is_recurrent = db.Column(db.types.Boolean, default=False)
    start_date = db.Column(db.types.Date, nullable=False)
    recurrence_interval = db.Column(db.types.Integer, default=0)
    importance = db.Column(db.types.Integer, nullable=False)
    risk = db.Column(db.types.Integer, nullable=False)
    is_completed = db.Column(db.types.Boolean, default=False, nullable=False) # Added flag for non-recurrent task completion
    created_at = db.Column(db.types.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.types.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completions = db.relationship('Completion', backref='task', lazy=True, cascade="all, delete-orphan") # Added cascade delete

class Completion(db.Model):
    id = db.Column(db.types.Integer, primary_key=True)
    task_id = db.Column(db.types.Integer, db.ForeignKey('task.id'), nullable=False)
    completion_date = db.Column(db.types.Date, nullable=False)

def get_effective_due_date(task, today):
    """Calculates the effective due date for a task."""
    if task.is_recurrent and task.recurrence_interval > 0:
        # For recurrent tasks, the start_date always represents the next due date
        return task.start_date
    else:
        # For non-recurrent tasks, check the permanent completed flag first
        if task.is_completed:
             return None # Permanently completed
        # Original check based on completion record (can likely be removed if is_completed flag is reliable)
        # elif Completion.query.filter_by(task_id=task.id, completion_date=task.start_date).first():
        #     return None  # Completed for this specific date (less relevant now)
        else:
            return task.start_date # Not completed

def get_urgency(due_date, today):
    if due_date < today:
        return 5
    elif due_date == today:
        return 4
    elif due_date <= today + timedelta(days=1):
        return 3
    elif due_date <= today + timedelta(days=3):
        return 2
    else:
        return 1

@app.route('/')
def index():
    current_year = datetime.utcnow().year
    return render_template('index.html', current_year=current_year, is_home=True)

@app.route('/tasks')
def task_list():
    today = date.today()
    tasks = Task.query.all()
    task_list = []
    for task in tasks:
        due_date = get_effective_due_date(task, today)
        if due_date:
            urgency = get_urgency(due_date, today)
            priority = urgency + task.importance + task.risk
            days_until_due = (due_date - today).days if due_date >= today else -1
            task_list.append({
                'task': task,
                'due_date': due_date,
                'priority': priority,
                'days_until_due': days_until_due
            })
    task_list.sort(key=lambda x: (-x['priority'], x['due_date']))
    return render_template('task_list.html', task_list=task_list, today=today, is_home=False)

@app.route('/add_task', methods=['GET', 'POST'])
def add_task():
    if request.method == 'POST':
        title = request.form['title']
        description = request.form['description']
        is_recurrent = 'is_recurrent' in request.form
        start_date = datetime.strptime(request.form['start_date'], '%Y-%m-%d').date()
        recurrence_interval = int(request.form['recurrence_interval']) if is_recurrent else 0
        importance = int(request.form['importance'])
        risk = int(request.form['risk'])
        new_task = Task(
            title=title,
            description=description,
            is_recurrent=is_recurrent,
            start_date=start_date,
            recurrence_interval=recurrence_interval,
            importance=importance,
            risk=risk
        )
        db.session.add(new_task)
        db.session.commit()
        return redirect(url_for('task_list'))
    return render_template('add_task.html', is_home=False)

@app.route('/complete_task/<int:task_id>')
def complete_task(task_id):
    task = Task.query.get_or_404(task_id)
    today = date.today()
    current_due_date = get_effective_due_date(task, today) # Get the date being completed

    if current_due_date: # Ensure the task isn't already considered completed for this cycle
        # Add completion record for history
        completion = Completion(task_id=task.id, completion_date=current_due_date)
        db.session.add(completion)

        # If recurrent, update the task's start_date to the next occurrence
        if task.is_recurrent and task.recurrence_interval > 0:
            next_due_date = current_due_date + timedelta(days=task.recurrence_interval)
            task.start_date = next_due_date
            task.updated_at = datetime.utcnow() # Update timestamp
        else:
            # If non-recurrent, mark it as permanently completed
            task.is_completed = True
            task.updated_at = datetime.utcnow() # Update timestamp

        db.session.commit()

    return redirect(url_for('task_list'))

@app.route('/edit_task/<int:task_id>', methods=['GET', 'POST'])
def edit_task(task_id):
    task = Task.query.get_or_404(task_id)
    if request.method == 'POST':
        task.title = request.form['title']
        task.start_date = datetime.strptime(request.form['start_date'], '%Y-%m-%d').date()
        task.description = request.form['description']
        db.session.commit()
        return redirect(url_for('task_list'))
    return render_template('edit_task.html', task=task, is_home=False)

@app.route('/delete_task/<int:task_id>')
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    # Deleting the task will now automatically delete associated completions due to cascade="all, delete-orphan"
    # Completion.query.filter_by(task_id=task.id).delete() # No longer needed
    db.session.delete(task)
    db.session.commit()
    return redirect(url_for('task_list'))

@app.route('/completed_tasks')
def completed_tasks():
    completions = Completion.query.all()
    return render_template('completed_tasks.html', completions=completions, is_home=False)

@app.route('/delete_completion/<int:completion_id>')
def delete_completion(completion_id):
    completion = Completion.query.get_or_404(completion_id)
    db.session.delete(completion)
    db.session.commit()
    return redirect(url_for('completed_tasks'))

@app.route('/shutdown', methods=['GET'])
def shutdown():
    # Simple shutdown by exiting the process
    os._exit(0)  # Forcefully terminates the Flask server process
    return "Server shutting down..."

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True)
