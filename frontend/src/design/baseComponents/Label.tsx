import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/src/shared/utils/cn';
import { Flex, type FlexProps } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { SurfaceColorKey } from '../tokens/keys';

const bgMap: Record<SurfaceColorKey, string> = {
    transparent: 'bg-transparent',
    base: 'bg-surface-base',
    muted: 'bg-surface-muted',
    card: 'bg-surface-card',
    // Labelの色の実体を独自に定義（例：少し透過させるなど）
    primary: 'bg-brand-primary text-white',
    secondary: 'bg-brand-secondary text-white',
    danger: 'bg-brand-danger text-white',
    success: 'bg-brand-success text-white',
    heart: 'bg-brand-heart text-white',
    warning: 'bg-brand-warning text-white',
    info: 'bg-brand-info text-white',
};

const labelVariants = cva('', {
    variants: {
        variant: {
            default: '',
            outline: 'border border-brand-secondary',
            filled: 'bg-surface-muted',
        },
        bg: bgMap,
    },
    defaultVariants: {
        variant: 'default',
        bg: 'transparent',
    },
});

export interface LabelProps
    extends Omit<FlexProps, 'bg' | 'color'>,
    VariantProps<typeof labelVariants> {
    label?: string;
    icon?: React.ReactNode;
    iconRight?: boolean;
}

/**
 * テキストとアイコン（オプション）を表示するためのラベルコンポーネントです。
 */
export const Label = React.forwardRef<HTMLElement, LabelProps>(
    ({ className, label, icon, iconRight = false, variant, bg, align = 'center', ...props }, ref) => {
        return (
            <Flex
                align={align}
                className={cn(labelVariants({ variant, bg, className }))}
                {...props}
            >
                {!iconRight && icon && <span className={cn(label && "mr-2")}>{icon}</span>}
                {label && <Text as="span" variant="detail" weight="medium" color="inherit">{label}</Text>}
                {iconRight && icon && <span className={cn(label && "ml-2")}>{icon}</span>}
            </Flex>
        );
    }
);

Label.displayName = 'Label';
