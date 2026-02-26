import React from 'react';
import { cn } from '@/src/shared/utils/cn';

export interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
}

/**
 * ユーザーが設定を切り替えるためのトグルスイッチコンポーネントです。
 */
export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, label, ...props }, ref) => {
        return (
            <label className="inline-flex cursor-pointer items-center space-x-2 select-none group">
                <div className="relative">
                    <input
                        ref={ref}
                        type="checkbox"
                        className="peer sr-only"
                        {...props}
                    />
                    <div className="h-6 w-11 rounded-full bg-gray-200 transition-colors peer-checked:bg-brand-primary peer-focus:ring-2 peer-focus:ring-focus-ring peer-focus:ring-offset-2 group-has-[:disabled]:opacity-50"></div>
                    <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform peer-checked:translate-x-5 group-has-[:disabled]:opacity-50"></div>
                </div>
                {label && (
                    <span className="text-base text-foreground group-has-[:disabled]:opacity-50">
                        {label}
                    </span>
                )}
            </label>
        );
    }
);

Switch.displayName = 'Switch';
