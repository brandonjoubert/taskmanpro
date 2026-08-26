"""Tests for security properties."""
import pytest
from datetime import date
from app import app, db, Task, Completion


class TestPOSTOnlyMutations:
    def test_get_cannot_complete_task(self, client):
        task = Task(title="Test", due_date=date.today(), importance=1, risk=1)
        db.session.add(task)
        db.session.commit()

        resp = client.get(f"/complete_task/{task.id}")
        assert resp.status_code == 405
        assert Completion.query.filter_by(task_id=task.id).count() == 0

    def test_get_cannot_delete_task(self, client):
        task = Task(title="Test", due_date=date.today(), importance=1, risk=1)
        db.session.add(task)
        db.session.commit()

        resp = client.get(f"/delete_task/{task.id}")
        assert resp.status_code == 405
        assert db.session.get(Task, task.id) is not None

    def test_get_cannot_delete_completion(self, client):
        task = Task(title="Test", due_date=date.today(), importance=1, risk=1)
        db.session.add(task)
        db.session.commit()
        client.post(f"/complete_task/{task.id}")
        completion = Completion.query.filter_by(task_id=task.id).first()

        resp = client.get(f"/delete_completion/{completion.id}")
        assert resp.status_code == 405
        assert Completion.query.filter_by(id=completion.id).count() == 1


class TestSafeHTMLRendering:
    def test_xss_in_title_not_executed(self, client):
        xss_payload = '<script>alert("xss")</script>'
        client.post('/add_task', data={
            'title': xss_payload,
            'due_date': date.today().isoformat(),
            'importance': '1',
            'risk': '1',
        })
        resp = client.get('/tasks')
        assert b'<script>' not in resp.data
        assert b'&lt;script&gt;' in resp.data

    def test_xss_in_description_not_executed(self, client):
        xss_payload = '<img src=x onerror=alert(1)>'
        client.post('/add_task', data={
            'title': 'Safe',
            'description': xss_payload,
            'due_date': date.today().isoformat(),
            'importance': '1',
            'risk': '1',
        })
        resp = client.get('/tasks')
        assert b'onerror=alert' not in resp.data


class TestShutdownRemoved:
    def test_shutdown_route_does_not_exist(self, client):
        resp = client.get('/shutdown')
        assert resp.status_code == 404
