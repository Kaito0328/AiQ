import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/shared/utils/cn';
import { BrandColorKey, RadiusKey } from '../tokens/keys';

const variantMap: Record<BrandColorKey, string> = {
    primary: 'bg-brand-primary/10 text-brand-primary border-brand-primary/20',
    secondary: 'bg-brand-secondary/10 text-brand-secondary border-brand-secondary/20',
    danger: 'bg-brand-danger/10 text-brand-danger border-brand-danger/20',
    success: 'bg-brand-success/10 text-brand-success border-brand-success/20',
    heart: 'bg-brand-heart/10 text-brand-heart border-brand-heart/20',
    warning: 'bg-brand-warning/10 text-brand-warning border-brand-warning/20',
    info: 'bg-brand-info/10 text-brand-info border-brand-info/20',
};

const badgeVariants = cva(
    'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
    {
        variants: {
            variant: variantMap,
            rounded: {
                none: 'rounded-none',
                sm: 'rounded-brand-sm',
                md: 'rounded-brand-md',
                lg: 'rounded-brand-lg',
                full: 'rounded-brand-full',
            },
        },
        defaultVariants: {
            variant: 'primary',
            rounded: 'full',
        },
    }
);

export interface BadgeProps
    extends Omit<React.HTMLAttributes<HTMLDivElement>, 'color'>,
    VariantProps<typeof badgeVariants> { }

/**
 * ステータスやカテゴリなどの小さな情報を表示するためのバッジコンポーネントです。
 */
export function Badge({ className, variant, rounded, ...props }: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant, rounded, className }))} {...props} />
    );
}
