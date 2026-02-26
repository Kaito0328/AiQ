import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/shared/utils/cn';
import { BrandColorKey, RadiusKey } from '../tokens/keys';

const variantMap: Record<BrandColorKey, string> = {
    primary: '',
    secondary: '',
    danger: '',
    success: '',
    heart: '',
    warning: '',
    info: '',
};

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
    {
        variants: {
            variant: {
                solid: '',
                outline: 'border-2 bg-transparent',
                ghost: 'bg-transparent',
            },
            color: variantMap,
            size: {
                sm: 'h-8 px-3 text-xs',
                md: 'h-10 px-4 text-sm',
                lg: 'h-12 px-6 text-base',
                icon: 'h-10 w-10',
            },
            rounded: {
                none: 'rounded-none',
                sm: 'rounded-brand-sm',
                md: 'rounded-brand-md',
                lg: 'rounded-brand-lg',
                full: 'rounded-brand-full',
            },
            fullWidth: {
                true: 'w-full',
            },
        },
        compoundVariants: [
            // Solid variants
            { variant: 'solid', color: 'primary', className: 'bg-brand-primary text-white hover:bg-brand-primary/90 focus-visible:ring-brand-primary/20' },
            { variant: 'solid', color: 'secondary', className: 'bg-brand-secondary text-white hover:bg-brand-secondary/90 focus-visible:ring-brand-secondary/20' },
            { variant: 'solid', color: 'danger', className: 'bg-brand-danger text-white hover:bg-brand-danger/90 focus-visible:ring-brand-danger/20' },
            { variant: 'solid', color: 'success', className: 'bg-brand-success text-white hover:bg-brand-success/90 focus-visible:ring-brand-success/20' },
            { variant: 'solid', color: 'heart', className: 'bg-brand-heart text-white hover:bg-brand-heart/90 focus-visible:ring-brand-heart/20' },
            { variant: 'solid', color: 'warning', className: 'bg-brand-warning text-white hover:bg-brand-warning/90 focus-visible:ring-brand-warning/20' },
            { variant: 'solid', color: 'info', className: 'bg-brand-info text-white hover:bg-brand-info/90 focus-visible:ring-brand-info/20' },

            // Outline variants
            { variant: 'outline', color: 'primary', className: 'border-brand-primary text-brand-primary hover:bg-brand-primary/10 focus-visible:ring-brand-primary/20' },
            { variant: 'outline', color: 'secondary', className: 'border-brand-secondary text-brand-secondary hover:bg-brand-secondary/10 focus-visible:ring-brand-secondary/20' },
            { variant: 'outline', color: 'danger', className: 'border-brand-danger text-brand-danger hover:bg-brand-danger/10 focus-visible:ring-brand-danger/20' },
            { variant: 'outline', color: 'success', className: 'border-brand-success text-brand-success hover:bg-brand-success/10 focus-visible:ring-brand-success/20' },
            { variant: 'outline', color: 'heart', className: 'border-brand-heart text-brand-heart hover:bg-brand-heart/10 focus-visible:ring-brand-heart/20' },
            { variant: 'outline', color: 'warning', className: 'border-brand-warning text-brand-warning hover:bg-brand-warning/10 focus-visible:ring-brand-warning/20' },
            { variant: 'outline', color: 'info', className: 'border-brand-info text-brand-info hover:bg-brand-info/10 focus-visible:ring-brand-info/20' },

            // Ghost variants
            { variant: 'ghost', color: 'primary', className: 'text-brand-primary hover:bg-brand-primary/10' },
            { variant: 'ghost', color: 'secondary', className: 'text-brand-secondary hover:bg-brand-secondary/10' },
            { variant: 'ghost', color: 'danger', className: 'text-brand-danger hover:bg-brand-danger/10' },
            { variant: 'ghost', color: 'success', className: 'text-brand-success hover:bg-brand-success/10' },
            { variant: 'ghost', color: 'warning', className: 'text-brand-warning hover:bg-brand-warning/10' },
            { variant: 'ghost', color: 'info', className: 'text-brand-info hover:bg-brand-info/10' },
        ],
        defaultVariants: {
            variant: 'solid',
            color: 'primary',
            size: 'md',
            rounded: 'md',
            fullWidth: false,
        },
    }
);

import { Spinner } from '../baseComponents/Spinner';

export interface ButtonProps
    extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'color'>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
    fullWidth?: boolean;
}

/**
 * ユーザーがアクションを実行するためのボタンコンポーネントです。
 */
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, color, size, rounded, fullWidth, loading, children, disabled, ...props }, ref) => {
        return (
            <button
                className={cn(buttonVariants({ variant, color, size, rounded, fullWidth, className }))}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading && <Spinner size="sm" className="mr-2" />}
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';
