"use client";

import React from 'react';
import { Container } from '@/src/design/primitives/Container';
import { Stack } from '@/src/design/primitives/Stack';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { UserListTabs } from '@/src/features/users/components/UserListTabs';

export default function UsersPage() {
    return (
        <View className="min-h-screen bg-surface-muted py-12">
            <Container>
                <Stack gap="xl">
                    <Text variant="h1" weight="bold">ユーザー一覧</Text>
                    <UserListTabs />
                </Stack>
            </Container>
        </View>
    );
}
