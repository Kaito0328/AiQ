import { apiClient } from '@/src/shared/api/apiClient';

export interface AiUsage {
    unitsUsed: number;
    dailyLimit: number;
    isExempt: boolean;
}

export async function getAiUsage(): Promise<AiUsage> {
    return apiClient<AiUsage>('/ai/usage', { authenticated: true });
}
