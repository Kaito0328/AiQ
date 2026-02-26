import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/shared/utils/cn';
import { BrandColorKey } from '../tokens/keys';

const variantMap: Partial<Record<BrandColorKey, string>> = {
    primary: 'checked:bg-brand-primary checked:border-brand-primary',
    danger: 'checked:bg-brand-danger checked:border-brand-danger',
    success: 'checked:bg-brand-success checked:border-brand-success',
    warning: 'checked:bg-brand-warning checked:border-brand-warning',
    info: 'checked:bg-brand-info checked:border-brand-info',
};

const checkboxVariants = cva(
    'h-5 w-5 rounded border border-gray-300 transition-all focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 disabled:opacity-50',
    {
        variants: {
            variant: variantMap,
        },
        defaultVariants: {
            variant: 'primary',
        },
    }
);

export interface CheckboxProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'color'>,
    VariantProps<typeof checkboxVariants> {
    label?: string;
}

/**
 * ユーザーが選択項目を切り替えるためのチェックボックスコンポーネントです。
 */
export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
    ({ className, variant, label, ...props }, ref) => {
        return (
            <label className="inline-flex items-center space-x-2 cursor-pointer select-none group">
                <input
                    ref={ref}
                    type="checkbox"
                    className={cn(checkboxVariants({ variant, className }))}
                    {...props}
                />
                {label && (
                    <span className="text-base text-foreground group-has-[:disabled]:opacity-50">
                        {label}
                    </span>
                )}
            </label>
        );
    }
);

Checkbox.displayName = 'Checkbox';
