let token = localStorage.getItem("auth_token") || null;
export function setToken(t) {
  token = t || null;
  if (token) localStorage.setItem("auth_token", token);
  else localStorage.removeItem("auth_token");
}
export function getToken() {
  return token;
}
