"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/design/baseComponents/Button';
import { ChevronLeft } from 'lucide-react';
import { View } from '@/src/design/primitives/View';
import { Container } from '@/src/design/primitives/Container';

/**
 * ページ上部に表示される共通の「戻る」ボタンです。
 */
export function BackButton() {
    const router = useRouter();

    return (
        <View zIndex="docked" className="fixed top-20 left-4">
            <Button
                variant="solid"
                onClick={() => router.back()}
                className="gap-1 px-4 shadow-brand-lg hover:shadow-brand-md transition-all active:scale-95 h-12 rounded-full border-2 border-brand-primary/20 bg-white text-slate-900 font-bold"
            >
                <ChevronLeft size={24} className="text-brand-primary" strokeWidth={3} />
                <span>戻る</span>
            </Button>
        </View>
    );
}
