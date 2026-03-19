import { UserProfile } from "@/src/entities/user";
import { getProfile } from "../../auth/api";
import {
  saveOfflineProfile,
  getOfflineProfile,
} from "@/src/shared/api/offlineApi";
import { mergePendingProfile } from "@/src/shared/api/mergePendingActions";
import { useSWRData } from "@/src/shared/hooks/useSWRData";

export function useProfile(userId: string | undefined) {
  const result = useSWRData<UserProfile>({
    cacheReader: async () => {
      if (!userId) return null;
      const cached = await getOfflineProfile(userId);
      if (cached) {
        return await mergePendingProfile(cached);
      }

      // Fallback for own profile: auth cache may exist in localStorage before Dexie sync.
      if (typeof window !== "undefined") {
        const raw = localStorage.getItem("aiq_user_profile");
        if (raw) {
          try {
            const authCached = JSON.parse(raw) as UserProfile;
            if (authCached?.id === userId) {
              return await mergePendingProfile(authCached);
            }
          } catch {
            // ignore parse errors and continue as cache-miss
          }
        }
      }

      return null;
    },
    fetcher: async () => {
      if (!userId) throw new Error("userId is required");
      const data = await getProfile(userId);
      return (await mergePendingProfile(data))!;
    },
    cacheWriter: async (data) => {
      await saveOfflineProfile(data);
    },
    enabled: !!userId,
    deps: [userId],
  });

  return {
    profile: result.data,
    loading: result.loading,
    error: result.error,
    isOffline: result.isOffline,
    isStale: result.isStale,
    isRevalidating: result.isRevalidating,
    refresh: result.refresh,
  };
}
