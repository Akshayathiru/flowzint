export function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const raw = document.cookie
      .split("; ")
      .find((row) => row.startsWith("mm_user="))
      ?.split("=")?.[1];
    return raw ? JSON.parse(decodeURIComponent(raw)) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  document.cookie = "mm_auth=; max-age=0; path=/";
  document.cookie = "mm_user=; max-age=0; path=/";
}
