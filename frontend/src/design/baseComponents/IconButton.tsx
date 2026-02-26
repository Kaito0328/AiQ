import React from 'react';
import { cn } from '@/src/shared/utils/cn';
import { Button, type ButtonProps } from './Button';

export interface IconButtonProps extends Omit<ButtonProps, 'children'> {
    icon: React.ReactNode;
}

/**
 * アイコンのみを表示するためのボタンコンポーネントです。
 */
export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
    ({ className, icon, size = 'icon', rounded = 'full', ...props }, ref) => {
        return (
            <Button
                ref={ref}
                size={size}
                rounded={rounded}
                className={cn(className)}
                {...props}
            >
                {icon}
            </Button>
        );
    }
);

IconButton.displayName = 'IconButton';
