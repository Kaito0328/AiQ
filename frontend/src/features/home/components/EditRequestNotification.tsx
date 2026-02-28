"use client";

import React, { useEffect, useState } from 'react';
import { getMyPendingRequests } from '@/src/features/questions/api';
import { Card } from '@/src/design/baseComponents/Card';
import { Text } from '@/src/design/baseComponents/Text';
import { Flex } from '@/src/design/primitives/Flex';
import { Grid } from '@/src/design/primitives/Grid';
import { MessageSquare, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { View } from '@/src/design/primitives/View';
import { Stack } from '@/src/design/primitives/Stack';

export function EditRequestNotification() {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const data = await getMyPendingRequests();
                setRequests(data);
            } catch (err) {
                console.error('Failed to fetch pending requests', err);
            } finally {
                setLoading(false);
            }
        };
        fetchRequests();
    }, []);

    if (loading) return null;
    if (requests.length === 0) {
        return (
            <Card border="secondary" bg="transparent" className="border-dashed py-4">
                <Flex gap="sm" align="center" justify="center" className="opacity-40">
                    <MessageSquare size={20} />
                    <Text variant="xs" weight="medium">新しい通知はありません</Text>
                </Flex>
            </Card>
        );
    }

    const MAX_DISPLAY = 3;
    const displayRequests = requests.length > MAX_DISPLAY
        ? requests.slice(0, MAX_DISPLAY - 1)
        : requests;
    const hasMore = requests.length > MAX_DISPLAY;

    return (
        <Grid cols={{ sm: 1, md: 2, lg: 3 }} gap="md">
            {displayRequests.map((req) => (
                <Card
                    key={req.id}
                    onClick={() => router.push('/edit-requests')}
                    border="secondary"
                    bg="card"
                    padding="sm"
                    className="cursor-pointer hover:bg-surface-primary transition-all hover:shadow-md group"
                >
                    <Flex gap="sm" align="center" className="h-full">
                        <View className="bg-brand-secondary/10 p-2 rounded-full text-brand-secondary flex-shrink-0">
                            <MessageSquare size={16} />
                        </View>
                        <View className="min-w-0 flex-1">
                            <Text variant="detail" weight="bold" className="line-clamp-1 transition-colors group-hover:text-brand-primary">
                                {req.questionText}
                            </Text>
                            <Text variant="xs" color="secondary" weight="medium">
                                バージョン: {req.collectionName}
                            </Text>
                        </View>
                    </Flex>
                </Card>
            ))}

            {hasMore && (
                <Card
                    onClick={() => router.push('/edit-requests')}
                    border="secondary"
                    bg="transparent"
                    padding="sm"
                    className="cursor-pointer hover:bg-brand-secondary/5 transition-all text-brand-secondary border-dashed flex items-center justify-center min-h-[60px]"
                >
                    <Flex gap="xs" align="center">
                        <Text variant="detail" weight="bold">他 {requests.length - (MAX_DISPLAY - 1)} 件を見る</Text>
                        <ChevronRight size={16} />
                    </Flex>
                </Card>
            )}
        </Grid>
    );
}
