const API_BASE = '/api';

async function parseJsonOrThrow(res) {
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error((data && data.error) ? data.error : `Request failed (${res.status})`);
  }
  return data;
}

// Roster API
async function getRosterGroups() {
  const res = await fetch(`${API_BASE}/roster/groups`);
  return res.json();
}

async function createRosterGroup(name) {
  const res = await fetch(`${API_BASE}/roster/groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return res.json();
}

async function updateRosterGroup(id, name) {
  const res = await fetch(`${API_BASE}/roster/groups/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
  });
  return res.json();
}

async function deleteRosterGroup(id) {
  const res = await fetch(`${API_BASE}/roster/groups/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

// Colleagues API
async function getRosterColleagues() {
  const res = await fetch(`${API_BASE}/roster/colleagues`);
  return res.json();
}

async function createRosterColleague(name, employeeId) {
  const res = await fetch(`${API_BASE}/roster/colleagues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, employee_id: employeeId })
  });
  return res.json();
}

async function updateRosterColleague(id, name, employeeId) {
  const res = await fetch(`${API_BASE}/roster/colleagues/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, employee_id: employeeId })
  });
  return res.json();
}

async function deleteRosterColleague(id) {
  const res = await fetch(`${API_BASE}/roster/colleagues/${id}`, {
    method: 'DELETE'
  });
  return parseJsonOrThrow(res);
}

// Sessions API
async function apiGetAllSessions() {
  const res = await fetch(`${API_BASE}/sessions`);
  return res.json();
}

async function apiCreateSession(name, submissionDeadline) {
  const res = await fetch(`${API_BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, submission_deadline: submissionDeadline })
  });
  return res.json();
}

async function getSession(id) {
  const res = await fetch(`${API_BASE}/sessions/${id}`);
  return res.json();
}

async function updateSessionDeadline(id, submissionDeadline) {
  const res = await fetch(`${API_BASE}/sessions/${id}/deadline`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ submission_deadline: submissionDeadline })
  });
  return res.json();
}

async function updateSessionSettings(id, settings) {
  const res = await fetch(`${API_BASE}/sessions/${id}/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings)
  });
  return res.json();
}

async function apiDeleteSession(id) {
  const res = await fetch(`${API_BASE}/sessions/${id}`, { method: 'DELETE' });
  return parseJsonOrThrow(res);
}

async function assignColleaguesToSession(sessionId, colleagueIds) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/assign-colleagues`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ colleague_ids: colleagueIds })
  });
  return res.json();
}

async function assignGroupsToSession(sessionId, groupIds) {
  const res = await fetch(`${API_BASE}/sessions/${sessionId}/assign-groups`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ group_ids: groupIds })
  });
  return res.json();
}

// Menu API
async function getMenuItems(sessionId) {
  const res = await fetch(`${API_BASE}/menu/sessions/${sessionId}`);
  return res.json();
}

async function createMenuItem(sessionId, name, itemType) {
  const res = await fetch(`${API_BASE}/menu/sessions/${sessionId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item_type: itemType, name })
  });
  return res.json();
}

async function addMenuItem(sessionId, itemType, name) {
  // Alias for createMenuItem (legacy name)
  return createMenuItem(sessionId, name, itemType);
}

async function deleteMenuItemApi(id) {
  const res = await fetch(`${API_BASE}/menu/items/${id}`, {
    method: 'DELETE'
  });
  return parseJsonOrThrow(res);
}

async function deleteMenuItem(id) {
  // Alias for deleteMenuItemApi (legacy name)
  return deleteMenuItemApi(id);
}

// Sweetness and Ice API
async function getSweetnessLevels(sessionId) {
  const res = await fetch(`${API_BASE}/menu/sessions/${sessionId}/sweetness-levels`);
  return res.json();
}

async function createSweetness(sessionId, level) {
  const res = await fetch(`${API_BASE}/menu/sessions/${sessionId}/sweetness-levels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level })
  });
  return res.json();
}

async function deleteSweetness(id) {
  const res = await fetch(`${API_BASE}/menu/sweetness-levels/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

async function setSweetnessLevels(sessionId, levels) {
  const res = await fetch(`${API_BASE}/menu/sessions/${sessionId}/sweetness-levels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ levels })
  });
  return res.json();
}

async function getIceLevels(sessionId) {
  const res = await fetch(`${API_BASE}/menu/sessions/${sessionId}/ice-levels`);
  return res.json();
}

async function createIce(sessionId, level) {
  const res = await fetch(`${API_BASE}/menu/sessions/${sessionId}/ice-levels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ level })
  });
  return res.json();
}

async function deleteIce(id) {
  const res = await fetch(`${API_BASE}/menu/ice-levels/${id}`, {
    method: 'DELETE'
  });
  return res.json();
}

async function setIceLevels(sessionId, levels) {
  const res = await fetch(`${API_BASE}/menu/sessions/${sessionId}/ice-levels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ levels })
  });
  return res.json();
}

// Submission API
async function submitOrder(sessionId, colleagueId, items) {
  const res = await fetch(`${API_BASE}/submissions/sessions/${sessionId}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ colleague_id: colleagueId, items })
  });
  return res.json();
}

async function getSessionSubmissions(sessionId) {
  const res = await fetch(`${API_BASE}/submissions/sessions/${sessionId}`);
  return res.json();
}

async function apiDeleteSubmission(submissionId) {
  const res = await fetch(`${API_BASE}/submissions/${submissionId}`, { method: 'DELETE' });
  return parseJsonOrThrow(res);
}

// Statistics API
async function getFoodSummary(sessionId) {
  const res = await fetch(`${API_BASE}/statistics/sessions/${sessionId}/food-summary`);
  return res.json();
}

async function getDrinkSummary(sessionId) {
  const res = await fetch(`${API_BASE}/statistics/sessions/${sessionId}/drink-summary`);
  return res.json();
}

async function exportStatistics(sessionId, format = 'csv') {
  window.location.href = `${API_BASE}/statistics/sessions/${sessionId}/export?format=${format}`;
}
