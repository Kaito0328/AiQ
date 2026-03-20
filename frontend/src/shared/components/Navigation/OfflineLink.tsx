"use client";

import React from 'react';
import Link from 'next/link';
import { useSafeRouter } from '@/src/shared/hooks/useSafeRouter';

/**
 * Next.js の <Link> のオフライン対応ラッパー。
 * 
 * カスタム Service Worker (worker/index.ts) が RSC 取得失敗をキャッシュ応答や
 * 空レスポンスで処理するため、通常の <Link> と同じ動作で安全に使用できる。
 * 将来的にオフライン特有の処理が必要になった場合の拡張ポイント。
 */
export function OfflineLink({
    href,
    children,
    className,
    ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode }) {
    const router = useSafeRouter();

    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        rest.onClick?.(e);
        if (e.defaultPrevented) return;

        // 新規タブや修飾キー操作はブラウザ標準に委ねる
        if (
            rest.target === '_blank' ||
            e.metaKey ||
            e.ctrlKey ||
            e.shiftKey ||
            e.altKey ||
            e.button !== 0
        ) {
            return;
        }

        // 内部遷移のみ safe router で制御
        if (!href.startsWith('http://') && !href.startsWith('https://')) {
            e.preventDefault();
            void router.push(href);
        }
    };

    return (
        <Link href={href} className={className} onClick={handleClick} {...rest}>
            {children}
        </Link>
    );
}
