"use client";

import React from 'react';
import { Container } from '@/src/design/primitives/Container';
import { Stack } from '@/src/design/primitives/Stack';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { UserListTabs } from '@/src/features/users/components/UserListTabs';
import { BackButton } from '@/src/shared/components/Navigation/BackButton';

export default function UsersPage() {
    return (
        <View className="min-h-screen bg-surface-muted py-12">
            <BackButton />
            <Container className="pt-8">
                <Stack gap="xl">
                    <Text variant="h1" weight="bold">ユーザー一覧</Text>
                    <UserListTabs />
                </Stack>
            </Container>
        </View>
    );
}
