/**
 * API module.
 * Handles HTTP requests for user management endpoints.
 */

const BASE_URL = "/api/v1";

/**
 * Deletes a user by ID.
 * @param {string} userId
 * @param {string} token - Auth token
 * @returns {Promise<boolean>}
 */
async function deleteUser(userId, token) {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.ok;
}

/**
 * Updates a user's profile.
 * @param {string} userId
 * @param {object} updates
 * @param {string} token
 * @returns {Promise<object>}
 */
async function updateUser(userId, updates, token) {
  const response = await fetch(`${BASE_URL}/users/${userId}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(updates),
  });
  if (!response.ok) {
    throw new Error(`updateUser failed: ${response.status}`);
  }
  return response.json();
}

/**
 * Lists all users (paginated).
 * @param {number} page
 * @param {number} limit
 * @param {string} token
 * @returns {Promise<object>}
 */
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

module.exports = { deleteUser, updateUser, listUsers };
