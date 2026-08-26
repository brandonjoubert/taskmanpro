# Taskman Pro

A simple task management application that prioritizes work based on urgency, importance, and risk.

## How It Works

1. **You state the task, due date, importance, and risk.**
2. **Taskman Pro calculates urgency automatically and ranks your workload.**

### Priority Formula

```
Priority = Urgency + Importance + Risk
```

- **Urgency** (automatic): 5 = overdue, 4 = today, 3 = tomorrow, 2 = within 3 days, 1 = later
- **Importance** (you choose): 1-5 scale from "minimal impact" to "critical for success"
- **Risk** (you choose): 1-5 scale from "no consequences" to "critical impact"

Priority range: 3 (lowest) to 15 (highest).

Tasks are sorted by priority (highest first), then due date (earliest first), then task ID (lowest first).

### Task Types

- **One-off tasks**: Complete once, then done.
- **Recurrent tasks**: Complete to advance the next due date by the configured interval. Recurrence anchors from the scheduled due date, not the completion date.

## Installation

```bash
# Clone the repository
git clone <repository-url>
cd taskmanpro

# Create and activate virtual environment
python3 -m venv venv
source venv/bin/activate  # Linux/macOS
# .\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt

# Run the application
python app.py
```

The app starts at `http://localhost:5000` and redirects to the task list.

## Development

Enable debug mode:

```bash
FLASK_DEBUG=1 python app.py
```

Run tests:

```bash
pip install pytest
python -m pytest tests/ -v
```

## Security

- All state-changing operations use POST (complete, delete, edit).
- User input is HTML-escaped before rendering.
- Debug mode is disabled by default.
- Server-side validation on all inputs.
- No browser-accessible shutdown endpoint.

## Project Structure

```
taskmanpro/
├── app.py              # Flask application (routes, models, validation)
├── requirements.txt    # Python dependencies
├── templates/          # Jinja2 HTML templates
├── static/             # Static assets
├── tests/              # Automated test suite
│   ├── test_priority.py      # Urgency and priority calculation
│   ├── test_sorting.py       # Task list ordering
│   ├── test_recurrence.py    # Completion and recurrence behavior
│   ├── test_validation.py    # Server-side input validation
│   └── test_security.py      # POST-only mutations, XSS prevention
└── instance/
    └── tasks.db        # SQLite database (auto-created)
```

## Database Schema

### Task

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| title | VARCHAR(100) | Task name |
| description | TEXT | Optional notes |
| is_recurrent | BOOLEAN | Recurrent task flag |
| due_date | DATE | Next due date |
| recurrence_interval | INTEGER | Days between occurrences (0 = one-off) |
| importance | INTEGER | 1-5 importance rating |
| risk | INTEGER | 1-5 risk rating |
| is_completed | BOOLEAN | Permanent completion flag (one-off only) |
| created_at | DATETIME | Creation timestamp |
| updated_at | DATETIME | Last update timestamp |

### Completion

| Column | Type | Description |
|---|---|---|
| id | INTEGER | Primary key |
| task_id | INTEGER | Foreign key to task |
| scheduled_due_date | DATE | Which occurrence was satisfied |
| completed_at | DATETIME | When the user completed it |

## Author

Brandon Joubert

&copy; 2026 Gensix Technology. All rights reserved.
