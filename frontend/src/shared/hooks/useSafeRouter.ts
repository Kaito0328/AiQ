"use client";
import { useRouter } from 'next/navigation';
import { useNetworkStatus } from '@/src/shared/contexts/NetworkStatusContext';
import { useToast } from '@/src/shared/contexts/ToastContext';

/**
 * Next.js の useRouter をラップし、オフライン時の遷移トラブル（フリーズ等）を防ぐためのフック。
 *
 * 【重要な設計判断】
 * マニュアルオフライン: navigator.onLine は true → Next.js の router.push が正常に動く
 * 実際のオフライン:    navigator.onLine は false → Next.js の router.push は RSC データ取得で
 *                     ハング・フリーズする。そのため window.location.href による「フルナビゲーション」
 *                     を使い、Service Worker のキャッシュから直接ページを取得する。
 */
export function useSafeRouter() {
    const router = useRouter();
    const { isOnline, isManualOffline } = useNetworkStatus();
    const { showToast } = useToast();

    /** ブラウザのネットワークが実際に切断されているかどうか */
    const isReallyOffline = typeof navigator !== 'undefined' && !navigator.onLine;

    const safePush = (href: string, options?: any) => {
        if (!isOnline) {
            // オフライン時にキャッシュされている可能性が高いルートの判定
            const isLikelyCached =
                href === '/' ||
                href === '/home' ||
                href.startsWith('/home?') ||
                href.startsWith('/users/') ||
                href.startsWith('/collections/') ||
                href.startsWith('/collection-sets/') ||
                href.includes('/quiz') ||
                href === '/users/official' ||
                href === '/users' ||
                href === '/settings/cache' ||
                href === '/settings' ||
                href === '/settings/sync' ||
                href === '/credits';

            if (!isLikelyCached) {
                showToast({ message: 'オフラインのため、このページへは移動できません', variant: 'danger' });
                return;
            }

            // 実際のオフライン時: Next.js のクライアントルーティングを迂回し、
            // Service Worker のナビゲーションキャッシュを直接使う
            if (isReallyOffline) {
                window.location.href = href;
                return;
            }
        }
        // オンライン or マニュアルオフライン（ネットワーク自体は接続中）→ 通常のルーティング
        router.push(href, options);
    };

    const safeBack = () => {
        if (isReallyOffline) {
            // 実際のオフライン時: ブラウザの履歴戻りを使用（RSCフェッチを回避）
            window.history.back();
            return;
        }
        router.back();
    };

    const safeReplace = (href: string, options?: any) => {
        if (!isOnline && !href.startsWith('/home') && href !== '/') {
            showToast({ message: 'オフラインのため、遷移を制限しています', variant: 'danger' });
            return;
        }
        if (isReallyOffline) {
            window.location.replace(href);
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
