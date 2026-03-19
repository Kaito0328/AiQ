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
            // オフライン時にキャッシュされている可能性が高いルートの判定を拡張
            const isLikelyCached = 
                href === '/' ||
                href === '/home' || 
                href.startsWith('/home?') ||
                href.startsWith('/users/') ||
                href.startsWith('/collections/') ||
                href.includes('/quiz') ||
                href === '/users/official' ||
                href === '/users' ||
                href === '/settings/cache' ||
                href === '/settings';

            if (!isLikelyCached) {
                showToast({ message: 'オフラインのため、このページへは移動できません', variant: 'danger' });
                return;
            }
        }
        router.push(href, options);
    };

    const safeBack = () => {
        // router.back() は遷移先が不明なため、基本的には実行させるが、
        // 万が一のハング防止のために navigator.onLine をチェックする余地あり。
        // ここでは Next.js の挙動を優先。
        router.back();
    };

    const safeReplace = (href: string, options?: any) => {
        if (!isOnline && !href.startsWith('/home') && href !== '/') {
            showToast({ message: 'オフラインのため、遷移を制限しています', variant: 'danger' });
            return;
        }
        router.replace(href, options);
    };

    return {
        ...router,
        push: safePush,
        replace: safeReplace,
        back: safeBack,
    };
}
