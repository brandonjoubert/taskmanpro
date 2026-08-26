import pytest
from app import app, db


@pytest.fixture
def client():
    app.config["TESTING"] = True
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    with app.app_context():
        db.create_all()
        with app.test_client() as client:
            yield client
        db.drop_all()


@pytest.fixture
def app_context():
    with app.app_context():
        db.create_all()
        yield
        db.drop_all()
