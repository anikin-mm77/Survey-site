export function truncate(text, max = 60) {
  if (text == null) return "";
  const s = String(text);
  return s.length > max ? s.slice(0, max - 1) + "…" : s;
}
