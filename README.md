# Taskman Pro

## Description

Taskman Pro is a simple web-based task management application built with Python and Flask. It allows users to manage both one-off and recurrent tasks, prioritizing them based on urgency, importance, and risk.

## Features

*   **Task Management:** Add, view, edit, complete, and delete tasks.
*   **Task Types:** Supports both one-off tasks and recurrent tasks with configurable intervals (in days).
*   **Prioritization:** Automatically calculates a priority score based on:
    *   **Urgency:** How soon the task is due.
    *   **Importance:** User-defined importance score.
    *   **Risk:** User-defined risk score associated with not completing the task.
*   **Task List:** Displays separate lists for one-off and recurrent tasks, sorted by priority and due date. Highlights overdue tasks and tasks due soon.
*   **Completion Tracking:** Tracks completed task instances (for history, viewable on a separate page). Recurrent tasks automatically advance to their next due date upon completion.
*   **Web Interface:** Simple and clean interface using Bootstrap 5.
*   **Home Page:** Displays application information and branding.
*   **Shutdown:** Includes a simple mechanism to stop the Flask development server via a link in the navigation bar.

## Project Structure

```
/home/brandon/taskman_pro/
├── app.py                  # Main Flask application file (routes, logic, DB models)
├── launch_taskman_pro.sh   # Script to activate venv and run the app
├── flask_output.log        # Log file for background process output (created by launch script)
├── icon.png                # Application icon (not currently used by web app)
├── taskman.jpg             # Image file (moved to static/) - Should be in static/
├── README.md               # This file
├── instance/
│   └── tasks.db            # SQLite database file (created automatically)
├── static/
│   └── taskman.jpg         # Static image file for the home page
├── templates/
│   ├── base.html           # Base HTML template with navbar and structure
│   ├── index.html          # Home page template
│   ├── task_list.html      # Template for displaying task lists
│   ├── add_task.html       # Template for the add task form
│   ├── edit_task.html      # Template for the edit task form
│   └── completed_tasks.html # Template for viewing completion history
└── venv/                   # Python virtual environment directory
```

## Setup Instructions

1.  **Prerequisites:**
    *   Python 3 installed.
    *   `pip` (Python package installer) installed.
    *   A web browser (e.g., Google Chrome, Firefox).

2.  **Get the Code:** Obtain the project files (e.g., clone the repository or copy the directory). Ensure you have all files *except* the `venv` directory and potentially the `instance` directory (the database will be recreated).

3.  **Navigate to Project Directory:**
    ```bash
    cd /path/to/taskman_pro
    ```
    (Replace `/path/to/` with the actual path, e.g., `/home/brandon/`)

4.  **Create Virtual Environment:** It's highly recommended to use a virtual environment to isolate dependencies.
    ```bash
    python3 -m venv venv
    ```

5.  **Activate Virtual Environment:**
    *   On Linux/macOS:
        ```bash
        source venv/bin/activate
        ```
    *   On Windows:
        ```bash
        .\venv\Scripts\activate
        ```
    You should see `(venv)` prepended to your command prompt.

6.  **Install Dependencies:** Install the required Python packages.
    ```bash
    pip install Flask Flask-SQLAlchemy
    ```

## Running the Application

There are two main ways to run the application:

**Method 1: Using the Launch Script (Recommended for background running)**

This script activates the environment, starts the Flask server in the background (`nohup`), logs output to `flask_output.log`, and attempts to open the application in Google Chrome.

```bash
./launch_taskman_pro.sh
```
*Note: Ensure the script has execute permissions (`chmod +x launch_taskman_pro.sh`).*

**Method 2: Running Manually (Foreground, shows output directly)**

1.  Ensure the virtual environment is activated (`source venv/bin/activate`).
2.  Run the Flask development server:
    ```bash
    python app.py
    ```
3.  The application will be available at `http://localhost:5000` in your web browser. Press `Ctrl+C` in the terminal to stop the server.

## Dependencies

*   **Python 3**
*   **Flask**: Web framework.
*   **Flask-SQLAlchemy**: SQLAlchemy integration for Flask (database ORM).
*   **SQLAlchemy**: Database toolkit (installed as a dependency of Flask-SQLAlchemy).

These are installed via `pip install Flask Flask-SQLAlchemy`.

## Database

The application uses a SQLite database file named `tasks.db` located in the `instance` subdirectory. This file is created automatically by Flask/SQLAlchemy the first time the application is run (`db.create_all()` in `app.py`).

## Author & Copyright

*   **Author:** Brandon Joubert
*   **Copyright:** &copy; 2024 Gensix Technology. All rights reserved. (Year dynamically updated)
