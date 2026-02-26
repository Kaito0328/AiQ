"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { BackButton } from '@/src/shared/components/Navigation/BackButton';
import { getLeaderboard, startRankingQuiz } from '@/src/features/quiz/api';
import { getCollection } from '@/src/features/collections/api';
import { Collection } from '@/src/entities/collection';
import { LeaderboardResponse } from '@/src/features/quiz/api';
import { Trophy, Play, User } from 'lucide-react';
import { useAuth } from '@/src/shared/auth/useAuth';

export default function RankingLeaderboardPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const collectionId = params.collectionId as string;

    const [collection, setCollection] = useState<Collection | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardResponse | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [c, l] = await Promise.all([
                    getCollection(collectionId),
                    getLeaderboard(collectionId)
                ]);
                setCollection(c);
                setLeaderboard(l);
            } catch (err) {
                console.error('Failed to fetch ranking data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [collectionId]);

    const handleStartQuiz = async () => {
        try {
            const resp = await startRankingQuiz(collectionId);
            sessionStorage.setItem('quizData', JSON.stringify(resp));
            router.push('/quiz');
        } catch (err) {
            console.error('Failed to start ranking quiz', err);
            alert('クイズの開始に失敗しました。');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-surface-muted flex items-center justify-center">
                <Text>読み込み中...</Text>
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="min-h-screen bg-surface-muted flex flex-col items-center justify-center gap-4">
                <Text variant="h2">コレクションが見つかりません</Text>
                <Button onClick={() => router.push('/home')}>ホームに戻る</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-muted pt-24 pb-12 px-4">
            <BackButton />

            <View className="max-w-2xl mx-auto">
                <Stack gap="xl">
                    {/* Header Section */}
                    <Stack gap="sm" align="center" className="text-center">
                        <View className="bg-brand-primary/10 p-4 rounded-full mb-2">
                            <Trophy size={48} className="text-brand-primary" />
                        </View>
                        <Text variant="h1" weight="bold">{collection.name}</Text>
                        <Text color="secondary">ランキングクイズ・リーダーボード</Text>

                        <View className="mt-4">
                            <Button
                                size="lg"
                                color="primary"
                                className="px-8 py-6 rounded-full shadow-lg hover:scale-105 transition-transform"
                                onClick={handleStartQuiz}
                            >
                                <Flex gap="sm" align="center">
                                    <Play size={20} fill="currentColor" />
                                    <Text weight="bold">クイズに挑戦する</Text>
                                </Flex>
                            </Button>
                        </View>
                    </Stack>

                    {/* Leaderboard Table */}
                    <Card className="overflow-hidden border-none shadow-xl">
                        <Stack gap="none">
                            <View className="bg-brand-primary p-4 text-white">
                                <Flex justify="between" align="center">
                                    <Text weight="bold" className="text-white">順位</Text>
                                    <Text weight="bold" className="text-white">ユーザー</Text>
                                    <Text weight="bold" className="text-white">スコア</Text>
                                </Flex>
                            </View>

                            {leaderboard?.entries.length === 0 ? (
                                <View className="p-12 text-center">
                                    <Text color="secondary">まだ記録がありません。一番乗りを目指しましょう！</Text>
                                </View>
                            ) : (
                                leaderboard?.entries.map((entry, index) => {
                                    const isCurrentUser = entry.userId === user?.id;
                                    return (
                                        <View
                                            key={entry.userId}
                                            className={`p-4 border-b border-surface-muted last:border-none transition-colors ${isCurrentUser ? 'bg-brand-primary/5' : 'hover:bg-brand-primary/[0.02]'}`}
                                        >
                                            <Flex justify="between" align="center">
                                                <View className="w-12">
                                                    <View className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${entry.rank === 1 ? 'bg-yellow-400 text-white' :
                                                            entry.rank === 2 ? 'bg-slate-300 text-white' :
                                                                entry.rank === 3 ? 'bg-amber-600 text-white' :
                                                                    'text-secondary'
                                                        }`}>
                                                        {entry.rank}
                                                    </View>
                                                </View>

                                                <Flex gap="md" align="center" className="flex-1">
                                                    {entry.iconUrl ? (
                                                        <img src={entry.iconUrl} alt={entry.username} className="w-8 h-8 rounded-full shadow-sm" />
                                                    ) : (
                                                        <View className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
                                                            <User size={16} className="text-slate-400" />
                                                        </View>
                                                    )}
                                                    <Text weight={isCurrentUser ? "bold" : "medium"} color={isCurrentUser ? "primary" : "secondary"}>
                                                        {entry.username}
                                                        {isCurrentUser && <span className="ml-2 text-xs bg-brand-primary text-white px-2 py-0.5 rounded-full">あなた</span>}
                                                    </Text>
                                                </Flex>

                                                <View className="text-right">
                                                    <Text weight="bold" color="primary" variant="detail">{entry.score.toLocaleString()}</Text>
                                                    <Text variant="xs" color="secondary" className="text-[10px]">pts</Text>
                                                </View>
                                            </Flex>
                                        </View>
                                    );
                                })
                            )}
                        </Stack>
                    </Card>

                    <View className="text-center px-8">
                        <Text variant="xs" color="secondary">
                            ※ スコアは正解数と回答時間によって算出されます。より早く正確に答えて上位を目指しましょう！
                        </Text>
                    </View>
                </Stack>
            </View>
        </div>
    );
}
