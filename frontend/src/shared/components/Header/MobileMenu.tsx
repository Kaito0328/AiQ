"use client";

import React from 'react';
import { View } from '@/src/design/primitives/View';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { cn } from '@/src/shared/utils/cn';
import { X, Home, Book, User, Users, LogOut, Heart, Settings } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/src/shared/auth/useAuth';

interface MobileMenuProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
    const router = useRouter();
    const { user, logout, isAuthenticated } = useAuth();

    const handleNavigate = (path: string) => {
        router.push(path);
        onClose();
    };

    const handleLogout = () => {
        logout();
        onClose();
        router.push('/');
    };

    return (
        <>
            {/* Overlay */}
            <div
                className={cn(
                    "fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            {/* Drawer - slides from left */}
            <div
                className={cn(
                    "fixed top-0 left-0 h-full w-[280px] bg-white z-[101] shadow-2xl transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <View className="h-full p-6">
                    <Stack gap="xl" className="h-full">
                        <Flex justify="between" align="center">
                            <Text variant="h3">メニュー</Text>
                            <Button variant="ghost" size="sm" onClick={onClose} className="p-1 h-auto">
                                <X size={24} />
                            </Button>
                        </Flex>

                        <Stack gap="md" className="flex-1">
                            <MenuLink icon={<Home size={20} />} label="ホーム" onClick={() => handleNavigate('/home')} />
                            <MenuLink icon={<Book size={20} />} label="公式コレクション" onClick={() => handleNavigate('/users/official')} />
                            <MenuLink icon={<Users size={20} />} label="ユーザー一覧" onClick={() => handleNavigate('/users')} />
                            {isAuthenticated && (
                                <>
                                    <MenuLink icon={<User size={20} />} label="プロファイル" onClick={() => handleNavigate(`/users/${user?.id}`)} />
                                    <MenuLink icon={<Heart size={20} />} label="お気に入り" onClick={() => handleNavigate(`/users/${user?.id}/favorites`)} />
                                    <MenuLink icon={<Settings size={20} />} label="パスワード変更" onClick={() => handleNavigate('/settings/password')} />
                                </>
                            )}
                        </Stack>

                        {isAuthenticated && (
                            <View className="border-t border-surface-muted pt-6">
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-3 text-status-danger hover:bg-status-danger/10"
                                    onClick={handleLogout}
                                >
                                    <LogOut size={20} />
                                    ログアウト
                                </Button>
                            </View>
                        )}
                    </Stack>
                </View>
            </div>
        </>
    );
}

function MenuLink({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick: () => void }) {
    return (
        <button
            className="flex items-center gap-4 p-3 rounded-lg hover:bg-surface-muted transition-colors text-foreground"
            onClick={onClick}
        >
            <View className="text-brand-primary">{icon}</View>
            <Text weight="medium">{label}</Text>
        </button>
    );
}
