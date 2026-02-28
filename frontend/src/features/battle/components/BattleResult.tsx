"use client";

import React from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { PlayerScore } from '@/src/entities/battle';
import { Trophy, Home, RotateCcw, Medal, Users, MessageSquare, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { View } from '@/src/design/primitives/View';
import { cn } from '@/src/shared/utils/cn';
import { EditRequestModal } from '@/src/features/questions/components/EditRequestModal';
import { useState } from 'react';

interface BattleResultProps {
    scores: PlayerScore[];
    isHost: boolean;
    onReplay?: () => void;
    onBackToLobby?: () => void;
    roundSummaries?: {
        questionId: string;
        questionText: string;
        correctAnswer: string;
        correctCount: number;
    }[];
}

export function BattleResult({ scores, isHost, onReplay, onBackToLobby, roundSummaries = [] }: BattleResultProps) {
    const router = useRouter();
    const sortedScores = [...scores].sort((a, b) => b.score - a.score);
    const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);

    return (
        <Stack gap="xl" className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
            <Card padding="xl" border="primary" className="border-4 shadow-2xl relative overflow-visible">
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
                                    border={isWinner ? "primary" : "base"}
                                    className={cn(
                                        "p-6 rounded-2xl border-2 flex items-center justify-between transition-all",
                                        isWinner
                                            ? "bg-brand-primary/10 shadow-lg scale-105"
                                            : "bg-surface-base"
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
                                    variant="outline"
                                    color="secondary"
                                    className="py-6 text-lg font-bold gap-3 border-2 border-surface-muted hover:bg-surface-muted/10 text-foreground"
                                    onClick={onBackToLobby}
                                >
                                    <Users size={24} />
                                    ロビーに戻る
                                </Button>
                            </>
                        ) : (
                            <View border="base" className="p-6 rounded-2xl bg-surface-muted text-center border-2 animate-pulse">
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

            {/* Question Breakdown Section */}
            {roundSummaries.length > 0 && (
                <Card padding="lg" className="border-t-4 border-brand-primary">
                    <Stack gap="lg">
                        <Flex gap="sm" align="center">
                            <CheckCircle2 className="text-brand-primary" size={24} />
                            <Text variant="h3" weight="bold">ROUND BREAKDOWN</Text>
                        </Flex>

                        <Stack gap="md">
                            {roundSummaries.map((summary, idx) => (
                                <View key={idx} border="base" className="p-4 rounded-xl bg-surface-muted/30">
                                    <Flex justify="between" align="start" gap="md">
                                        <Stack gap="xs" className="flex-1">
                                            <Flex gap="sm" align="center">
                                                <View className="px-2 py-0.5 rounded bg-brand-primary/10 text-brand-primary text-[10px] font-bold">
                                                    Q{idx + 1}
                                                </View>
                                                <Text variant="detail" weight="bold" className="line-clamp-2">
                                                    {summary.questionText}
                                                </Text>
                                            </Flex>
                                            <Text variant="xs" color="secondary">
                                                正解: <span className="text-brand-primary font-medium">{summary.correctAnswer}</span>
                                            </Text>
                                        </Stack>

                                        <Stack align="end" gap="xs">
                                            <Flex align="center" gap="xs" className="bg-brand-primary/10 px-2 py-1 rounded-lg">
                                                <Text variant="xs" color="primary" weight="bold">{summary.correctCount}</Text>
                                                <Text variant="xs" color="secondary" className="scale-[0.8] origin-left">正解</Text>
                                            </Flex>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-[10px] gap-1 text-secondary hover:text-brand-primary"
                                                onClick={() => setSelectedQuestion({
                                                    id: summary.questionId,
                                                    questionText: summary.questionText,
                                                    correctAnswers: [summary.correctAnswer],
                                                    descriptionText: ''
                                                })}
                                            >
                                                <MessageSquare size={12} />
                                                修正提案
                                            </Button>
                                        </Stack>
                                    </Flex>
                                </View>
                            ))}
                        </Stack>
                    </Stack>
                </Card>
            )}

            {selectedQuestion && (
                <EditRequestModal
                    question={selectedQuestion}
                    onClose={() => setSelectedQuestion(null)}
                />
            )}
        </Stack>
    );
}
