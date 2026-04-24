/**
 * API module.
 * Handles HTTP requests for user management endpoints.
 */

const BASE_URL = "/api/v1";

async function fetchUser(userId, token) {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`fetchUser failed: ${response.status}`);
  }
  return response.json();
}

async function createUser(userData, token) {
  const response = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    throw new Error(`createUser failed: ${response.status}`);
  }
  return response.json();
}

async function deleteUser(userId, token) {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.ok;
}

async function listUsers(page = 1, limit = 20, token) {
  const response = await fetch(
    `${BASE_URL}/users?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  if (!response.ok) {
    throw new Error(`listUsers failed: ${response.status}`);
  }
  return response.json();
}

module.exports = { fetchUser, createUser, deleteUser, listUsers };
