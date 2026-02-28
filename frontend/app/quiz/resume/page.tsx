"use client";

import React from 'react';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { ResumeQuizList } from '@/src/features/quiz/components/ResumeQuizList';
import { View } from '@/src/design/primitives/View';
import { BackButton } from '@/src/shared/components/Navigation/BackButton';
import { History } from 'lucide-react';
import { Flex } from '@/src/design/primitives/Flex';

export default function ResumeQuizPage() {
    return (
        <View className="min-h-screen bg-surface-muted/30 pb-20">
            <View className="max-w-4xl mx-auto px-4 pt-8">
                <Stack gap="xl">
                    <Stack gap="xs">
                        <BackButton />
                        <Flex align="center" gap="sm">
                            <History className="text-brand-primary" size={28} />
                            <Text variant="h1" weight="bold" className="tracking-tight">
                                学習を再開する
                            </Text>
                        </Flex>
                        <Text color="secondary">
                            中断したクイズの続きから学習を再開できます。
                        </Text>
                    </Stack>

                    <Card className="bg-transparent border-none shadow-none">
                        <ResumeQuizList />
                    </Card>
                </Stack>
            </View>
        </View>
    );
}

// Simple wrapper to avoid duplicating too much logic if ResumeQuizList has its own SectionHeader
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return <View className={className}>{children}</View>;
}
