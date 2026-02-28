"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Container } from '@/src/design/primitives/Container';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Card } from '@/src/design/baseComponents/Card';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { changePassword } from '@/src/features/auth/api';
import { useAuth } from '@/src/shared/auth/useAuth';
import { Lock, ArrowLeft } from 'lucide-react';

export default function PasswordChangePage() {
    const router = useRouter();
    const { isAuthenticated } = useAuth();

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword !== confirmPassword) {
            setError('新しいパスワードが一致しません');
            return;
        }
        if (newPassword.length < 6) {
            setError('パスワードは6文字以上必要です');
            return;
        }

        setLoading(true);
        try {
            await changePassword(oldPassword, newPassword);
            setSuccess(true);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (err) {
            console.error('パスワード変更に失敗しました', err);
            setError('パスワード変更に失敗しました。現在のパスワードを確認してください。');
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
                <Stack gap="xl" className="max-w-md mx-auto">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/settings')}
                        className="gap-1.5 text-foreground/60 w-fit"
                    >
                        <ArrowLeft size={16} />
                        戻る
                    </Button>

                    <Card className="border border-gray-300">
                        <form onSubmit={handleSubmit}>
                            <Stack gap="lg">
                                <Flex gap="sm" align="center">
                                    <Lock size={24} className="text-brand-primary" />
                                    <Text variant="h2" weight="bold">パスワード変更</Text>
                                </Flex>

                                <Stack gap="md">
                                    <Stack gap="xs">
                                        <Text variant="xs" weight="bold">現在のパスワード</Text>
                                        <Input
                                            type="password"
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            placeholder="現在のパスワード"
                                        />
                                    </Stack>

                                    <Stack gap="xs">
                                        <Text variant="xs" weight="bold">新しいパスワード</Text>
                                        <Input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="新しいパスワード（6文字以上）"
                                        />
                                    </Stack>

                                    <Stack gap="xs">
                                        <Text variant="xs" weight="bold">新しいパスワード（確認）</Text>
                                        <Input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="新しいパスワード（確認）"
                                        />
                                    </Stack>
                                </Stack>

                                {error && (
                                    <Text variant="xs" color="danger">{error}</Text>
                                )}

                                {success && (
                                    <Text variant="xs" color="success">パスワードが正常に変更されました</Text>
                                )}

                                <Button
                                    variant="solid"
                                    color="primary"
                                    type="submit"
                                    fullWidth
                                    disabled={loading || !oldPassword || !newPassword || !confirmPassword}
                                >
                                    {loading ? '変更中...' : 'パスワードを変更'}
                                </Button>
                            </Stack>
                        </form>
                    </Card>
                </Stack>
            </Container>
        </View>
    );
}
