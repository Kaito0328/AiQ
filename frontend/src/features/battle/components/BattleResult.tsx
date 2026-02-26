"use client";

import React from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { PlayerScore } from '@/src/entities/battle';
import { Trophy, Home, RotateCcw, Medal, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { View } from '@/src/design/primitives/View';
import { cn } from '@/src/shared/utils/cn';

interface BattleResultProps {
    scores: PlayerScore[];
    isHost: boolean;
    onReplay?: () => void;
    onBackToLobby?: () => void;
}

export function BattleResult({ scores, isHost, onReplay, onBackToLobby }: BattleResultProps) {
    const router = useRouter();
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);

    return (
        <Stack gap="xl" className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Card padding="xl" className="border-4 border-brand-primary shadow-2xl relative overflow-visible">
                <View className="absolute -top-10 left-1/2 -translate-x-1/2 p-6 bg-brand-primary text-white rounded-full shadow-2xl border-4 border-white">
                    <Trophy size={48} />
                </View>

                <Stack gap="xl" align="center" className="mt-8">
                    <Stack gap="none" align="center">
                        <Text variant="h2" weight="bold">BATTLE FINISHED!</Text>
                        <Text color="secondary">対戦結果</Text>
                    </Stack>

                    <Stack gap="md" className="w-full">
                        {sortedScores.map((player, index) => {
                            const isWinner = index === 0;
                            return (
                                <View
                                    key={player.user_id}
                                    className={cn(
                                        "p-6 rounded-2xl border-2 flex items-center justify-between transition-all",
                                        isWinner
                                            ? "bg-brand-primary/10 border-brand-primary shadow-lg scale-105"
                                            : "bg-surface-base border-surface-muted"
                                    )}
                                >
                                    <Flex gap="lg" align="center">
                                        <View className={cn(
                                            "w-12 h-12 rounded-full flex items-center justify-center font-black text-xl",
                                            index === 0 ? "bg-yellow-400 text-slate-900" :
                                                index === 1 ? "bg-slate-300 text-slate-800" :
                                                    index === 2 ? "bg-amber-600 text-white" :
                                                        "bg-surface-muted text-secondary"
                                        )}>
                                            {index === 0 ? <Medal size={24} /> : index + 1}
                                        </View>
                                        <Stack gap="none">
                                            <Text weight="bold" variant="h3" className={isWinner ? "text-brand-primary font-black" : ""}>
                                                {player.username}
                                                {isWinner && " 👑"}
                                            </Text>
                                            <Text variant="xs" color="secondary" weight="bold">
                                                {isWinner ? "WINNER" : "RANK " + (index + 1)}
                                            </Text>
                                        </Stack>
                                    </Flex>
                                    <View className="text-right">
                                        <Text variant="h2" weight="bold" color={isWinner ? "primary" : "secondary"}>
                                            {player.score.toLocaleString()}
                                        </Text>
                                        <Text variant="xs" color="muted" weight="bold">POINTS</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </Stack>

                    <Stack gap="md" className="w-full mt-6">
                        {isHost ? (
                            <>
                                <Button
                                    variant="solid"
                                    color="primary"
                                    className="py-6 text-lg font-bold shadow-lg shadow-brand-primary/20 gap-3"
                                    onClick={onReplay}
                                >
                                    <RotateCcw size={24} />
                                    同じ設定で再戦
                                </Button>
                                <Button
                                    variant="solid"
                                    color="secondary"
                                    className="py-6 text-lg font-bold gap-3"
                                    onClick={onBackToLobby}
                                >
                                    <Users size={24} />
                                    ロビーに戻る
                                </Button>
                            </>
                        ) : (
                            <View className="p-6 rounded-2xl bg-surface-muted text-center border-2 border-surface-muted animate-pulse">
                                <Text weight="bold" color="secondary">
                                    ホストが次のアクションを選択中...
                                </Text>
                            </View>
                        )}

                        <Button
                            variant="ghost"
                            className="py-4 text-secondary hover:text-primary gap-2"
                            onClick={() => router.push('/home')}
                        >
                            <Home size={20} />
                            終了してホームへ
                        </Button>
                    </Stack>
                </Stack>
            </Card>
        </Stack>
    );
}
