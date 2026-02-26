import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/shared/utils/cn';
import { BrandColorKey } from '../tokens/keys';

const variantMap: Partial<Record<BrandColorKey, string>> = {
    primary: 'bg-brand-primary',
    secondary: 'bg-brand-secondary',
    danger: 'bg-brand-danger',
    success: 'bg-brand-success',
    warning: 'bg-brand-warning',
    info: 'bg-brand-info',
    heart: 'bg-brand-heart',
};

const dividerVariants = cva('bg-gray-200 shrink-0', {
    variants: {
        orientation: {
            horizontal: 'h-[1px] w-full',
            vertical: 'h-full w-[1px]',
        },
        variant: variantMap,
    },
    defaultVariants: {
        orientation: 'horizontal',
    },
});

export interface DividerProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dividerVariants> { }

/**
 * 内容を視覚的に分離するための区切り線コンポーネントです。
 */
export function Divider({ className, orientation, variant, ...props }: DividerProps) {
    return (
        <div
            className={cn(dividerVariants({ orientation, variant, className }))}
            {...props}
        />
    );
}
