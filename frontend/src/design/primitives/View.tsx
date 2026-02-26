import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/shared/utils/cn';
import { SurfaceColorKey, RadiusKey, ShadowKey, SpacingKey, ZIndexKey, AnimationKey } from '../tokens/keys';

const bgMap: Record<SurfaceColorKey, string> = {
    transparent: 'bg-transparent',
    base: 'bg-surface-base',
    muted: 'bg-surface-muted',
    card: 'bg-surface-card',
    primary: 'bg-brand-primary text-white',
    secondary: 'bg-brand-secondary text-white',
    danger: 'bg-brand-danger text-white',
    success: 'bg-brand-success text-white',
    heart: 'bg-brand-heart text-white',
    warning: 'bg-brand-warning text-white',
    info: 'bg-brand-info text-white',
};

const borderMap: Record<'none' | 'base' | 'primary' | 'danger' | 'heart', string> = {
    none: 'border-0',
    base: 'border border-surface-muted/50',
    primary: 'border border-brand-primary/30',
    danger: 'border border-brand-danger/30',
    heart: 'border border-brand-heart/30',
};

const radiusMap: Record<RadiusKey, string> = {
    none: 'rounded-none',
    sm: 'rounded-brand-sm',
    md: 'rounded-brand-md',
    lg: 'rounded-brand-lg',
    full: 'rounded-brand-full',
};

const shadowMap: Record<ShadowKey, string> = {
    none: 'shadow-none',
    sm: 'shadow-brand-sm',
    md: 'shadow-brand-md',
    lg: 'shadow-brand-lg',
};

const paddingMap: Record<SpacingKey, string> = {
    none: 'p-0',
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8',
};

const zIndexMap: Record<ZIndexKey, string> = {
    hide: 'z-hide',
    auto: 'z-auto',
    base: 'z-base',
    docked: 'z-docked',
    dropdown: 'z-dropdown',
    sticky: 'z-sticky',
    banner: 'z-banner',
    overlay: 'z-overlay',
    modal: 'z-modal',
    popover: 'z-popover',
    tooltip: 'z-tooltip',
};

const animationMap: Record<AnimationKey, string> = {
    none: '',
    fast: 'animate-fast',
    normal: 'animate-normal',
    slow: 'animate-slow',
};

const viewVariants = cva('transition-all', {
    variants: {
        bg: bgMap,
        border: borderMap,
        rounded: radiusMap,
        shadow: shadowMap,
        padding: paddingMap,
        zIndex: zIndexMap,
        animation: animationMap,
    },
    defaultVariants: {
        bg: 'transparent',
        border: 'none',
        rounded: 'none',
        shadow: 'none',
        padding: 'none',
        zIndex: 'auto',
        animation: 'none',
    },
});

export interface ViewProps
    extends Omit<React.AllHTMLAttributes<HTMLElement>, 'as' | 'color' | 'height' | 'width'>,
    VariantProps<typeof viewVariants> {
    as?: React.ElementType;
}

/**
 * アプリケーションの最も基本的なコンポーネントです。
 * 生の div の代わりに使用し、一貫したデザイントークンを適用します。
 */
export const View = React.forwardRef<HTMLElement, ViewProps>(
    ({ className, as: Component = 'div', bg, border, rounded, shadow, padding, zIndex, animation, ...props }, ref) => {
        return (
            <Component
                ref={ref}
                className={cn(viewVariants({ bg, border, rounded, shadow, padding, zIndex, animation, className }))}
                {...props}
            />
        );
    }
);

View.displayName = 'View';
