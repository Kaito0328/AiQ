"use client";

import React, { useState } from 'react';
import { Stack } from '@/src/design/primitives/Stack';
import { FormField } from '@/src/design/baseComponents/FormField';
import { Input } from '@/src/design/baseComponents/Input';
import { Button } from '@/src/design/baseComponents/Button';
import { Text } from '@/src/design/baseComponents/Text';
import { Card } from '@/src/design/baseComponents/Card';
import { Flex } from '@/src/design/primitives/Flex';
import { register } from '../api';
import { useAuth } from '@/src/shared/auth/useAuth';
import { getErrorMessage, ApiError } from '@/src/shared/api/error';
import { SecurityNotice } from '@/src/design/baseComponents/SecurityNotice';
import { View } from '@/src/design/primitives/View';

interface RegisterFormProps {
    onSuccess?: () => void;
    onSwitchToLogin?: () => void;
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const { refreshUser } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg(null);

        if (password !== confirmPassword) {
            setErrorMsg('パスワードが一致しません');
            return;
        }

        setLoading(true);

        try {
            await register({ username, password });
            await refreshUser();
            onSuccess?.();
        } catch (err) {
            const message = err instanceof ApiError ? getErrorMessage(err.errorCode.code) : '登録に失敗しました';
            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto">
            <Stack as="form" onSubmit={handleSubmit} gap="lg">
                <Stack gap="xs" align="center">
                    <Text variant="h2">新規登録</Text>
                    <Text color="secondary" variant="xs">新しいアカウントを作成してください</Text>
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

                    <FormField label="パスワード（確認）">
                        <Input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="もう一度パスワードを入力"
                            required
                        />
                    </FormField>
                </Stack>

                {errorMsg && (
                    <Text color="danger" variant="xs" align="center" weight="medium">
                        {errorMsg}
                    </Text>
                )}

                <Button type="submit" loading={loading} fullWidth>
                    登録する
                </Button>

                <Flex justify="center" gap="xs">
                    <Text variant="xs" color="secondary">すでにアカウントをお持ちですか？</Text>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onSwitchToLogin}
                        className="p-0 h-auto font-medium"
                    >
                        ログイン
                    </Button>
                </Flex>

                <View className="mt-4">
                    <SecurityNotice />
                </View>
            </Stack>
        </Card>
    );
}
