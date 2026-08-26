from flask import Flask, render_template, request, redirect, url_for, Response, flash
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, date, timedelta
from markupsafe import Markup, escape
import os

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tasks.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)


def nl2br(value):
    if value is None:
        return ''
    return Markup(str(escape(value)).replace('\n', '<br>'))


app.jinja_env.filters['nl2br'] = nl2br


class Task(db.Model):
    id = db.Column(db.types.Integer, primary_key=True)
    title = db.Column(db.types.String(100), nullable=False)
    description = db.Column(db.types.String)
    is_recurrent = db.Column(db.types.Boolean, default=False)
    due_date = db.Column(db.types.Date, nullable=False)
    recurrence_interval = db.Column(db.types.Integer, default=0)
    importance = db.Column(db.types.Integer, nullable=False)
    risk = db.Column(db.types.Integer, nullable=False)
    is_completed = db.Column(db.types.Boolean, default=False, nullable=False)
    created_at = db.Column(db.types.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.types.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    completions = db.relationship('Completion', backref='task', lazy=True, cascade="all, delete-orphan")


class Completion(db.Model):
    id = db.Column(db.types.Integer, primary_key=True)
    task_id = db.Column(db.types.Integer, db.ForeignKey('task.id'), nullable=False)
    scheduled_due_date = db.Column(db.types.Date, nullable=False)
    completed_at = db.Column(db.types.DateTime, nullable=False)


def get_effective_due_date(task, today):
    if task.is_recurrent and task.recurrence_interval > 0:
        return task.due_date
    else:
        if task.is_completed:
            return None
        else:
            return task.due_date


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


def validate_task_form(form):
    errors = {}
    title = form.get('title', '').strip()
    if not title:
        errors['title'] = 'Title is required.'
    elif len(title) > 100:
        errors['title'] = 'Title must be 100 characters or fewer.'

    due_date_str = form.get('due_date', '')
    due_date = None
    if not due_date_str:
        errors['due_date'] = 'Due date is required.'
    else:
        try:
            due_date = datetime.strptime(due_date_str, '%Y-%m-%d').date()
        except ValueError:
            errors['due_date'] = 'Invalid date format.'

    importance_str = form.get('importance', '')
    try:
        importance = int(importance_str)
        if importance < 1 or importance > 5:
            errors['importance'] = 'Importance must be between 1 and 5.'
    except (ValueError, TypeError):
        errors['importance'] = 'Importance is required.'
        importance = None

    risk_str = form.get('risk', '')
    try:
        risk = int(risk_str)
        if risk < 1 or risk > 5:
            errors['risk'] = 'Risk must be between 1 and 5.'
    except (ValueError, TypeError):
        errors['risk'] = 'Risk is required.'
        risk = None

    is_recurrent = 'is_recurrent' in form
    recurrence_interval = 0
    if is_recurrent:
        try:
            recurrence_interval = int(form.get('recurrence_interval', '0'))
            if recurrence_interval < 1:
                errors['recurrence_interval'] = 'Recurrence interval must be at least 1 day for recurrent tasks.'
        except (ValueError, TypeError):
            errors['recurrence_interval'] = 'Invalid recurrence interval.'

    description = form.get('description', '').strip() or None

    if errors:
        return None, errors

    return {
        'title': title,
        'description': description,
        'is_recurrent': is_recurrent,
        'due_date': due_date,
        'recurrence_interval': recurrence_interval,
        'importance': importance,
        'risk': risk,
    }, {}


@app.route('/')
def index():
    return redirect(url_for('task_list'))


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
                'days_until_due': days_until_due,
            })
    task_list.sort(key=lambda x: (-x['priority'], x['due_date'], x['task'].id))
    return render_template('task_list.html', task_list=task_list, today=today, is_home=False)


@app.route('/add_task', methods=['GET', 'POST'])
def add_task():
    if request.method == 'POST':
        data, errors = validate_task_form(request.form)
        if errors:
            return render_template('add_task.html', is_home=False, errors=errors, form=request.form)
        new_task = Task(
            title=data['title'],
            description=data['description'],
            is_recurrent=data['is_recurrent'],
            due_date=data['due_date'],
            recurrence_interval=data['recurrence_interval'],
            importance=data['importance'],
            risk=data['risk'],
        )
        db.session.add(new_task)
        db.session.commit()
        return redirect(url_for('task_list'))
    return render_template('add_task.html', is_home=False, errors={}, form={})


@app.route('/complete_task/<int:task_id>', methods=['POST'])
def complete_task(task_id):
    task = Task.query.get_or_404(task_id)
    today = date.today()
    current_due_date = get_effective_due_date(task, today)

    if current_due_date:
        completion = Completion(
            task_id=task.id,
            scheduled_due_date=current_due_date,
            completed_at=datetime.utcnow(),
        )
        db.session.add(completion)

        if task.is_recurrent and task.recurrence_interval > 0:
            task.due_date = current_due_date + timedelta(days=task.recurrence_interval)
            task.updated_at = datetime.utcnow()
        else:
            task.is_completed = True
            task.updated_at = datetime.utcnow()

        db.session.commit()

    return redirect(url_for('task_list'))


@app.route('/edit_task/<int:task_id>', methods=['GET', 'POST'])
def edit_task(task_id):
    task = Task.query.get_or_404(task_id)
    if request.method == 'POST':
        data, errors = validate_task_form(request.form)
        if errors:
            return render_template('edit_task.html', task=task, is_home=False, errors=errors, form=request.form)
        task.title = data['title']
        task.description = data['description']
        task.is_recurrent = data['is_recurrent']
        task.due_date = data['due_date']
        task.recurrence_interval = data['recurrence_interval']
        task.importance = data['importance']
        task.risk = data['risk']
        task.updated_at = datetime.utcnow()
        db.session.commit()
        return redirect(url_for('task_list'))
    return render_template('edit_task.html', task=task, is_home=False, errors={}, form={})


@app.route('/delete_task/<int:task_id>', methods=['POST'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return redirect(url_for('task_list'))


@app.route('/completed_tasks')
def completed_tasks():
    completions = Completion.query.order_by(Completion.completed_at.desc()).all()
    return render_template('completed_tasks.html', completions=completions, is_home=False)


@app.route('/delete_completion/<int:completion_id>', methods=['POST'])
def delete_completion(completion_id):
    completion = Completion.query.get_or_404(completion_id)
    db.session.delete(completion)
    db.session.commit()
    return redirect(url_for('completed_tasks'))


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=os.environ.get('FLASK_DEBUG', '0') == '1')
