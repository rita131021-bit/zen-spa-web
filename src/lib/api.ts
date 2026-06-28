const defaultApiBaseUrl = "https://zen-spa-backend-production-df4d.up.railway.app";
const apiBaseUrl = (import.meta.env.VITE_API_URL || defaultApiBaseUrl).replace(/\/$/, "");

export function apiUrl(path: string) {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${apiBaseUrl}${normalizedPath}`;
}

export function mediaUrl(path: string | null | undefined) {
  if (!path || !path.startsWith("/api/")) return path ?? "";
  return apiUrl(path);
}
