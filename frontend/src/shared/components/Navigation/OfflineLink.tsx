"use client";

import React from 'react';
import Link from 'next/link';

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
    return (
        <Link href={href} className={className} {...rest}>
            {children}
        </Link>
    );
}
