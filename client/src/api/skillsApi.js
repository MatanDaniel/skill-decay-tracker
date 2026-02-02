const BASE = '/api'; // because Vite proxy forwards /api to your backend

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  // If server returns error, show readable message
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed: ${res.status}`);
  }

  // 204 No Content (common for delete) has no JSON body
  if (res.status === 204) return null;

  return res.json();
}

export function getSkills() {
  return request("/skills");
}

export function getSkill(id) {
  return request(`/skills/${id}`);
}

export function createSkill({ name, category }) {
  return request('/skills', {
    method: 'POST',
    body: JSON.stringify({ name, category }),
  });
}

export function deleteSkill(id) {
  return request(`/skills/${id}`, { method: 'DELETE' });
}


export async function practiceSkill(id) {
  const res = await fetch(`/api/skills/${id}/practice`, { method: "PATCH" });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}
