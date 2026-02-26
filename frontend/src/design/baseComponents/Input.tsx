import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/shared/utils/cn';
import { RadiusKey } from '../tokens/keys';

const radiusMap: Record<RadiusKey, string> = {
    none: 'rounded-none',
    sm: 'rounded-brand-sm',
    md: 'rounded-brand-md',
    lg: 'rounded-brand-lg',
    full: 'rounded-brand-full',
};

const inputVariants = cva(
    'w-full transition-all outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            variant: {
                default: 'border border-gray-300 bg-surface-base focus:border-brand-primary focus:ring-brand-primary/20',
                error: 'border-brand-danger focus:ring-brand-danger/20',
            },
            size: {
                sm: 'px-2 py-1 text-sm',
                md: 'px-3 py-2 text-base',
                lg: 'px-4 py-3 text-lg',
            },
            rounded: radiusMap,
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
            rounded: 'md',
        },
    }
);

export interface InputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement> & React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size' | 'color'>,
    VariantProps<typeof inputVariants> {
    multeline?: boolean;
}

/**
 * ユーザー入力を受け付けるための基本コンポーネントです。
 * `multeline` プロパティを有効にすることで textarea として動作します。
 */
export const Input = React.forwardRef<HTMLInputElement | HTMLTextAreaElement, InputProps>(
    ({ className, variant, size, rounded, multeline = false, ...props }, ref) => {
        const Component = multeline ? 'textarea' : 'input';

        return (
            <Component
                ref={ref as any}
                className={cn(inputVariants({ variant, size, rounded, className }))}
                {...props}
            />
        );
    }
);

Input.displayName = 'Input';
