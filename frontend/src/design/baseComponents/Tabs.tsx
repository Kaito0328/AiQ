"use client";

import React, { useState } from 'react';
import { Flex } from '../primitives/Flex';
import { View } from '../primitives/View';
import { cn } from '@/src/shared/utils/cn';

export interface TabItem {
    id: string;
    label: string;
    icon?: React.ReactNode;
    content: React.ReactNode;
}

export interface TabsProps {
    items: TabItem[];
    defaultTab?: string;
    className?: string;
    variant?: 'line' | 'pill';
    fitted?: boolean;
}

/**
 * コンテンツをタブで切り替えるためのコンポーネントです。
 */
export function Tabs({
    items,
    defaultTab,
    className,
    variant = 'line',
    fitted = false
}: TabsProps) {
    const [activeTab, setActiveTab] = useState(defaultTab || items[0]?.id);

    return (
        <View className={cn('w-full', className)}>
            <Flex
                gap={variant === 'pill' ? 'xs' : 'none'}
                className={cn(
                    'mb-4 overflow-x-auto no-scrollbar',
                    variant === 'line' && 'border-b border-slate-200 dark:border-slate-800',
                    fitted && 'w-full'
                )}
            >
                {items.map((item) => {
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                                'flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium transition-all whitespace-nowrap cursor-pointer',
                                fitted && 'flex-1',
                                variant === 'line' && [
                                    'border-b-2 -mb-[1px]',
                                    isActive
                                        ? 'border-brand-primary text-brand-primary font-semibold'
                                        : 'border-transparent text-foreground/50 hover:text-brand-primary'
                                ],
                                variant === 'pill' && [
                                    'rounded-md',
                                    isActive
                                        ? 'bg-brand-primary text-white shadow-sm'
                                        : 'text-foreground/50 hover:text-brand-primary'
                                ]
                            )}
                        >
                            {item.icon}
                            {item.label}
                        </button>
                    );
                })}
            </Flex>
            <View className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                {items.find(item => item.id === activeTab)?.content}
            </View>
        </View>
    );
}
