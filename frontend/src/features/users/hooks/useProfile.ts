import { useState, useEffect } from 'react';
import { UserProfile } from '@/src/entities/user';
import { getProfile } from '../../auth/api';

export function useProfile(userId: string | undefined) {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = async () => {
        if (!userId) return;
        setLoading(true);
        try {
            const data = await getProfile(userId);
            setProfile(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch profile');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refresh();
    }, [userId]);

    return { profile, loading, error, refresh };
}
