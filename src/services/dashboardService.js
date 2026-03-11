const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

function getToken() {
  return localStorage.getItem("ire_auth_token");
}

function authHeaders(extra = {}) {
  const headers = { "Content-Type": "application/json", ...extra };
  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

// ─── Dashboard API ──────────────────────────────────────────────────────────

export async function fetchDashboard() {
  const res = await fetch(`${BACKEND_URL}/api/dashboard`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load dashboard");
  return data.data;
}

export async function fetchHistory(page = 1, limit = 10) {
  const res = await fetch(
    `${BACKEND_URL}/api/dashboard/history?page=${page}&limit=${limit}`,
    { headers: authHeaders() }
  );
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load history");
  return data;
}

export async function fetchSavedInternships() {
  const res = await fetch(`${BACKEND_URL}/api/dashboard/saved`, {
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to load saved internships");
  return data.data;
}

export async function saveInternship(internshipId, score, breakdown, reasoning) {
  const res = await fetch(`${BACKEND_URL}/api/dashboard/save`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ internshipId, score, breakdown, reasoning }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to save");
  return data.data;
}

export async function removeSavedInternship(savedId) {
  const res = await fetch(`${BACKEND_URL}/api/dashboard/saved/${savedId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to remove");
  return data;
}

// ─── Skill Gap API ──────────────────────────────────────────────────────────

export async function fetchSkillGapAnalysis(profile) {
  const res = await fetch(`${BACKEND_URL}/api/skill-gap`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(profile),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Skill gap analysis failed");
  return data.data;
}

// ─── Resume Upload API ──────────────────────────────────────────────────────

export async function uploadResume(file) {
  const formData = new FormData();
  formData.append("resume", file);

  const token = getToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BACKEND_URL}/api/resume/upload`, {
    method: "POST",
    headers,
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Resume upload failed");
  return data.data;
}
