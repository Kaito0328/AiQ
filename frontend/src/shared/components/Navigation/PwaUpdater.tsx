"use client";

import { useEffect } from 'react';
import { useToast } from '@/src/shared/contexts/ToastContext';

/**
 * PWA の更新を監視し、新しいバージョンが利用可能な場合に通知を表示します
 */
export function PwaUpdater() {
    const { showToast } = useToast();

    useEffect(() => {
        if (
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            window.workbox !== undefined
        ) {
            const wb = window.workbox;

            // 新しいバージョンが見つかった時の処理
            const showUpdateToast = () => {
                showToast({
                    message: '新しいバージョンが利用可能です。更新して最新の機能を利用しますか？',
                    variant: 'primary',
                    // Note: 本来は「更新」ボタンをトースト内に置きたいが、簡易化のためメッセージで促す
                });
            };

            wb.addEventListener('waiting', showUpdateToast);
            wb.addEventListener('externalwaiting', showUpdateToast);

            return () => {
                wb.removeEventListener('waiting', showUpdateToast);
                wb.removeEventListener('externalwaiting', showUpdateToast);
            };
        }
    }, [showToast]);

    return null;
}

// Window interface 拡張
declare global {
    interface Window {
        workbox: any;
    }
}
