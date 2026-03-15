import { useState, useEffect } from 'react';
import { UserProfile } from '@/src/entities/user';
import { getProfile } from '../../auth/api';
import { ApiError } from '@/src/shared/api/error';
import { saveOfflineProfile, getOfflineProfile } from '@/src/shared/api/offlineApi';
import { mergePendingProfile } from '@/src/shared/api/mergePendingActions';
import { logger } from '@/src/shared/utils/logger';

export function useProfile(userId: string | undefined) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    const refresh = async () => {
        if (!userId) return;
        setLoading(true);
        setIsOffline(false);
        try {
            const data = await getProfile(userId);
            const merged = await mergePendingProfile(data);
            setProfile(merged);
            setError(null);
            // 成功時にキャッシュを更新
            if (data) {
                saveOfflineProfile(data).catch(err => logger.error('Failed to cache profile', err));
            }
        } catch (err) {
            if (err instanceof ApiError && (err.status === 503 || err.status === 0)) {
                setIsOffline(true);
                // オフライン時は IndexedDB から取得を試みる
                const cached = await getOfflineProfile(userId);
                const merged = await mergePendingProfile(cached || null);
                setProfile(merged);
            } else {
                setError(err instanceof Error ? err.message : 'Failed to fetch profile');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [userId]);

    return { profile, loading, error, isOffline, refresh };
}
