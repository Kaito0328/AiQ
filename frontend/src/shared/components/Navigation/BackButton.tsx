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
                variant="solid"
                onClick={() => router.back()}
                className="gap-1 px-3 sm:px-4 shadow-brand-lg hover:shadow-brand-md transition-all active:scale-95 h-10 sm:h-12 rounded-full border-2 border-brand-primary/20 bg-white text-slate-900 font-bold"
            >
                <ChevronLeft size={20} className="sm:w-6 sm:h-6 text-brand-primary" strokeWidth={3} />
                <span className="text-xs sm:text-base">戻る</span>
            </Button>
        </View>
    );
}
