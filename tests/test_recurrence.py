"""Characterisation tests for task completion and recurrence."""
import pytest
from datetime import date, timedelta
from app import app, db, Task, Completion


class TestOneoffCompletion:
    def test_complete_oneoff_creates_completion_row(self, client):
        today = date.today()
        task = Task(title="Complete me", due_date=today, importance=1, risk=1)
        db.session.add(task)
        db.session.commit()

        client.post(f"/complete_task/{task.id}")

        completion = Completion.query.filter_by(task_id=task.id).first()
        assert completion is not None
        assert completion.scheduled_due_date == today
        assert completion.completed_at is not None

    def test_complete_oneoff_marks_task_completed(self, client):
        today = date.today()
        task = Task(title="Complete me", due_date=today, importance=1, risk=1)
        db.session.add(task)
        db.session.commit()

        client.post(f"/complete_task/{task.id}")

        updated_task = db.session.get(Task, task.id)
        assert updated_task.is_completed is True

    def test_complete_oneoff_removes_from_active_list(self, client):
        today = date.today()
        task = Task(title="Complete me", due_date=today, importance=1, risk=1)
        db.session.add(task)
        db.session.commit()

        client.post(f"/complete_task/{task.id}")

        resp = client.get("/tasks")
        assert b"Complete me" not in resp.data


class TestRecurrentCompletion:
    def test_complete_recurrent_advances_due_date(self, client):
        today = date.today()
        task = Task(title="Recurrent", due_date=today, importance=1, risk=1,
                    is_recurrent=True, recurrence_interval=7)
        db.session.add(task)
        db.session.commit()

        client.post(f"/complete_task/{task.id}")

        updated_task = db.session.get(Task, task.id)
        assert updated_task.due_date == today + timedelta(days=7)

    def test_complete_recurrent_creates_completion_row(self, client):
        today = date.today()
        task = Task(title="Recurrent", due_date=today, importance=1, risk=1,
                    is_recurrent=True, recurrence_interval=7)
        db.session.add(task)
        db.session.commit()

        client.post(f"/complete_task/{task.id}")

        completion = Completion.query.filter_by(task_id=task.id).first()
        assert completion is not None
        assert completion.scheduled_due_date == today
        assert completion.completed_at is not None

    def test_complete_recurrent_remains_active(self, client):
        today = date.today()
        task = Task(title="Recurrent", due_date=today, importance=1, risk=1,
                    is_recurrent=True, recurrence_interval=7)
        db.session.add(task)
        db.session.commit()

        client.post(f"/complete_task/{task.id}")

        resp = client.get("/tasks")
        assert b"Recurrent" in resp.data

    def test_late_completion_anchors_from_scheduled_date(self, client):
        """Scheduled due Aug 1, completed Aug 5, interval=30 -> next due Aug 31."""
        scheduled = date(2026, 8, 1)
        task = Task(title="Late", due_date=scheduled, importance=1, risk=1,
                    is_recurrent=True, recurrence_interval=30)
        db.session.add(task)
        db.session.commit()

        client.post(f"/complete_task/{task.id}")

        updated_task = db.session.get(Task, task.id)
        assert updated_task.due_date == scheduled + timedelta(days=30)

    def test_recurrent_with_30day_interval(self, client):
        today = date.today()
        task = Task(title="Monthly", due_date=today, importance=2, risk=2,
                    is_recurrent=True, recurrence_interval=30)
        db.session.add(task)
        db.session.commit()

        client.post(f"/complete_task/{task.id}")

        updated_task = db.session.get(Task, task.id)
        assert updated_task.due_date == today + timedelta(days=30)


class TestDeleteTask:
    def test_delete_task_removes_completions(self, client):
        today = date.today()
        task = Task(title="Delete me", due_date=today, importance=1, risk=1)
        db.session.add(task)
        db.session.commit()

        client.post(f"/complete_task/{task.id}")
        assert Completion.query.filter_by(task_id=task.id).count() == 1

        client.post(f"/delete_task/{task.id}")
        assert Completion.query.filter_by(task_id=task.id).count() == 0
        assert db.session.get(Task, task.id) is None
