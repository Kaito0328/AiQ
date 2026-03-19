import { UserProfile } from '@/src/entities/user';
import { getProfile } from '../../auth/api';
import { saveOfflineProfile, getOfflineProfile } from '@/src/shared/api/offlineApi';
import { mergePendingProfile } from '@/src/shared/api/mergePendingActions';
import { useSWRData } from '@/src/shared/hooks/useSWRData';

export function useProfile(userId: string | undefined) {
    const result = useSWRData<UserProfile>({
        cacheReader: async () => {
            if (!userId) return null;
            const cached = await getOfflineProfile(userId);
            return await mergePendingProfile(cached || null);
        },
        fetcher: async () => {
            if (!userId) throw new Error('userId is required');
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
