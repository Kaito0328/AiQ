import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db/db';

export interface SyncStatus {
    isPending: boolean;
    hasError: boolean;
    error: string | null;
    actionId?: number;
}

export function useSyncStatus(entityId: string | undefined): SyncStatus {
    const result = useLiveQuery(async () => {
        if (!entityId) return { isPending: false, hasError: false, error: null };

        const pendingActions = await db.pendingActions.toArray();
        
        const relevantActions = pendingActions.filter(action => {
            const p = action.payload;
            if (!p) return false;
            
            if (p.id === entityId) return true;
            if (p.data?.id === entityId) return true;
            
            if (p.questionId === entityId) return true;
            if (p.data?.questionId === entityId) return true;
            
            if (action.type === 'BATCH_QUESTIONS') {
                if (p.data?.upsertItems?.some((i: any) => i.id === entityId)) return true;
                if (p.data?.deleteIds?.includes(entityId)) return true;
            }

            return false;
        });

        const isPending = relevantActions.some(a => a.status === 'pending');
        const errorAction = relevantActions.find(a => a.status === 'error');

        return {
            isPending,
            hasError: !!errorAction,
            error: errorAction?.errorMessage || null,
            actionId: errorAction?.id
        };
    }, [entityId]);

    return result ?? { isPending: false, hasError: false, error: null };
}
