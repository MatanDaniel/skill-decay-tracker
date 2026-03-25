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


export function practiceSkill(id) {
  return request(`/skills/${id}/practice`, { method: "PATCH" });
}


// Notes
export function getNotes(skillId) {
  return request(`/skills/${skillId}/notes`);
}
export function addNote(skillId, content) {
  return request(`/skills/${skillId}/notes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content }),
  });
}
export function deleteNote(skillId, noteId) {
  return request(`/skills/${skillId}/notes/${noteId}`, { method: "DELETE" });
}

// Questions
export function getQuestions(skillId) {
  return request(`/skills/${skillId}/questions`);
}
export function addQuestion(skillId, question, answer) {
  return request(`/skills/${skillId}/questions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question, answer }),
  });
}
export function updateQuestion(skillId, questionId, patch) {
  return request(`/skills/${skillId}/questions/${questionId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
}
export function deleteQuestion(skillId, questionId) {
  return request(`/skills/${skillId}/questions/${questionId}`, { method: "DELETE" });
}

// Sessions
export function getSessions(skillId) {
  return request(`/skills/${skillId}/sessions`);
}
export function addSession(skillId, minutes) {
  return request(`/skills/${skillId}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ minutes }),
  });
}


// Progress History
// -------------------------

// Get all readiness-score history rows for one skill
export function getProgressHistory(skillId) {
  // Reuse the same request() helper and BASE constant as the rest of the file
  return request(`/skills/${skillId}/progress-history`);
}

// Add a new readiness-score snapshot for one skill
export function addProgressHistory(skillId, readinessScore) {
  return request(`/skills/${skillId}/progress-history`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ readiness_score: readinessScore }),
  });
}

