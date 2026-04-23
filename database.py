"""
Database module.
Handles connection management, query execution, and transaction control.
"""

from typing import Any, Optional
from contextlib import contextmanager


class ConnectionPool:
    """Simple connection pool for managing database connections."""

    def __init__(self, max_connections: int = 10):
        self.max_connections = max_connections
        self._pool: list[dict] = []
        self._active: int = 0

    def acquire(self) -> Optional[dict]:
        if self._pool:
            self._active += 1
            return self._pool.pop()
        if self._active < self.max_connections:
            self._active += 1
            return {"id": self._active, "alive": True}
        return None

    def release(self, connection: dict) -> None:
        if connection and connection.get("alive"):
            self._pool.append(connection)
            self._active = max(0, self._active - 1)

    def close_all(self) -> int:
        count = len(self._pool)
        self._pool.clear()
        self._active = 0
        return count

    @property
    def available(self) -> int:
        return len(self._pool)

    @property
    def active(self) -> int:
        return self._active


class QueryBuilder:
    """Builds parameterised SQL queries."""

    def __init__(self, table: str):
        self.table = table
        self._conditions: list[str] = []
        self._params: list[Any] = []

    def where(self, condition: str, *params) -> "QueryBuilder":
        self._conditions.append(condition)
        self._params.extend(params)
        return self

    def build_select(self, columns: str = "*") -> tuple[str, list]:
        query = f"SELECT {columns} FROM {self.table}"
        if self._conditions:
            query += " WHERE " + " AND ".join(self._conditions)
        return query, self._params

    def build_delete(self) -> tuple[str, list]:
        query = f"DELETE FROM {self.table}"
        if self._conditions:
            query += " WHERE " + " AND ".join(self._conditions)
        return query, self._params


class Database:
    """
    Core database interface.
    Manages connections, executes queries, and handles transactions.
    """

    def __init__(self, host: str = "localhost", port: int = 5432, name: str = "app"):
        self.host = host
        self.port = port
        self.name = name
        self.pool = ConnectionPool()
        self._connected = False

    def connect(self) -> bool:
        if self._connected:
            return True
        conn = self.pool.acquire()
        if conn is None:
            return False
        self._connected = True
        return True

    def disconnect(self) -> None:
        self._connected = False
        self.pool.close_all()

    def query(self, sql: str, params: Optional[list] = None) -> list[dict]:
        if not self._connected:
            raise RuntimeError("Not connected to database")
        # Simulate query execution
        return []

    def execute(self, sql: str, params: Optional[list] = None) -> int:
        if not self._connected:
            raise RuntimeError("Not connected to database")
        return 0

    @contextmanager
    def transaction(self):
        if not self._connected:
            raise RuntimeError("Not connected to database")
        try:
            yield self
        except Exception:
            self._rollback()
            raise
        else:
            self._commit()

    def _commit(self) -> None:
        pass

    def _rollback(self) -> None:
        pass

    def table(self, name: str) -> QueryBuilder:
        return QueryBuilder(name)

    @property
    def is_connected(self) -> bool:
        return self._connected
