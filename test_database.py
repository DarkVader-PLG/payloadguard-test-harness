"""Tests for the Database module."""

import pytest
from src.database import Database, ConnectionPool, QueryBuilder


class TestConnectionPool:
    def test_acquire_returns_connection(self):
        pool = ConnectionPool()
        conn = pool.acquire()
        assert conn is not None
        assert conn["alive"] is True

    def test_release_returns_to_pool(self):
        pool = ConnectionPool()
        conn = pool.acquire()
        pool.release(conn)
        assert pool.available == 1

    def test_max_connections_respected(self):
        pool = ConnectionPool(max_connections=2)
        pool.acquire()
        pool.acquire()
        assert pool.acquire() is None

    def test_close_all_clears_pool(self):
        pool = ConnectionPool()
        conn = pool.acquire()
        pool.release(conn)
        pool.close_all()
        assert pool.available == 0


class TestQueryBuilder:
    def test_simple_select(self):
        q = QueryBuilder("users")
        sql, params = q.build_select()
        assert "SELECT" in sql
        assert "users" in sql
        assert params == []

    def test_where_clause(self):
        q = QueryBuilder("users")
        q.where("id = ?", 42)
        sql, params = q.build_select()
        assert "WHERE" in sql
        assert params == [42]

    def test_delete_query(self):
        q = QueryBuilder("users")
        q.where("active = ?", False)
        sql, params = q.build_delete()
        assert "DELETE" in sql
        assert params == [False]


class TestDatabase:
    def test_connect_returns_true(self):
        db = Database()
        assert db.connect() is True
        assert db.is_connected

    def test_disconnect_closes(self):
        db = Database()
        db.connect()
        db.disconnect()
        assert not db.is_connected

    def test_query_raises_when_not_connected(self):
        db = Database()
        with pytest.raises(RuntimeError):
            db.query("SELECT 1")

    def test_double_connect_is_safe(self):
        db = Database()
        db.connect()
        assert db.connect() is True

    def test_table_returns_query_builder(self):
        db = Database()
        qb = db.table("users")
        assert isinstance(qb, QueryBuilder)
