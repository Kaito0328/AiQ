import React from 'react';
import { cn } from '@/src/shared/utils/cn';
import { Flex, type FlexProps } from './Flex';

export interface StackProps extends Omit<FlexProps, 'direction'> {
    direction?: 'column' | 'row';
}

/**
 * 等間隔のレイアウトを提供するプリミティブコンポーネントです。
 * デフォルトで垂直方向（flex-col）に並びます。
 */
export const Stack = React.forwardRef<HTMLElement, StackProps>(
    ({ className, direction = 'column', gap = 'md', ...props }, ref) => {
        return (
            <Flex
                ref={ref}
                direction={direction}
                gap={gap}
                className={cn(className)}
                {...props}
            />
        );
    }
);

Stack.displayName = 'Stack';
