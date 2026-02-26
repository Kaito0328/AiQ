"use client";

import React, { useState } from 'react';
import { Stack } from '@/src/design/primitives/Stack';
import { FormField } from '@/src/design/baseComponents/FormField';
import { Input } from '@/src/design/baseComponents/Input';
import { Button } from '@/src/design/baseComponents/Button';
import { Text } from '@/src/design/baseComponents/Text';
import { Card } from '@/src/design/baseComponents/Card';
import { login } from '../api';
import { useAuth } from '@/src/shared/auth/useAuth';
import { getErrorMessage } from '@/src/shared/api/error';
import { ApiError } from '@/src/shared/api/error';
import { SecurityNotice } from '@/src/design/baseComponents/SecurityNotice';
import { Flex } from '@/src/design/primitives/Flex';
import { View } from '@/src/design/primitives/View';

interface LoginFormProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { refreshUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);

        try {
            await login({ username, password });
            await refreshUser();
            onSuccess?.();
        } catch (err) {
            const message = err instanceof ApiError ? getErrorMessage(err.errorCode.code) : 'ログインに失敗しました';
            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <Stack as="form" onSubmit={handleSubmit} gap="lg">
                <Stack gap="xs" align="center">
                    <Text variant="h2">ログイン</Text>
                    <Text color="secondary" variant="xs">アカウントにアクセスしてください</Text>
                </Stack>

                <Stack gap="md">
                    <FormField label="ユーザー名">
                        <Input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="ユーザー名を入力"
                            required
                        />
                    </FormField>

                    <FormField label="パスワード">
                        <Input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="パスワードを入力"
                            required
                        />
                    </FormField>
                </Stack>

                <Button type="submit" loading={loading} fullWidth>
                    ログイン
                </Button>

                {errorMsg && (
                    <Text color="danger" variant="xs" align="center" weight="medium">
                        {errorMsg}
                    </Text>
                )}

                <Flex justify="center" gap="xs">
                    <Text variant="xs" color="secondary">アカウントをお持ちでないですか？</Text>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSwitchToRegister}
                        className="p-0 h-auto font-medium"
                    >
                        新規登録
                    </Button>
                </Flex>

                <View className="mt-4">
                    <SecurityNotice />
                </View>
            </Stack>
        </Card>
    );
}
