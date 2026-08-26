"""Tests for server-side validation."""
import pytest
from datetime import date
from app import app, db, Task


class TestAddTaskValidation:
    def _post_task(self, client, **kwargs):
        data = {
            'title': 'Test',
            'due_date': date.today().isoformat(),
            'importance': '3',
            'risk': '3',
            'recurrence_interval': '0',
        }
        data.update(kwargs)
        return client.post('/add_task', data=data, follow_redirects=True)

    def test_blank_title_rejected(self, client):
        resp = self._post_task(client, title='')
        assert b'Title is required' in resp.data

    def test_title_over_100_chars_rejected(self, client):
        resp = self._post_task(client, title='x' * 101)
        assert b'100 characters or fewer' in resp.data

    def test_invalid_date_rejected(self, client):
        resp = self._post_task(client, due_date='not-a-date')
        assert b'Invalid date format' in resp.data

    def test_missing_date_rejected(self, client):
        resp = self._post_task(client, due_date='')
        assert b'Due date is required' in resp.data

    def test_importance_zero_rejected(self, client):
        resp = self._post_task(client, importance='0')
        assert b'between 1 and 5' in resp.data

    def test_importance_six_rejected(self, client):
        resp = self._post_task(client, importance='6')
        assert b'between 1 and 5' in resp.data

    def test_risk_zero_rejected(self, client):
        resp = self._post_task(client, risk='0')
        assert b'between 1 and 5' in resp.data

    def test_risk_six_rejected(self, client):
        resp = self._post_task(client, risk='6')
        assert b'between 1 and 5' in resp.data

    def test_negative_recurrence_rejected(self, client):
        resp = self._post_task(client, is_recurrent='on', recurrence_interval='-1')
        assert b'at least 1 day' in resp.data

    def test_zero_recurrence_when_recurrent_rejected(self, client):
        resp = self._post_task(client, is_recurrent='on', recurrence_interval='0')
        assert b'at least 1 day' in resp.data

    def test_valid_task_accepted(self, client):
        resp = self._post_task(client, title='Valid task')
        assert b'Valid task' in resp.data
        assert Task.query.filter_by(title='Valid task').count() == 1

    def test_form_preserves_values_on_error(self, client):
        resp = self._post_task(client, title='', importance='4', risk='2')
        assert b'4' in resp.data
        assert b'2' in resp.data


class TestEditTaskValidation:
    def _create_task(self, client):
        client.post('/add_task', data={
            'title': 'Original',
            'due_date': date.today().isoformat(),
            'importance': '3',
            'risk': '3',
            'recurrence_interval': '0',
        })
        return Task.query.filter_by(title='Original').first()

    def _patch_task(self, client, task_id, **kwargs):
        data = {
            'title': 'Updated',
            'due_date': date.today().isoformat(),
            'importance': '3',
            'risk': '3',
            'recurrence_interval': '0',
        }
        data.update(kwargs)
        return client.post(f'/edit_task/{task_id}', data=data, follow_redirects=True)

    def test_blank_title_rejected(self, client):
        task = self._create_task(client)
        resp = self._patch_task(client, task.id, title='')
        assert b'Title is required' in resp.data

    def test_title_over_100_chars_rejected(self, client):
        task = self._create_task(client)
        resp = self._patch_task(client, task.id, title='x' * 101)
        assert b'100 characters or fewer' in resp.data

    def test_invalid_date_rejected(self, client):
        task = self._create_task(client)
        resp = self._patch_task(client, task.id, due_date='not-a-date')
        assert b'Invalid date format' in resp.data

    def test_importance_zero_rejected(self, client):
        task = self._create_task(client)
        resp = self._patch_task(client, task.id, importance='0')
        assert b'between 1 and 5' in resp.data

    def test_risk_six_rejected(self, client):
        task = self._create_task(client)
        resp = self._patch_task(client, task.id, risk='6')
        assert b'between 1 and 5' in resp.data

    def test_valid_edit_accepted(self, client):
        task = self._create_task(client)
        resp = self._patch_task(client, task.id, title='Updated')
        assert b'Updated' in resp.data
        assert Task.query.get(task.id).title == 'Updated'

    def test_form_preserves_values_on_error(self, client):
        task = self._create_task(client)
        resp = self._patch_task(client, task.id, title='', importance='5', risk='1')
        assert b'5' in resp.data
        assert b'1' in resp.data
