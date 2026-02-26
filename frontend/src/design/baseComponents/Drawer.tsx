"use client";

import React from 'react';
import { View } from '../primitives/View';
import { Stack } from '../primitives/Stack';
import { Flex } from '../primitives/Flex';
import { Text } from './Text';
import { IconButton } from './IconButton';
import { cn } from '@/src/shared/utils/cn';
import { X } from 'lucide-react';

export interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    placement?: 'left' | 'right';
}

/**
 * 画面端からスライドして表示されるパネルコンポーネントです。
 * ハンバーガーメニュー、フィルター、詳細設定などに使用されます。
 */
export function Drawer({
    isOpen,
    onClose,
    title,
    children,
    placement = 'left',
}: DrawerProps) {
    return (
        <>
            {/* 背景オーバーレイ */}
            <div
                className={cn(
                    "fixed inset-0 z-overlay bg-black/50 transition-opacity duration-300",
                    isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* パネル本体 */}
            <View
                bg="base"
                className={cn(
                    "fixed top-0 bottom-0 z-modal w-80 max-w-[85vw] shadow-xl transition-transform duration-300 ease-in-out",
                    placement === 'left'
                        ? (isOpen ? "left-0 translate-x-0" : "left-0 -translate-x-full")
                        : (isOpen ? "right-0 translate-x-0" : "right-0 translate-x-full")
                )}
            >
                <Stack gap="none" className="h-full">
                    {/* ヘッダー */}
                    <Flex align="center" justify="between" className="border-b px-4 py-3">
                        {title ? (
                            <Text weight="bold">{title}</Text>
                        ) : (
                            <div /> // スペーサー
                        )}
                        <IconButton
                            icon={<X size={20} />}
                            variant="ghost"
                            onClick={onClose}
                            aria-label="閉じる"
                        />
                    </Flex>

                    {/* コンテンツ */}
                    <div className="flex-1 overflow-y-auto p-4">
                        {children}
                    </div>
                </Stack>
            </View>
        </>
    );
}
