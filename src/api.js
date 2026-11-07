import { CONFIG } from "./config.js";

function apiUrl(path) {
  if (!CONFIG.API_BASE_URL || CONFIG.API_BASE_URL.includes("YOUR-API-DOMAIN")) {
    throw new Error("Chưa cấu hình API_BASE_URL trong config.js.");
  }
  return new URL(path, CONFIG.API_BASE_URL).toString();
}

async function request(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    method: options.method || "GET",
    credentials: "include",
    headers: {
      "Accept": "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: "no-store",
    redirect: "error"
  });
  const raw = await response.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch { data = { message: "API trả về dữ liệu không hợp lệ." }; }
  if (!response.ok) {
    const message = typeof data.message === "string" ? data.message : `API error (${response.status})`;
    throw new Error(message);
  }
  return data;
}

export const api = {
  login: (payload) => request(CONFIG.ENDPOINTS.login, { method: "POST", body: payload }),
  logout: () => request(CONFIG.ENDPOINTS.logout, { method: "POST", body: {} }),
  friends: () => request(CONFIG.ENDPOINTS.friends),
  moments: () => request(CONFIG.ENDPOINTS.moments),
  profile: () => request(CONFIG.ENDPOINTS.profile),
  upload: async (file, caption = "") => {
    if (!(file instanceof File)) throw new Error("Tệp tải lên không hợp lệ.");
    const form = new FormData();
    form.append("file", file);
    form.append("caption", caption);
    const response = await fetch(apiUrl(CONFIG.ENDPOINTS.upload), {
      method: "POST", credentials: "include", body: form, cache: "no-store", redirect: "error"
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || `Upload lỗi (${response.status})`);
    return data;
  }
};
