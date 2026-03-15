"use client";
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { View } from '@/src/design/primitives/View';
import { Container } from '@/src/design/primitives/Container';
import { ResumeQuizList } from '@/src/features/quiz/components/ResumeQuizList';
import { History } from 'lucide-react';
import { SectionHeader } from '@/src/shared/components/SectionHeader';

export default function ResumeQuizPage() {
    return (
        <View className="min-h-screen bg-surface-muted pb-20">
            <Container className="max-w-4xl pt-6">
                <Stack gap="xl">
                    <Stack gap="md">
                        <SectionHeader
                            icon={History}
                            title="学習を再開する"
                            description="中断したクイズの続きから学習を再開できます。"
                        />
                    </Stack>

                    <View>
                        <ResumeQuizList />
                    </View>
                </Stack>
            </Container>
        </View>
    );
}

// Simple wrapper to avoid duplicating too much logic if ResumeQuizList has its own SectionHeader
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
    return <View className={className}>{children}</View>;
}
