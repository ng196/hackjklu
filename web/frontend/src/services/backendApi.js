const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || `Request failed (${response.status})`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function listUsers() {
  return request('/users');
}

export async function seedDemoUsers(forceRegenerate = false) {
  return request('/users/demo/seed-many', {
    method: 'POST',
    body: JSON.stringify({ forceRegenerate }),
  });
}

export async function getDashboardContext(userId) {
  return request(`/users/${userId}/dashboard-context`);
}

export { API_BASE_URL };
