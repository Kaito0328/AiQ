"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useSafeRouter } from '@/src/shared/hooks/useSafeRouter';
import { Flex } from '@/src/design/primitives/Flex';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Home, Search, Gamepad2 } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

function BottomNavContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useSafeRouter();

    // Determine if we should hide the nav completely
    // Hide on active quiz play, battle play, or landing pages where it's not needed
    // /battle/[roomId] is the battle page. If we are in the lobby or results, we might want it.
    // However, the lobby and game live in the same route `/battle/[roomId]`.
    // The user requested: "クイズ画面やバトル画面では表示しないでください" (Don't show in quiz or battle screens). 

    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;
            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // Scrolling down
                setIsVisible(false);
            } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
                // Scrolling up or at top
                setIsVisible(true);
            }
            setLastScrollY(currentScrollY);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [lastScrollY]);

    if (pathname !== '/home') return null;

    const navItems = [
        { label: 'ダッシュボード', icon: Home, route: '/home?tab=dashboard' },
        { label: 'タイムライン', icon: Search, route: '/home?tab=timeline' },
        { label: '対戦', icon: Gamepad2, route: '/home?tab=battle' },
    ];

    const isCurrentRoute = (route: string) => {
        const routePath = route.split('?')[0];
        const routeTab = new URLSearchParams(route.split('?')[1] || '').get('tab');

        if (pathname !== routePath) return false;

        const currentTab = searchParams.get('tab') || 'dashboard';
        if (routeTab) {
            return currentTab === routeTab;
        }
        return true;
    };

    return (
        <View
            className={cn(
                "fixed bottom-0 left-0 right-0 z-50 bg-surface-base/90 backdrop-blur-md border-t border-surface-muted sm:hidden transition-transform duration-300",
                isVisible ? "translate-y-0" : "translate-y-full"
            )}
        >
            <Flex justify="around" align="center" className="h-16 px-2">
                {navItems.map((item) => {
                    const active = isCurrentRoute(item.route);
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.label}
                            onClick={() => router.push(item.route)}
                            className={cn(
                                "flex flex-col items-center justify-center flex-1 h-full gap-1 transition-colors",
                                active ? "text-brand-primary" : "text-secondary hover:text-foreground"
                            )}
                        >
                            <Icon size={24} strokeWidth={active ? 2.5 : 2} className={cn("transition-transform", active ? "scale-110" : "")} />
                            <Text variant="xs" weight="bold" color={active ? "primary" : "secondary"}>
                                {item.label}
                            </Text>
                        </button>
                    );
                })}
            </Flex>
        </View>
    );
}

export function BottomNav() {
    return (
        <Suspense fallback={null}>
            <BottomNavContent />
        </Suspense>
    );
}
