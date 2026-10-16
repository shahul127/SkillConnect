const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8001";

export async function api(path, options = {}, token = localStorage.getItem("sc_token")) {
  const headers = { ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...(options.headers || {}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const type = response.headers.get("content-type") || "";
  const data = type.includes("application/json") ? await response.json() : await response.text();
  if (!response.ok) {
    const message = typeof data === "object" ? (data.detail || data.message || "Request failed") : data;
    throw new Error(message || `Request failed (${response.status})`);
  }
  return data;
}
