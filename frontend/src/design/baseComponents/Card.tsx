import React from 'react';
import { cn } from '@/src/shared/utils/cn';
import { View, type ViewProps } from '../primitives/View';

export interface CardProps extends ViewProps { }

/**
 * 情報を整理して表示するためのコンテナコンポーネントです。
 * デフォルトで背景色、角丸、影が適用されます。
 */
export const Card = React.forwardRef<HTMLElement, CardProps>(
    ({ className, bg = 'card', rounded = 'lg', shadow = 'sm', padding = 'md', ...props }, ref) => {
        return (
            <View
                ref={ref}
                bg={bg}
                rounded={rounded}
                shadow={shadow}
                padding={padding}
                className={cn(className)}
                {...props}
            />
        );
    }
);

Card.displayName = 'Card';
