const TOKEN_KEY = 'admin_token';
const ROLE_KEY  = 'user_role';
const BIZ_KEY   = 'client_biz';

export const getToken    = () => localStorage.getItem(TOKEN_KEY);
export const getRole     = () => localStorage.getItem(ROLE_KEY);
export const getClientBiz= () => JSON.parse(localStorage.getItem(BIZ_KEY) || 'null');

export function setSession(token, role, biz = null) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(ROLE_KEY, role);
  if (biz) localStorage.setItem(BIZ_KEY, JSON.stringify(biz));
  else localStorage.removeItem(BIZ_KEY);
}

export function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
  localStorage.removeItem(BIZ_KEY);
}

function authHeaders() {
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${getToken()}` };
}

// ── Admin login ──────────────────────────────────────────────────────────
export async function adminLogin(password) {
  const res  = await fetch('/admin/api/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  setSession(data.token, 'admin');
  return data;
}

// ── Client login ─────────────────────────────────────────────────────────
export async function clientLogin(businessId, password) {
  const res  = await fetch('/client/api/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ business_id: businessId, password }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Login failed');
  setSession(data.token, 'client', { id: data.business_id, name: data.business_name });
  return data;
}

// ── Admin API calls ───────────────────────────────────────────────────────
export async function fetchBusinesses() {
  const res = await fetch('/admin/api/businesses', { headers: authHeaders() });
  if (res.status === 401) { clearSession(); window.location.reload(); }
  return res.json();
}

export async function createBusiness(data) {
  const res = await fetch('/admin/api/businesses', {
    method: 'POST', headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchStats(businessId) {
  const role = getRole();
  const url  = role === 'client'
    ? '/client/api/stats'
    : '/admin/api/stats' + (businessId ? `?business_id=${businessId}` : '');
  const res = await fetch(url, { headers: authHeaders() });
  return res.json();
}

export async function fetchBookings(businessId, status, search) {
  const role = getRole();
  const base = role === 'client' ? '/client/api/bookings?' : '/admin/api/bookings?';
  let url = base;
  if (role !== 'client' && businessId) url += `business_id=${businessId}&`;
  if (status) url += `status=${status}&`;
  if (search) url += `search=${encodeURIComponent(search)}&`;
  const res = await fetch(url, { headers: authHeaders() });
  return res.json();
}

// ── Schedule ──────────────────────────────────────────────────────────────
export async function fetchSchedule() {
  const res = await fetch('/client/api/schedule', { headers: authHeaders() });
  return res.json();
}

export async function updateSchedule(data) {
  const res = await fetch('/client/api/schedule', {
    method: 'PUT', headers: authHeaders(),
    body: JSON.stringify(data),
  });
  return res.json();
}

// ── Leaves ────────────────────────────────────────────────────────────────
export async function fetchLeaves() {
  const res = await fetch('/client/api/leaves', { headers: authHeaders() });
  return res.json();
}

export async function addLeave(date, reason) {
  const res = await fetch('/client/api/leaves', {
    method: 'POST', headers: authHeaders(),
    body: JSON.stringify({ date, reason }),
  });
  return res.json();
}

export async function deleteLeave(id) {
  const res = await fetch(`/client/api/leaves/${id}`, {
    method: 'DELETE', headers: authHeaders(),
  });
  return res.json();
}

export async function cancelBooking(id) {
  const role = getRole();
  const url  = role === 'client'
    ? `/client/api/bookings/${id}/cancel`
    : `/admin/api/bookings/${id}/cancel`;
  await fetch(url, { method: 'POST', headers: authHeaders() });
}
