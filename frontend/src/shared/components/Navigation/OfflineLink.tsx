"use client";

import React from 'react';
import Link from 'next/link';

/**
 * Next.js の <Link> をラップし、実際のオフライン時は window.location.href で
 * フルページナビゲーションを行うコンポーネント。
 *
 * 実際のオフライン (navigator.onLine === false) 時に Next.js の <Link> を使うと、
 * RSC データの取得でハングし UI がフリーズする。この問題を回避するために、
 * 実際のオフライン時は Service Worker のナビゲーションキャッシュを直接利用する
 * フルナビゲーションにフォールバックする。
 */
export function OfflineLink({
    href,
    children,
    className,
    ...rest
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; children: React.ReactNode }) {
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
            e.preventDefault();
            window.location.href = href;
        }
        // オンライン時は Link のデフォルト挙動（クライアントサイドナビゲーション）をそのまま使う
    };

    return (
        <Link href={href} className={className} onClick={handleClick} {...rest}>
            {children}
        </Link>
    );
}
