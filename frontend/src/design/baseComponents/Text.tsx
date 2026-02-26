import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/shared/utils/cn';
import { TextColorKey, FontWeightKey, TextAlignKey } from '../tokens/keys';

const colorMap: Record<TextColorKey, string> = {
    default: 'text-foreground',
    primary: 'text-brand-primary',
    secondary: 'text-slate-500',
    danger: 'text-brand-danger',
    success: 'text-brand-success',
    muted: 'text-gray-500',
    white: 'text-white',
    inherit: 'text-inherit',
    warning: 'text-brand-warning',
    info: 'text-brand-info',
};

const weightMap: Record<FontWeightKey, string> = {
    light: 'font-light',
    normal: 'font-normal',
    medium: 'font-medium',
    semibold: 'font-semibold',
    bold: 'font-bold',
};

const alignMap: Record<TextAlignKey, string> = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
};

const textVariants = cva('transition-colors', {
    variants: {
        variant: {
            h1: 'text-3xl sm:text-4xl md:text-5xl font-bold',
            h2: 'text-2xl sm:text-3xl md:text-4xl font-bold',
            h3: 'text-xl sm:text-2xl md:text-3xl font-semibold',
            h4: 'text-lg sm:text-xl md:text-2xl font-semibold',
            body: 'text-base sm:text-lg md:text-xl',
            detail: 'text-sm sm:text-base md:text-lg',
            xs: 'text-xs sm:text-sm md:text-base',
        },
        color: colorMap,
        weight: weightMap,
        align: alignMap,
    },
    defaultVariants: {
        variant: 'body',
        color: 'default',
        weight: 'normal',
        align: 'left',
    },
});

export interface TextProps
    extends Omit<React.HTMLAttributes<HTMLElement>, 'color'>,
    VariantProps<typeof textVariants> {
    as?: React.ElementType;
    span?: boolean;
}

/**
 * テキストを表示するための基本コンポーネントです。
 * 意味のあるバリアントを使用して、タイポグラフィの一貫性を保ちます。
 */
export const Text = React.forwardRef<HTMLElement, TextProps>(
    ({ className, variant, color, weight, align, as, span, ...props }, ref) => {
        // span prop が true の場合は強制的に span タグを使用し、
        // そうでない場合は as で指定されたタグ（デフォルトは p）を使用します。
        const Component = span ? 'span' : (as || 'p');

        return (
            <Component
                ref={ref}
                className={cn(textVariants({ variant, color, weight, align, className }))}
                {...props}
            />
        );
    }
);

Text.displayName = 'Text';
