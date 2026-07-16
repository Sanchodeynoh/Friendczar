const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const TOKEN_KEY = "friendczar_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request(path, { method = "GET", body, isMultipart = false } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (!isMultipart && body) headers["Content-Type"] = "application/json";

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isMultipart ? body : body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export const api = {
  // Auth
  signup: (payload) => request("/api/auth/signup", { method: "POST", body: payload }),
  login: (payload) => request("/api/auth/login", { method: "POST", body: payload }),
  me: () => request("/api/auth/me"),

  // Profiles
  discover: (params = {}) => {
    const query = new URLSearchParams(Object.entries(params).filter(([, v]) => v !== undefined && v !== "")).toString();
    return request(`/api/profiles${query ? `?${query}` : ""}`);
  },
  myProfile: () => request("/api/profiles/me"),
  updateMyProfile: (payload) => request("/api/profiles/me", { method: "PUT", body: payload }),
  getProfile: (id) => request(`/api/profiles/${id}`),
  uploadAvatar: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/api/profiles/me/avatar", { method: "POST", body: form, isMultipart: true });
  },
  deleteAvatar: () => request("/api/profiles/me/avatar", { method: "DELETE" }),

  // Media
  uploadMedia: (file) => {
    const form = new FormData();
    form.append("file", file);
    return request("/api/media", { method: "POST", body: form, isMultipart: true });
  },
  deleteMedia: (id) => request(`/api/media/${id}`, { method: "DELETE" }),

  // Likes
  toggleLike: (userId) => request(`/api/likes/${userId}`, { method: "POST" }),
  likesReceived: () => request("/api/likes/received"),

  // Comments
  getComments: (userId) => request(`/api/comments/${userId}`),
  addComment: (userId, text) => request(`/api/comments/${userId}`, { method: "POST", body: { text } }),

  // Messages
  getThreads: () => request("/api/messages/threads"),
  getThread: (otherUserId) => request(`/api/messages/threads/${otherUserId}`),
  sendMessage: (otherUserId, { text, file }) => {
    const form = new FormData();
    if (text) form.append("text", text);
    if (file) form.append("file", file);
    return request(`/api/messages/threads/${otherUserId}`, { method: "POST", body: form, isMultipart: true });
  },
  togglePinThread: (threadId) => request(`/api/messages/threads/${threadId}/pin`, { method: "PATCH" }),
  deleteThread: (threadId) => request(`/api/messages/threads/${threadId}`, { method: "DELETE" }),

  // Reports
  fileReport: (targetId, reason) => request("/api/reports", { method: "POST", body: { targetId, reason } }),

  // Notifications
  getNotifications: () => request("/api/notifications"),
  getUnreadCount: () => request("/api/notifications/unread-count"),
  markAllNotificationsRead: () => request("/api/notifications/read-all", { method: "PATCH" }),
  markNotificationRead: (id) => request(`/api/notifications/${id}/read`, { method: "PATCH" }),

  // Admin
  adminStats: () => request("/api/admin/stats"),
  adminUsers: () => request("/api/admin/users"),
  adminSetUserStatus: (id, status) => request(`/api/admin/users/${id}/status`, { method: "PATCH", body: { status } }),
  adminReports: () => request("/api/admin/reports"),
  adminResolveReport: (id, action) => request(`/api/admin/reports/${id}`, { method: "PATCH", body: { action } }),
  adminPendingMedia: () => request("/api/admin/media/pending"),
  adminApproveMedia: (id) => request(`/api/admin/media/${id}/approve`, { method: "PATCH" }),
  adminDeleteMedia: (id) => request(`/api/admin/media/${id}`, { method: "DELETE" }),
};
