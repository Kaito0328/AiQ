import { getApiBaseUrl } from "@/src/shared/api/apiClient";

let warmupPromise: Promise<boolean> | null = null;
let lastWarmupAt = 0;
const WARMUP_TTL_MS = 60 * 1000;

export async function pingServer(timeoutMs: number = 4000): Promise<boolean> {
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return false;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(`${getApiBaseUrl()}/health`, {
      method: "GET",
      cache: "no-store",
      signal: controller.signal,
    });
    return response.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timeoutId);
  }
}

export function warmupServer(): Promise<boolean> {
  const now = Date.now();
  if (warmupPromise && now - lastWarmupAt < WARMUP_TTL_MS) {
    return warmupPromise;
  }

  lastWarmupAt = now;
  warmupPromise = pingServer();
  return warmupPromise;
}
