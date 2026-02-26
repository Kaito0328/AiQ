import React from 'react';
import { cn } from '@/src/shared/utils/cn';
import { SpacingKey } from '../tokens/keys';

const gapMap: Record<SpacingKey, string> = {
    none: 'gap-0',
    xs: 'gap-1',
    sm: 'gap-2',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
};

/**
 * Tailwind はビルド時にクラス名を静的に解析するため、
 * `grid-cols-${n}` のような動的生成はパージされてしまいます。
 * 安全なクラス名マッピングを事前定義します。
 */
const colsMap: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
    5: 'grid-cols-5',
    6: 'grid-cols-6',
    12: 'grid-cols-12',
};

const responsiveColsMap: Record<string, Record<number, string>> = {
    sm: { 1: 'sm:grid-cols-1', 2: 'sm:grid-cols-2', 3: 'sm:grid-cols-3', 4: 'sm:grid-cols-4', 5: 'sm:grid-cols-5', 6: 'sm:grid-cols-6' },
    md: { 1: 'md:grid-cols-1', 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4', 5: 'md:grid-cols-5', 6: 'md:grid-cols-6' },
    lg: { 1: 'lg:grid-cols-1', 2: 'lg:grid-cols-2', 3: 'lg:grid-cols-3', 4: 'lg:grid-cols-4', 5: 'lg:grid-cols-5', 6: 'lg:grid-cols-6' },
    xl: { 1: 'xl:grid-cols-1', 2: 'xl:grid-cols-2', 3: 'xl:grid-cols-3', 4: 'xl:grid-cols-4', 5: 'xl:grid-cols-5', 6: 'xl:grid-cols-6' },
};

export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
    cols?: number | { sm?: number; md?: number; lg?: number; xl?: number };
    gap?: SpacingKey;
    align?: 'start' | 'center' | 'end' | 'stretch';
}

/**
 * CSS Grid を使用した柔軟なグリッドレイアウトコンポーネントです。
 */
export function Grid({
    className,
    cols = 1,
    gap = 'md',
    align = 'stretch',
    ...props
}: GridProps) {
    const colClasses = typeof cols === 'number'
        ? (colsMap[cols] || `grid-cols-${cols}`)
        : cn(
            cols.sm && (responsiveColsMap.sm[cols.sm] || `sm:grid-cols-${cols.sm}`),
            cols.md && (responsiveColsMap.md[cols.md] || `md:grid-cols-${cols.md}`),
            cols.lg && (responsiveColsMap.lg[cols.lg] || `lg:grid-cols-${cols.lg}`),
            cols.xl && (responsiveColsMap.xl[cols.xl] || `xl:grid-cols-${cols.xl}`)
        );

    return (
        <div
            className={cn(
                'grid',
                colClasses,
                gapMap[gap],
                align === 'start' && 'items-start',
                align === 'center' && 'items-center',
                align === 'end' && 'items-end',
                align === 'stretch' && 'items-stretch',
                className
            )}
            {...props}
        />
    );
}
