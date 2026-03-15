"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { View } from '@/src/design/primitives/View';
import { Stack } from '@/src/design/primitives/Stack';
import { Container } from '@/src/design/primitives/Container';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';

export default function CreditsPage() {
    const router = useRouter();

    return (
        <View bg="base" className="min-h-screen pb-20">
            <Container className="pt-4 px-6">
                <Stack gap="xl">
                    <Stack gap="md">
                        <Text variant="h1" weight="bold" color="primary">Credits</Text>
                        <Text variant="body" color="secondary">
                            AiQの開発に使用されたデータセット、モデル、およびライブラリのクレジットを掲載します。
                        </Text>
                    </Stack>

                    {/* Dataset */}
                    <Stack gap="sm">
                        <Text variant="h3" weight="bold">Dataset</Text>
                        <View className="bg-surface-muted p-4 rounded-brand-lg">
                            <Text weight="bold" className="block mb-1">AI王データセット (Version 1.0 学習用データ)</Text>
                            <Text variant="xs" color="secondary">© AI王製作委員会. CC BY-SA 4.0ライセンスの下で提供されています。</Text>
                        </View>
                    </Stack>

                    {/* AI Model */}
                    <Stack gap="sm">
                        <Text variant="h3" weight="bold">AI Model</Text>
                        <View className="bg-surface-muted p-4 rounded-brand-lg">
                            <Text weight="bold" className="block mb-1">multilingual-e5-small</Text>
                            <Text variant="xs" color="secondary">© Microsoft Corporation. MIT License.</Text>
                        </View>
                    </Stack>

                    {/* Core Libraries */}
                    <Stack gap="sm">
                        <Text variant="h3" weight="bold">Core Libraries</Text>
                        <View className="bg-surface-muted p-4 rounded-brand-lg">
                            <Stack gap="xs">
                                <Text variant="xs">• **Next.js**: Framework for React (MIT License)</Text>
                                <Text variant="xs">• **React**: Library for UI (MIT License)</Text>
                                <Text variant="xs">• **Lucide React**: Icons (ISC License)</Text>
                                <Text variant="xs">• **Transformers.js**: ML in JS (Apache 2.0)</Text>
                                <Text variant="xs">• **Tailwind CSS**: Styling (MIT License)</Text>
                                <Text variant="xs">• **Axum**: Web Framework (MIT License)</Text>
                                <Text variant="xs">• **SQLx**: SQL toolkit (MIT/Apache 2.0)</Text>
                            </Stack>
                        </View>
                    </Stack>

                    {/* Final Note */}
                    <View className="pt-8 border-t border-surface-muted">
                        <Text variant="xs" color="secondary" className="text-center italic">
                            AiQチームは、これらの素晴らしいオープンソースプロジェクトとデータセットの提供者に深く感謝いたします。
                        </Text>
                    </View>
                </Stack>
            </Container>
        </View>
    );
}
