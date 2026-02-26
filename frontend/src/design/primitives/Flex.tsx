import React from 'react';
import { cn } from '@/src/shared/utils/cn';

export interface FlexProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
    as?: React.ElementType;
    direction?: 'row' | 'column';
    align?: 'start' | 'center' | 'end' | 'baseline' | 'stretch';
    justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
    gap?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
    wrap?: boolean;
}

const gapMap = {
    none: '',
    xs: 'gap-2',
    sm: 'gap-4',
    md: 'gap-6',
    lg: 'gap-8',
    xl: 'gap-12',
};

const alignMap = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    baseline: 'items-baseline',
    stretch: 'items-stretch',
};

const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
};

export const Flex = React.forwardRef<HTMLElement, FlexProps>(
    ({
        className,
        as: Component = 'div',
        direction = 'row',
        align = 'stretch',
        justify = 'start',
        gap = 'none',
        wrap = false,
        children,
        ...props
    }, ref) => {
        return (
            <Component
                ref={ref}
                className={cn(
                    'flex',
                    direction === 'column' ? 'flex-col' : 'flex-row',
                    alignMap[align],
                    justifyMap[justify],
                    gapMap[gap],
                    wrap && 'flex-wrap',
                    className
                )}
                {...props}
            >
                {children}
            </Component>
        );
    }
);

Flex.displayName = 'Flex';
