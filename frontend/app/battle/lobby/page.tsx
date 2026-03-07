"use client";

import React, { useEffect, useState } from 'react';
import { Container } from '@/src/design/primitives/Container';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Card } from '@/src/design/baseComponents/Card';
import { Flex } from '@/src/design/primitives/Flex';
import { View } from '@/src/design/primitives/View';
import { BackButton } from '@/src/shared/components/Navigation/BackButton';
import { Swords, Users, Play, RefreshCw, User, Plus, XCircle } from 'lucide-react';
import { getPublicRooms, MatchRoomListItem } from '@/src/features/battle/api';
import { Button } from '@/src/design/baseComponents/Button';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { Badge } from '@/src/design/baseComponents/Badge';

export default function BattleLobbyPage() {
    const [rooms, setRooms] = useState<MatchRoomListItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const fetchRooms = async () => {
        setLoading(true);
        try {
            const data = await getPublicRooms();
            setRooms(data);
            setError(null);
        } catch (err: unknown) {
            console.error('Failed to fetch rooms', err);
            setError('ルーム一覧の取得に失敗しました。時間を置いて再度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleJoin = (roomId: string) => {
        router.push(`/battle/${roomId}`);
    };

    return (
        <View className="min-h-screen bg-surface-muted/30 pb-20">
            <View className="max-w-4xl mx-auto px-4 pt-8">
                <Stack gap="xl">
                    <Flex justify="between" align="end">
                        <Stack gap="xs">
                            <BackButton />
                            <Flex align="center" gap="sm">
                                <Swords className="text-brand-primary" size={28} />
                                <Text variant="h1" weight="bold" className="tracking-tight">
                                    対戦ロビー
                                </Text>
                            </Flex>
                            <Text color="secondary">
                                現在公開されているルームに参加して、他のユーザーと競い合いましょう。
                            </Text>
                        </Stack>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={fetchRooms}
                            disabled={loading}
                            className="gap-2"
                        >
                            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                            更新
                        </Button>
                    </Flex>

                    {loading ? (
                        <View className="py-24 flex flex-col items-center justify-center animate-in fade-in duration-700">
                            <Spinner size="lg" variant="primary" />
                            <Text variant="detail" color="secondary" className="mt-4 animate-pulse">最新のルームを探しています...</Text>
                        </View>
                    ) : error ? (
                        <Card className="py-12 text-center border-brand-danger/20 bg-brand-danger/5 shadow-brand-sm backdrop-blur-sm">
                            <Stack gap="lg" align="center">
                                <View className="bg-brand-danger/10 p-4 rounded-full text-brand-danger">
                                    <XCircle size={32} />
                                </View>
                                <Stack gap="xs">
                                    <Text color="danger" weight="bold" variant="h4">通信エラー</Text>
                                    <Text color="secondary" variant="xs">{error}</Text>
                                </Stack>
                                <Button variant="solid" color="danger" size="md" onClick={fetchRooms} className="px-8 shadow-md">
                                    再試行する
                                </Button>
                            </Stack>
                        </Card>
                    ) : rooms.length === 0 ? (
                        <Card className="py-24 text-center border-2 border-dashed border-surface-muted bg-surface-muted/10 overflow-hidden relative group">
                            <View className="absolute inset-0 bg-gradient-to-b from-brand-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <Stack gap="xl" align="center" className="relative z-10">
                                <View className="bg-surface-base p-6 rounded-full shadow-brand-sm border border-surface-muted/50 group-hover:scale-110 transition-transform duration-500">
                                    <Users size={56} className="text-brand-primary/40 group-hover:text-brand-primary/60 transition-colors" />
                                </View>
                                <Stack gap="xs">
                                    <Text variant="h3" weight="bold">現在、公開ルームはありません</Text>
                                    <Text color="secondary" className="max-w-md mx-auto">
                                        まだ誰もルームを公開していないようです。自分でルームを作って、友達や他のプレイヤーを待ってみませんか？
                                    </Text>
                                </Stack>
                                <Button
                                    variant="solid"
                                    color="primary"
                                    size="lg"
                                    className="px-8 shadow-xl shadow-brand-primary/20 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
                                    onClick={() => router.push('/home?tab=battle')}
                                >
                                    <Plus className="mr-2" size={20} />
                                    自分でルームを作成する
                                </Button>
                            </Stack>
                        </Card>
                    ) : (
                        <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {rooms.map((room) => (
                                <Card
                                    key={room.roomId}
                                    className="hover:shadow-lg transition-all hover:-translate-y-1"
                                    padding="lg"
                                >
                                    <Stack gap="md">
                                        <Flex justify="between" align="start">
                                            <Stack gap="xs">
                                                <Flex gap="sm" align="center">
                                                    <View className="bg-brand-primary/10 p-2 rounded-full text-brand-primary">
                                                        <User size={16} />
                                                    </View>
                                                    <Text weight="bold" variant="detail">
                                                        {room.hostUsername} のルーム
                                                    </Text>
                                                </Flex>
                                                <Flex gap="md" align="center" className="mt-1">
                                                    <Flex gap="xs" align="center">
                                                        <Users size={14} className="text-secondary" />
                                                        <Text variant="xs" color="secondary">
                                                            {room.playerCount} 名が参加中
                                                        </Text>
                                                    </Flex>
                                                    <Flex gap="xs" align="center">
                                                        <Swords size={14} className="text-secondary" />
                                                        <Text variant="xs" color="secondary">
                                                            全 {room.totalQuestions} 問
                                                        </Text>
                                                    </Flex>
                                                </Flex>
                                            </Stack>
                                            <Badge variant={room.status === 'Waiting' ? 'success' : 'secondary'}>
                                                {room.status === 'Waiting' ? '募集中' : '対戦中'}
                                            </Badge>
                                        </Flex>

                                        <Button
                                            variant="solid"
                                            color="primary"
                                            className="w-full gap-2 shadow-md shadow-brand-primary/20"
                                            onClick={() => handleJoin(room.roomId)}
                                            disabled={room.status !== 'Waiting'}
                                        >
                                            <Play size={16} />
                                            {room.status === 'Waiting' ? '参加する' : '観戦する (未実装)'}
                                        </Button>
                                    </Stack>
                                </Card>
                            ))}
                        </View>
                    )}
                </Stack>
            </View>
        </View>
    );
}
