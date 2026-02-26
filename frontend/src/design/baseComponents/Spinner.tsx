import React from 'react';
import { cn } from '@/src/shared/utils/cn';
import { BrandColorKey } from '../tokens/keys';

export interface SpinnerProps {
    size?: 'sm' | 'md' | 'lg' | 'xl';
    variant?: BrandColorKey;
    className?: string;
    showTrack?: boolean;
}

const sizeMap: Record<string, string> = {
    xs: 'w-3 h-3 border-1',
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4',
};

const textMap: Record<BrandColorKey, string> = {
    primary: 'text-brand-primary',
    secondary: 'text-brand-secondary',
    danger: 'text-brand-danger',
    success: 'text-brand-success',
    warning: 'text-brand-warning',
    info: 'text-brand-info',
    heart: 'text-brand-heart',
};

/**
 * 読み込み中であることを示すスピナーコンポーネントです。
 * 余計な視覚ノイズを削ぎ落とし、回転の滑らかさと美しさを重視したデザインです。
 */
export function Spinner({
    size = 'md',
    variant = 'primary',
    className,
    showTrack = false,
}: SpinnerProps) {
    return (
        <div
            className={cn(
                'relative inline-block animate-spin-custom rounded-full border-solid',
                sizeMap[size],
                textMap[variant],
                // トラックを表示する場合のみ色を付け、それ以外は透明に
                showTrack
                    ? 'border-slate-200 dark:border-slate-800'
                    : 'border-transparent',
                className
            )}
            role="status"
            aria-label="読み込み中"
        >
            {/* 回転するヘッド部分 */}
            <div className={cn(
                'absolute inset-0 border-solid border-t-current rounded-full',
                'border-r-transparent border-b-transparent border-l-transparent',
                // 親の border-X クラス（sizeMapに含まれる）と同じ太さを適用
                (sizeMap[size] || sizeMap.md).split(' ').find(c => c.startsWith('border-'))
            )}
                style={{
                    // 負の margin で親のボーダー位置にぴったり合わせる（太さ分外に出す）
                    margin: '-2px',
                    ...(size === 'lg' && { margin: '-3px' }),
                    ...(size === 'xl' && { margin: '-4px' }),
                }}
            />
            <span className="sr-only">読み込み中...</span>
        </div>
    );
}

/**
 * よりリッチなローディング表示として、3つのドットが跳ねるアニメーションです。
 */
export function LoadingDots({ className }: { className?: string }) {
    return (
        <div className={cn("flex space-x-1 items-center justify-center", className)}>
            <div className="h-2 w-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
            <div className="h-2 w-2 bg-brand-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
            <div className="h-2 w-2 bg-brand-primary rounded-full animate-bounce"></div>
        </div>
    );
}
