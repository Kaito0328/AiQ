"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/src/design/baseComponents/Button';
import { ChevronLeft } from 'lucide-react';
import { View } from '@/src/design/primitives/View';
import { cn } from '@/src/shared/utils/cn';

/**
 * ページ上部に表示される共通の「戻る」ボタンです。
 */
export function BackButton({ className }: { className?: string }) {
    const router = useRouter();

    return (
        <View className={cn("fixed top-20 left-4 z-[100]", className)}>
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="gap-1.5 px-2 hover:bg-brand-primary/5 transition-all active:scale-95 h-10 rounded-full text-brand-primary font-bold"
            >
                <ChevronLeft size={22} strokeWidth={2.5} />
                <span className="text-sm">戻る</span>
            </Button>
        </View>
    );
}
