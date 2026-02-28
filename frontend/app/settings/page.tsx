"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/src/design/primitives/Container';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Card } from '@/src/design/baseComponents/Card';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { useAuth } from '@/src/shared/auth/useAuth';
import { updateProfile } from '@/src/features/auth/api';
import { User as UserIcon, Lock, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const { user, isAuthenticated, refreshUser } = useAuth();

    const [username, setUsername] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [bio, setBio] = useState('');
    const [iconUrl, setIconUrl] = useState('');

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (user) {
            setUsername(user.username || '');
            setDisplayName(user.displayName || '');
            setBio(user.bio || '');
            setIconUrl(user.iconUrl || '');
        }
    }, [user]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // 1MB limit check
        if (file.size > 1024 * 1024) {
            setMessage({ type: 'danger', text: '画像サイズは1MB以下にしてください' });
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setIconUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            await updateProfile({
                username,
                displayName,
                bio,
                iconUrl
            });
            await refreshUser();
            setMessage({ type: 'success', text: 'プロフィールを更新しました' });
        } catch (err) {
            console.error('Failed to update profile', err);
            setMessage({ type: 'danger', text: '更新に失敗しました。ユーザー名が既に使用されている可能性があります。' });
        } finally {
            setLoading(false);
        }
    };

    if (!isAuthenticated) {
        return (
            <View className="min-h-screen flex items-center justify-center">
                <Text color="secondary">ログインが必要です</Text>
            </View>
        );
    }

    return (
        <View className="min-h-screen bg-surface-muted py-12">
            <Container>
                <Stack gap="xl" className="max-w-2xl mx-auto">
                    <Text variant="h2" weight="bold">設定</Text>

                    {/* Profile Section */}
                    <Card border="base">
                        <form onSubmit={handleSaveProfile}>
                            <Stack gap="lg">
                                <Flex gap="sm" align="center">
                                    <UserIcon size={24} className="text-brand-primary" />
                                    <Text variant="h3" weight="bold">プロフィール設定</Text>
                                </Flex>

                                <Stack gap="md">
                                    <Flex gap="md" align="center">
                                        <div className="relative group">
                                            <View className="w-24 h-24 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden border-2 border-brand-primary/20 shrink-0">
                                                {iconUrl ? (
                                                    <img src={iconUrl} alt="Preview" className="w-full h-full object-cover" />
                                                ) : (
                                                    <UserIcon size={40} className="text-brand-primary" />
                                                )}
                                            </View>
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute inset-0 flex items-center justify-center bg-black/40 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Camera size={24} />
                                            </button>
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                onChange={handleFileChange}
                                                accept="image/*"
                                                className="hidden"
                                            />
                                        </div>
                                        <Stack gap="xs" className="flex-1">
                                            <Text variant="xs" weight="bold">プロフィール画像</Text>
                                            <Flex gap="sm">
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="text-brand-primary"
                                                >
                                                    画像をアップロード
                                                </Button>
                                                {iconUrl && (
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => setIconUrl('')}
                                                        className="text-brand-danger"
                                                    >
                                                        削除
                                                    </Button>
                                                )}
                                            </Flex>
                                            <Text variant="xs" color="secondary">JPEG, PNG（最大1MB）</Text>
                                        </Stack>
                                    </Flex>

                                    <Stack gap="xs">
                                        <Text variant="xs" weight="bold">ユーザー名 (@username)</Text>
                                        <Input
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="username"
                                            required
                                        />
                                    </Stack>

                                    <Stack gap="xs">
                                        <Text variant="xs" weight="bold">表示名</Text>
                                        <Input
                                            value={displayName}
                                            onChange={(e) => setDisplayName(e.target.value)}
                                            placeholder="Display Name"
                                        />
                                    </Stack>

                                    <Stack gap="xs">
                                        <Text variant="xs" weight="bold">自己紹介 (bio)</Text>
                                        <Input
                                            multeline={true}
                                            value={bio}
                                            onChange={(e) => setBio(e.target.value)}
                                            placeholder="自己紹介を書いてみましょう"
                                            className="min-h-[100px] resize-none"
                                        />
                                    </Stack>
                                </Stack>

                                {message && (
                                    <View bg={message.type} className="bg-opacity-10 p-4 rounded-lg">
                                        <Flex gap="sm" align="center">
                                            {message.type === 'success' ? <CheckCircle2 size={18} className="text-brand-success" /> : <AlertCircle size={18} className="text-brand-danger" />}
                                            <Text variant="xs" color={message.type} weight="bold">{message.text}</Text>
                                        </Flex>
                                    </View>
                                )}

                                <Button
                                    variant="solid"
                                    color="primary"
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-fit"
                                >
                                    {loading ? '保存中...' : 'プロフィールを保存'}
                                </Button>
                            </Stack>
                        </form>
                    </Card>

                    {/* Security Section */}
                    <View className="px-4">
                        <button
                            type="button"
                            onClick={() => router.push('/settings/password')}
                            className="text-brand-primary hover:underline font-medium text-sm transition-all"
                        >
                            パスワードを変更する
                        </button>
                    </View>
                </Stack>
            </Container>
        </View>
    );
}
