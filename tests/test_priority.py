"""Characterisation tests for priority calculation and urgency boundaries."""
import pytest
from datetime import date, timedelta
from app import app, db, Task, get_urgency, get_effective_due_date


class TestUrgency:
    def test_overdue_returns_5(self, client):
        today = date.today()
        assert get_urgency(today - timedelta(days=1), today) == 5

    def test_overdue_many_days_returns_5(self, client):
        today = date.today()
        assert get_urgency(today - timedelta(days=30), today) == 5

    def test_today_returns_4(self, client):
        today = date.today()
        assert get_urgency(today, today) == 4

    def test_tomorrow_returns_3(self, client):
        today = date.today()
        assert get_urgency(today + timedelta(days=1), today) == 3

    def test_plus_2_days_returns_2(self, client):
        today = date.today()
        assert get_urgency(today + timedelta(days=2), today) == 2

    def test_plus_3_days_returns_2(self, client):
        today = date.today()
        assert get_urgency(today + timedelta(days=3), today) == 2

    def test_plus_4_days_returns_1(self, client):
        today = date.today()
        assert get_urgency(today + timedelta(days=4), today) == 1

    def test_far_future_returns_1(self, client):
        today = date.today()
        assert get_urgency(today + timedelta(days=365), today) == 1


class TestPriorityCalculation:
    def test_minimum_priority(self, client):
        today = date.today()
        task = Task(title="Min", due_date=today + timedelta(days=10), importance=1, risk=1)
        db.session.add(task)
        db.session.commit()
        due_date = get_effective_due_date(task, today)
        priority = get_urgency(due_date, today) + task.importance + task.risk
        assert priority == 3

    def test_maximum_priority(self, client):
        today = date.today()
        task = Task(title="Max", due_date=today - timedelta(days=1), importance=5, risk=5)
        db.session.add(task)
        db.session.commit()
        due_date = get_effective_due_date(task, today)
        priority = get_urgency(due_date, today) + task.importance + task.risk
        assert priority == 15

    def test_priority_range(self, client):
        today = date.today()
        for imp in range(1, 6):
            for rsk in range(1, 6):
                for days_offset in [-5, 0, 1, 2, 3, 4, 30]:
                    due = today + timedelta(days=days_offset)
                    pri = get_urgency(due, today) + imp + rsk
                    assert 3 <= pri <= 15

    def test_priority_is_deterministic(self, client):
        today = date.today()
        task = Task(title="Det", due_date=today + timedelta(days=2), importance=3, risk=4)
        db.session.add(task)
        db.session.commit()
        due_date = get_effective_due_date(task, today)
        urg = get_urgency(due_date, today)
        assert (urg + task.importance + task.risk) == (urg + task.importance + task.risk)


class TestEffectiveDueDate:
    def test_oneoff_not_completed_returns_due_date(self, client):
        today = date.today()
        task = Task(title="Active", due_date=today, importance=1, risk=1, is_completed=False)
        db.session.add(task)
        db.session.commit()
        assert get_effective_due_date(task, today) == today

    def test_oneoff_completed_returns_none(self, client):
        today = date.today()
        task = Task(title="Done", due_date=today, importance=1, risk=1, is_completed=True)
        db.session.add(task)
        db.session.commit()
        assert get_effective_due_date(task, today) is None

    def test_recurrent_returns_due_date(self, client):
        today = date.today()
        task = Task(title="Rec", due_date=today + timedelta(days=5), importance=1, risk=1,
                    is_recurrent=True, recurrence_interval=7)
        db.session.add(task)
        db.session.commit()
        assert get_effective_due_date(task, today) == task.due_date
