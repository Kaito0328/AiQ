"use client";
import { useRouter } from 'next/navigation';
import { useNetworkStatus } from '@/src/shared/contexts/NetworkStatusContext';
import { useToast } from '@/src/shared/contexts/ToastContext';

/**
 * Next.js の useRouter をラップし、オフライン時の遷移トラブル（フリーズ等）を防ぐためのフック。
 */
export function useSafeRouter() {
    const router = useRouter();
    const { isOnline } = useNetworkStatus();
    const { showToast } = useToast();

    const safePush = (href: string, options?: any) => {
        if (!isOnline) {
            const isLikelyCached = 
                href === '/home' || 
                href === '/' || 
                href.startsWith('/home?') ||
                href.includes('/quiz') ||
                href === '/users/official' ||
                href === '/users' ||
                href === '/settings/cache';

            if (!isLikelyCached) {
                showToast({ message: 'オフラインのため、このページへは移動できません', variant: 'danger' });
                return;
            }
        }
        router.push(href, options);
    };

    const safeReplace = (href: string, options?: any) => {
        if (!isOnline && href !== '/home' && href !== '/') {
            showToast({ message: 'オフラインのため、遷移を制限しています', variant: 'danger' });
            return;
        }
        router.replace(href, options);
    };

    return {
        ...router,
        push: safePush,
        replace: safeReplace,
        // prefetch はそのまま通す（内部で既にオフライン考慮されているため）
    };
}
