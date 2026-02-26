import React from 'react';
import { cn } from '@/src/shared/utils/cn';

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    center?: boolean;
}

const sizeMap = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full',
};

/**
 * コンテンツの最大幅を制限し、中央揃えにするためのレイアウトコンポーネントです。
 */
export function Container({
    className,
    size = 'xl',
    center = true,
    ...props
}: ContainerProps) {
    return (
        <div
            className={cn(
                'w-full px-4 sm:px-6 lg:px-8',
                sizeMap[size],
                center && 'mx-auto',
                className
            )}
            {...props}
        />
    );
}
