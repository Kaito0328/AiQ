import React from 'react';
import { cn } from '@/src/shared/utils/cn';

export interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
    label?: string;
    showValue?: boolean;
}

/**
 * デザインシステムに基づいたシンプルなスライダーコンポーネントです。
 */
export function Slider({
    value,
    min,
    max,
    step = 1,
    onChange,
    label,
    showValue = true,
    className,
    disabled,
    ...props
}: SliderProps) {
    const percentage = ((value - min) / (max - min)) * 100;

    return (
        <div className={cn("w-full space-y-2", className)}>
            <div className="flex justify-between items-center">
                {label && (
                    <label className="text-sm font-bold text-secondary">
                        {label}
                    </label>
                )}
                {showValue && (
                    <span className="text-sm font-mono font-bold text-brand-primary bg-brand-primary/10 px-2 py-0.5 rounded">
                        {value}
                    </span>
                )}
            </div>
            <div className="relative group py-2">
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    disabled={disabled}
                    className={cn(
                        "w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary/20",
                        "accent-brand-primary",
                        disabled && "opacity-50 cursor-not-allowed",
                    )}
                    style={{
                        background: `linear-gradient(to right, var(--brand-primary) ${percentage}%, #e5e7eb ${percentage}%)`
                    }}
                    {...props}
                />
            </div>
            <div className="flex justify-between items-center px-1">
                <span className="text-[10px] text-secondary/60 font-medium">{min}</span>
                <span className="text-[10px] text-secondary/60 font-medium">{max}</span>
            </div>
        </div>
    );
}
