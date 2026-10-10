const apiBase = (import.meta.env.VITE_API_BASE_URL || "http://localhost:5000").replace(/\/$/, "");

export class ApiError extends Error {
  constructor(message, { status = 0, code = "NETWORK_ERROR", fieldErrors = {} } = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export async function apiRequest(path, { method = "GET", body, signal } = {}) {
  let response;
  try {
    response = await fetch(`${apiBase}${path}`, {
      method,
      credentials: "include",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ApiError("Can’t reach the NovaStack API. Check that the backend is running and try again.");
  }
  let payload;
  try { payload = await response.json(); } catch { throw new ApiError("The server returned an unreadable response.", { status: response.status }); }
  if (!response.ok || payload?.success === false) {
    const error = payload?.error || {};
    throw new ApiError(error.message || "The request could not be completed.", { status: response.status, code: error.code, fieldErrors: error.fieldErrors || {} });
  }
  return payload.data;
}

export const api = {
  register: (body) => apiRequest("/api/auth/register", { method: "POST", body }),
  registerAdmin: (body) => apiRequest("/api/auth/admin/register", { method: "POST", body }),
  login: (body) => apiRequest("/api/auth/login", { method: "POST", body }),
  me: () => apiRequest("/api/auth/me"),
  logout: () => apiRequest("/api/auth/logout", { method: "POST", body: {} }),
  createEnquiry: (body) => apiRequest("/api/enquiries", { method: "POST", body }),
  myEnquiries: (page = 1) => apiRequest(`/api/enquiries/mine?page=${page}&limit=20`),
  createContact: (body) => apiRequest("/api/contact", { method: "POST", body }),
  changePassword: (body) => apiRequest("/api/auth/password", { method: "POST", body }),
  services: () => apiRequest("/api/services"),
  service: (slug) => apiRequest(`/api/services/${encodeURIComponent(slug)}`),
  adminDashboard: () => apiRequest("/api/admin/dashboard"),
  adminEnquiries: (params = {}) => apiRequest(`/api/admin/enquiries?${new URLSearchParams(params)}`),
  adminEnquiry: (id) => apiRequest(`/api/admin/enquiries/${encodeURIComponent(id)}`),
  updateAdminEnquiry: (id, body) => apiRequest(`/api/admin/enquiries/${encodeURIComponent(id)}`, { method: "PATCH", body }),
  deleteAdminEnquiry: (id) => apiRequest(`/api/admin/enquiries/${encodeURIComponent(id)}`, { method: "DELETE", body: {} }),
  adminServices: (params = {}) => apiRequest(`/api/admin/services?${new URLSearchParams(params)}`),
  createAdminService: (body) => apiRequest("/api/admin/services", { method: "POST", body }),
  updateAdminService: (id, body) => apiRequest(`/api/admin/services/${encodeURIComponent(id)}`, { method: "PATCH", body }),
  deleteAdminService: (id) => apiRequest(`/api/admin/services/${encodeURIComponent(id)}`, { method: "DELETE", body: {} }),
  adminUsers: (params = {}) => apiRequest(`/api/admin/users?${new URLSearchParams(params)}`),
  adminUser: (id) => apiRequest(`/api/admin/users/${encodeURIComponent(id)}`),
  updateAdminUserStatus: (id, active) => apiRequest(`/api/admin/users/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { active } }),
  adminMessages: (params = {}) => apiRequest(`/api/admin/messages?${new URLSearchParams(params)}`),
  updateAdminMessageRead: (id, read) => apiRequest(`/api/admin/messages/${encodeURIComponent(id)}/read-status`, { method: "PATCH", body: { read } }),
  deleteAdminMessage: (id) => apiRequest(`/api/admin/messages/${encodeURIComponent(id)}`, { method: "DELETE", body: {} }),
};
