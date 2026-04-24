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

async function searchUsers(query, token) {
  const response = await fetch(`${BASE_URL}/users/search?q=${encodeURIComponent(query)}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`searchUsers failed: ${response.status}`);
  }
  return response.json();
}

async function getUserRoles(userId, token) {
  const response = await fetch(`${BASE_URL}/users/${userId}/roles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`getUserRoles failed: ${response.status}`);
  }
  return response.json();
}

async function assignRole(userId, role, token) {
  const response = await fetch(`${BASE_URL}/users/${userId}/roles`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ role }),
  });
  if (!response.ok) {
    throw new Error(`assignRole failed: ${response.status}`);
  }
  return response.json();
}

async function revokeRole(userId, role, token) {
  const response = await fetch(`${BASE_URL}/users/${userId}/roles/${role}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.ok;
}

async function getUserPermissions(userId, token) {
  const response = await fetch(`${BASE_URL}/users/${userId}/permissions`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`getUserPermissions failed: ${response.status}`);
  }
  return response.json();
}

async function lockUser(userId, token) {
  const response = await fetch(`${BASE_URL}/users/${userId}/lock`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.ok;
}

async function unlockUser(userId, token) {
  const response = await fetch(`${BASE_URL}/users/${userId}/unlock`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.ok;
}

async function resetPassword(userId, token) {
  const response = await fetch(`${BASE_URL}/users/${userId}/password-reset`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`resetPassword failed: ${response.status}`);
  }
  return response.json();
}

async function getAuditLog(userId, token) {
  const response = await fetch(`${BASE_URL}/users/${userId}/audit`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`getAuditLog failed: ${response.status}`);
  }
  return response.json();
}

async function exportUsers(format, token) {
  const response = await fetch(`${BASE_URL}/users/export?format=${format}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error(`exportUsers failed: ${response.status}`);
  }
  return response.blob();
}

async function importUsers(file, token) {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`${BASE_URL}/users/import`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`importUsers failed: ${response.status}`);
  }
  return response.json();
}

module.exports = {
  fetchUser,
  createUser,
  deleteUser,
  updateUser,
  listUsers,
  searchUsers,
  getUserRoles,
  assignRole,
  revokeRole,
  getUserPermissions,
  lockUser,
  unlockUser,
  resetPassword,
  getAuditLog,
  exportUsers,
  importUsers,
};
