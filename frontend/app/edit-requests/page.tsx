"use client";

import React from 'react';
import { View } from '@/src/design/primitives/View';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { EditRequestReviewList } from '@/src/features/questions/components/EditRequestReviewList';
import { BackButton } from '@/src/shared/components/Navigation/BackButton';
import { MessageSquare } from 'lucide-react';
import { Flex } from '@/src/design/primitives/Flex';

export default function EditRequestsPage() {
    return (
        <View className="min-h-screen bg-surface-muted/30 pb-20">
            <View className="max-w-4xl mx-auto px-4 pt-8">
                <Stack gap="xl">
                    <Flex justify="between" align="center">
                        <Stack gap="xs">
                            <BackButton />
                            <Flex align="center" gap="sm">
                                <MessageSquare className="text-brand-primary" size={28} />
                                <Text variant="h1" weight="bold" className="tracking-tight">
                                    修正依頼の管理
                                </Text>
                            </Flex>
                            <Text color="secondary">
                                あなたがオーナーの問題集に届いた、修正の提案を確認できます。
                            </Text>
                        </Stack>
                    </Flex>

                    <EditRequestReviewList isGlobal={true} />
                </Stack>
            </View>
        </View>
    );
}
