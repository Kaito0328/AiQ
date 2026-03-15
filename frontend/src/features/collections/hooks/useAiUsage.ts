import { useState, useEffect, useCallback } from 'react';
import { getAiUsage, AiUsage } from '../api/ai';
import { logger } from '@/src/shared/utils/logger';

export function useAiUsage() {
    const [usage, setUsage] = useState<AiUsage | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getAiUsage();
            setUsage(data);
            setError(null);
        } catch (err) {
            logger.error('Failed to fetch AI usage', err);
            setError(err instanceof Error ? err : new Error('Failed to fetch AI usage'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    return { usage, isLoading, error, refresh };
}
