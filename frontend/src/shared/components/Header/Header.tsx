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
import { usePathname } from 'next/navigation';
import { cn } from '@/src/shared/utils/cn';
import { ThemeToggle } from './ThemeToggle';
import { useTheme } from '@/src/shared/contexts/ThemeContext';
import { useAudio } from '@/src/shared/contexts/AudioContext';
import { Volume2, VolumeX } from 'lucide-react';

export function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { isAuthenticated } = useAuth();
    const { theme } = useTheme();
    const { isMuted, toggleMute } = useAudio();
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();

    const isGameRoute = pathname.startsWith('/battle') ||
        pathname.startsWith('/quiz') ||
        pathname.includes('/ranking');

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true);
    }, []);

    return (
        <>
            <View
                as="header"
                className={cn(
                    "sticky top-0 z-50 border-b-2 border-brand-primary/30 h-16 flex items-center shadow-sm bg-sky-200/90 dark:bg-surface-base backdrop-blur-md transition-colors",
                    (isGameRoute) ? "hidden" : "flex"
                )}
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
                                <View
                                    as="img"
                                    src={mounted && theme === 'dark' ? "/logo_black.png" : "/logo_white.png"}
                                    alt="AiQ Logo"
                                    className="h-8 w-8 transition-transform group-hover:scale-110"
                                />
                                <Text variant="h3" weight="bold" color="primary" className="tracking-tight whitespace-nowrap">AiQ</Text>
                            </Link>
                        </div>

                        {/* 右側: オーディオ切替とテーマ切替 */}
                        <div className="z-10 flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={toggleMute}
                                className="p-2 h-auto hover:bg-surface-muted transition-colors rounded-lg flex items-center justify-center text-foreground"
                                title={isMuted ? "音声を再生" : "音声をミュート"}
                            >
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </Button>
                            <ThemeToggle />
                        </div>
                    </div>
                </Container>
            </View>

            <MobileMenu isOpen={isMenuOpen} onClose={() => setIsMenuOpen(false)} />
        </>
    );
}
