import React from 'react';
import { cn } from '@/src/shared/utils/cn';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    error?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
    ({ className, error, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                className={cn(
                    "w-full px-4 py-3 rounded-brand-md border bg-surface-base transition-all duration-200 outline-none resize-none min-h-[100px]",
                    "placeholder:text-gray-400 text-sm",
                    error
                        ? "border-brand-danger focus:ring-4 focus:ring-brand-danger/10"
                        : "border-gray-300 focus:border-brand-primary focus:ring-4 focus:ring-brand-primary/10",
                    className
                )}
                {...props}
            />
        );
    }
);

TextArea.displayName = 'TextArea';
