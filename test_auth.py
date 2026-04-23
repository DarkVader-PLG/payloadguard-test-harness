"""Tests for the Auth module."""

import pytest
from src.auth import Auth, PasswordValidator, SessionManager


class TestSessionManager:
    def test_create_returns_token(self):
        sm = SessionManager()
        token = sm.create("user1")
        assert isinstance(token, str)
        assert len(token) == 64

    def test_validate_valid_token(self):
        sm = SessionManager()
        token = sm.create("user1")
        assert sm.validate(token) == "user1"

    def test_revoke_invalidates_token(self):
        sm = SessionManager()
        token = sm.create("user1")
        sm.revoke(token)
        assert sm.validate(token) is None

    def test_revoke_all_clears_user_sessions(self):
        sm = SessionManager()
        sm.create("user1")
        sm.create("user1")
        count = sm.revoke_all("user1")
        assert count == 2


class TestPasswordValidator:
    def test_short_password_fails(self):
        v = PasswordValidator()
        ok, msg = v.validate_strength("Ab1")
        assert not ok

    def test_strong_password_passes(self):
        v = PasswordValidator()
        ok, _ = v.validate_strength("Secure123")
        assert ok

    def test_hash_and_verify(self):
        v = PasswordValidator()
        hashed, salt = v.hash("mypassword")
        assert v.verify("mypassword", hashed, salt)
        assert not v.verify("wrongpassword", hashed, salt)


class TestAuth:
    def test_register_and_login(self):
        auth = Auth()
        assert auth.register("alice", "Secure123")
        token = auth.login("alice", "Secure123")
        assert token is not None

    def test_login_wrong_password(self):
        auth = Auth()
        auth.register("alice", "Secure123")
        assert auth.login("alice", "Wrong999") is None

    def test_logout_invalidates_session(self):
        auth = Auth()
        auth.register("alice", "Secure123")
        token = auth.login("alice", "Secure123")
        auth.logout(token)
        assert auth.authenticate(token) is None

    def test_duplicate_register_fails(self):
        auth = Auth()
        auth.register("alice", "Secure123")
        assert not auth.register("alice", "Secure123")

    def test_deactivate_blocks_login(self):
        auth = Auth()
        auth.register("alice", "Secure123")
        auth.deactivate("alice")
        assert auth.login("alice", "Secure123") is None
