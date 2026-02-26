import React from 'react';
import { cn } from '@/src/shared/utils/cn';
import { View, type ViewProps } from '../primitives/View';

export interface SkeletonProps extends ViewProps { }

/**
 * コンテンツの読み込み中を表示するためのスケルトンコンポーネントです。
 * シマー（キラキラ）アニメーションがデフォルトで適用されます。
 */
export function Skeleton({ className, rounded = 'md', ...props }: SkeletonProps) {
    return (
        <View
            rounded={rounded}
            className={cn(
                'bg-surface-muted relative overflow-hidden',
                'before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/20 dark:before:via-white/10 before:to-transparent',
                className
            )}
            {...props}
        />
    );
}
