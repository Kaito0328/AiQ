"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Container } from '@/src/design/primitives/Container';
import { Flex } from '@/src/design/primitives/Flex';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Menu } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { useAuth } from '@/src/shared/auth/useAuth';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '@/src/shared/contexts/ThemeContext';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <>
            <View
                as="header"
                className="sticky top-0 z-50 border-b-2 border-brand-primary/20 h-16 flex items-center shadow-sm bg-sky-100/95 dark:bg-surface-base/80 backdrop-blur-md transition-colors"
            >
                <Container className="relative h-full px-4">
                    <div className="flex items-center justify-between h-full">
                        {/* 左側: ハンバーガーメニュー */}
                        <div className="z-10">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsMenuOpen(true)}
                                className="p-2 h-auto hover:bg-surface-muted transition-colors rounded-lg flex items-center justify-center"
                            >
                                <Menu size={24} className="text-foreground" />
                            </Button>
                        </div>

                        {/* 中央: ロゴとタイトル (絶対配置で固定) */}
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                            <Link
                                href="/home"
                                className="flex items-center gap-2 group pointer-events-auto"
                            >
                                <img
                                    src={mounted && theme === 'dark' ? "/logo_white.png" : "/logo_black.png"}
                                    alt="AiQ Logo"
                                    className="h-8 w-8 transition-transform group-hover:scale-110"
                                />
                                <Text variant="h3" weight="bold" color="primary" className="tracking-tight whitespace-nowrap">AiQ</Text>
                            </Link>
                        </div>

                        {/* 右側: テーマ切替ボタン */}
                        <div className="z-10">
                            <ThemeToggle />
                        </div>
                    </div>
                </Container>
            </View>

            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    );
}
