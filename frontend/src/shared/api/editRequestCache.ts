const CACHE_KEY = "aiq_cached_pending_edit_requests";

type CachedEditRequest = Record<string, unknown>;

export function savePendingEditRequestsCache(requests: CachedEditRequest[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(requests));
  } catch {
    // ignore storage write errors
  }
}

export function loadPendingEditRequestsCache(): CachedEditRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CachedEditRequest[]) : [];
  } catch {
    return [];
  }
}

export function hasPendingEditRequestsCache(): boolean {
  return loadPendingEditRequestsCache().length > 0;
}
