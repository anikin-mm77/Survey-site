import { getToken } from "./session";

const BASE = import.meta.env.VITE_API_URL || "/api";

export async function request(path, { method = "GET", body, headers, signal } = {}) {
  const h = { "Content-Type": "application/json", ...(headers || {}) };
  const t = getToken();
  if (t) h.Authorization = `Bearer ${t}`;

  const r = await fetch(`${BASE}${path}`, {
    method,
    signal,
    headers: h,
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!r.ok) {
    const text = await r.text().catch(() => "");
    throw new Error(`${method} ${path} failed: ${r.status} ${text}`);
  }
  return r.json();
}
