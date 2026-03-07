import React from 'react';
import { cn } from '@/src/shared/utils/cn';
import { BrandColorKey } from '../tokens/keys';

const colorMap: Partial<Record<BrandColorKey, string>> = {
    primary: 'var(--color-brand-primary, #6366f1)',
    danger: 'var(--color-brand-danger, #ef4444)',
    success: 'var(--color-brand-success, #22c55e)',
    warning: 'var(--color-brand-warning, #f59e0b)',
    info: 'var(--color-brand-info, #3b82f6)',
};

export interface RangeProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'color'> {
    variant?: BrandColorKey;
    enableJumpTap?: boolean;
}

/**
 * 連続的な数値の範囲から値を選択するためのスライダーコンポーネント。
 * サム（点）の左側を primary カラーで塗りつぶします。
 */
export const Range = React.forwardRef<HTMLInputElement, RangeProps>(
    ({ className, variant = 'primary', style, min = 0, max = 100, value, defaultValue, enableJumpTap = false, ...props }, ref) => {
        const color = colorMap[variant] ?? colorMap.primary!;
        const numMin = Number(min);
        const numMax = Number(max);
        const numVal = Number(value ?? defaultValue ?? numMin);
        const pct = numMax > numMin ? ((numVal - numMin) / (numMax - numMin)) * 100 : 0;

        const trackStyle: React.CSSProperties = {
            background: `linear-gradient(to right, ${color} ${pct}%, #d1d5db ${pct}%)`,
            touchAction: enableJumpTap ? 'none' : 'auto',
            ...style,
        };

        const updateValueFromEvent = (clientX: number, target: HTMLElement) => {
            if (!enableJumpTap) return;

            const rect = target.getBoundingClientRect();
            const x = clientX - rect.left;
            const width = rect.width;
            const clickedPct = Math.max(0, Math.min(1, x / width));
            const newValue = Math.round(numMin + clickedPct * (numMax - numMin));

            if (newValue !== numVal) {
                const event = {
                    target: {
                        value: String(Math.max(numMin, Math.min(numMax, newValue)))
                    }
                } as React.ChangeEvent<HTMLInputElement>;

                if (props.onChange) {
                    props.onChange(event);
                }
            }
        };

        const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
            if (!enableJumpTap || e.button !== 0) return;
            updateValueFromEvent(e.clientX, e.currentTarget);
        };

        const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
            if (enableJumpTap && e.touches.length > 0) {
                updateValueFromEvent(e.touches[0].clientX, e.currentTarget);
            }
        };

        return (
            <div
                className={cn("relative w-full h-6 flex items-center", enableJumpTap && "touch-none")}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
            >
                <input
                    ref={ref}
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    defaultValue={defaultValue}
                    className={cn(
                        'range-slider w-full h-2 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2',
                        className
                    )}
                    style={trackStyle}
                    {...props}
                />
            </div>
        );
    }
);

Range.displayName = 'Range';
