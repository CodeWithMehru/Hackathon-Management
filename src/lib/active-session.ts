/** Current registration/check-in session name (e.g. "Day 1", "Opening Ceremony"). */
export const ACTIVE_SESSION_STORAGE_KEY = "activeSession";

export function getActiveSession(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY)?.trim() ?? "";
}

export function setActiveSession(name: string) {
  if (typeof window === "undefined") return;
  const trimmed = name.trim();
  if (!trimmed) return;
  window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, trimmed);
  window.dispatchEvent(new Event("hackathon-active-session-changed"));
}
