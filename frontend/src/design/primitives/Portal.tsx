"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
    children: React.ReactNode;
    id?: string;
}

/**
 * 子要素を body の直下にレンダリングするためのコンポーネントです。
 * z-index のスタッキングコンテキスト問題を回避するために使用します。
 */
export function Portal({ children, id = 'portal-root' }: PortalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        let el = document.getElementById(id);
        if (!el) {
            el = document.createElement('div');
            el.id = id;
            document.body.appendChild(el);
        }

        return () => {
            // 他に Portal が残っていないかチェックし、なければ削除することも検討できますが、
            // 一般的には残しておいても問題ありません。
        };
    }, [id]);

    if (!mounted) return null;

    const portalRoot = document.getElementById(id);
    if (!portalRoot) return null;

    return createPortal(children, portalRoot);
}
