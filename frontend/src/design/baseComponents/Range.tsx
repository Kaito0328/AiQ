import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/shared/utils/cn';
import { BrandColorKey } from '../tokens/keys';

const variantMap: Partial<Record<BrandColorKey, string>> = {
    primary: 'accent-brand-primary',
    danger: 'accent-brand-danger',
    success: 'accent-brand-success',
    warning: 'accent-brand-warning',
    info: 'accent-brand-info',
};

const rangeVariants = cva(
    'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-brand-primary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2',
    {
        variants: {
            variant: variantMap,
        },
        defaultVariants: {
            variant: 'primary',
        },
    }
);

export interface RangeProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'color'>,
    VariantProps<typeof rangeVariants> { }

/**
 * 連続的な数値の範囲から値を選択するためのスライダーコンポーネントです。
 */
export const Range = React.forwardRef<HTMLInputElement, RangeProps>(
    ({ className, variant, ...props }, ref) => {
        return (
            <input
                ref={ref}
                type="range"
                className={cn(rangeVariants({ variant, className }))}
                {...props}
            />
        );
    }
);

Range.displayName = 'Range';
