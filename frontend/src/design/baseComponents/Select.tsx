import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/shared/utils/cn';

const selectVariants = cva(
    'w-full appearance-none transition-all outline-none border border-gray-300 bg-surface-base px-3 py-2 text-base rounded-brand-md cursor-pointer focus:border-brand-primary focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            variant: {
                default: '',
                error: 'border-brand-danger focus:ring-brand-danger/20',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
);

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement>,
    VariantProps<typeof selectVariants> { }

/**
 * ユーザーがプルダウンメニューから値を選択するためのコンポーネントです。
 */
export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, variant, children, ...props }, ref) => {
        return (
            <div className="relative">
                <select
                    ref={ref}
                    className={cn(selectVariants({ variant, className }))}
                    {...props}
                >
                    {children}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
                        <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                </div>
            </div>
        );
    }
);

Select.displayName = 'Select';
