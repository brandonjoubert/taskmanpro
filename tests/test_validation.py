"""Tests for server-side validation."""
import pytest
from datetime import date
from app import app, db, Task


class TestValidation:
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
        assert b'4' in resp.data  # importance preserved
        assert b'2' in resp.data  # risk preserved
