"use client";

import React, { useState } from 'react';
import { View } from '../primitives/View';
import { Text } from './Text';
import { cn } from '@/src/shared/utils/cn';

export interface TooltipProps {
    content: React.ReactNode;
    children: React.ReactNode;
    placement?: 'top' | 'bottom' | 'left' | 'right';
    className?: string;
}

/**
 * ホバー時に補足情報を表示するツールチップコンポーネントです。
 * 注意: この実装は簡略化のため純粋な CSS/Hover ロジックを使用しています。
 */
export function Tooltip({
    content,
    children,
    placement = 'top',
    className
}: TooltipProps) {
    const [isVisible, setIsVisible] = useState(false);

    const placementClasses = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <View
                    bg="card"
                    padding="xs"
                    rounded="sm"
                    shadow="md"
                    className={cn(
                        'absolute z-tooltip whitespace-nowrap animate-in fade-in zoom-in-95 duration-100',
                        placementClasses[placement],
                        'border border-slate-200 dark:border-slate-800',
                        className
                    )}
                >
                    <Text variant="xs" weight="medium">
                        {content}
                    </Text>
                    {/* アロー (矢印) */}
                    <div
                        className={cn(
                            'absolute w-2 h-2 bg-surface-card border-inherit border-b border-r rotate-45',
                            placement === 'top' && 'bottom-[-5px] left-1/2 -translate-x-1/2 border-t-0 border-l-0',
                            placement === 'bottom' && 'top-[-5px] left-1/2 -translate-x-1/2 border-b-0 border-r-0 rotate-[225deg]',
                            placement === 'left' && 'right-[-5px] top-1/2 -translate-y-1/2 border-b-0 border-l-0 rotate-[-45deg]',
                            placement === 'right' && 'left-[-5px] top-1/2 -translate-y-1/2 border-t-0 border-r-0 rotate-[135deg]',
                        )}
                    />
                </View>
            )}
        </div>
    );
}
