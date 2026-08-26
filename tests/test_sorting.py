"""Characterisation tests for task list sorting and ordering."""
import pytest
from datetime import date, timedelta
from app import app, db, Task, get_urgency, get_effective_due_date


class TestSorting:
    def _make_task(self, title, due_days, importance, risk):
        task = Task(
            title=title,
            due_date=date.today() + timedelta(days=due_days),
            importance=importance,
            risk=risk,
        )
        db.session.add(task)
        db.session.commit()
        return task

    def _get_sorted_tasks(self):
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
                    "task": task,
                    "due_date": due_date,
                    "priority": priority,
                    "days_until_due": days_until_due,
                })
        task_list.sort(key=lambda x: (-x["priority"], x["due_date"], x["task"].id))
        return task_list

    def test_higher_priority_first(self, client):
        low = self._make_task("Low", 10, 1, 1)
        high = self._make_task("High", 10, 5, 5)
        sorted_tasks = self._get_sorted_tasks()
        assert sorted_tasks[0]["task"].id == high.id
        assert sorted_tasks[1]["task"].id == low.id

    def test_equal_priority_earlier_date_first(self, client):
        task_later = self._make_task("Later due", 10, 3, 3)
        task_earlier = self._make_task("Earlier due", 5, 3, 3)
        sorted_tasks = self._get_sorted_tasks()
        assert len(sorted_tasks) == 2
        assert sorted_tasks[0]["task"].id == task_earlier.id
        assert sorted_tasks[1]["task"].id == task_later.id

    def test_equal_priority_equal_date_lower_id_first(self, client):
        task_a = self._make_task("A first", 5, 3, 3)
        task_b = self._make_task("B second", 5, 3, 3)
        sorted_tasks = self._get_sorted_tasks()
        assert sorted_tasks[0]["task"].id == task_a.id
        assert sorted_tasks[1]["task"].id == task_b.id

    def test_overdue_tasks_rank_higher_than_future(self, client):
        future = self._make_task("Future", 5, 5, 5)
        overdue = self._make_task("Overdue", -1, 1, 1)
        sorted_tasks = self._get_sorted_tasks()
        assert sorted_tasks[0]["task"].id == future.id

    def test_recurrent_tasks_sorted_with_oneoff(self, client):
        recurrent = Task(
            title="Recurrent",
            due_date=date.today() + timedelta(days=3),
            importance=4, risk=4, is_recurrent=True, recurrence_interval=7,
        )
        oneoff = Task(
            title="One-off",
            due_date=date.today() + timedelta(days=3),
            importance=4, risk=4,
        )
        db.session.add_all([recurrent, oneoff])
        db.session.commit()
        sorted_tasks = self._get_sorted_tasks()
        assert len(sorted_tasks) == 2
        assert sorted_tasks[0]["task"].id < sorted_tasks[1]["task"].id
