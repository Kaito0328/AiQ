"use client";

import React from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { useBattle } from '@/src/features/battle/hooks/useBattle';
import { BattleLobby } from '@/src/features/battle/components/BattleLobby';
import { BattleQuiz } from '@/src/features/battle/components/BattleQuiz';
import { BattleResult } from '@/src/features/battle/components/BattleResult';
import { useAuth } from '@/src/shared/auth/useAuth';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { Flex } from '@/src/design/primitives/Flex';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { AlertCircle, Zap } from 'lucide-react';
import { BackButton } from '@/src/shared/components/Navigation/BackButton';
import { Stack } from '@/src/design/primitives/Stack';

export default function BattlePage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const { user } = useAuth();

    const roomId = params.roomId as string;
    const joinToken = searchParams.get('token') || '';

    const {
        room,
        questions,
        currentQuestionIndex,
        buzzedUserId,
        buzzedUserIds,
        submittedUserIds,
        lastRoundResult,
        answerResult,
        expiresAtMs,
        isPreparing,
        maxBuzzes,
        selfId,
        roundSummaries,
        error,
        isConnected,
        startMatch,
        buzz,
        submitAnswer,
        updateConfig,
        updateVisibility,
        backToLobby,
        resetMatch
    } = useBattle(roomId, joinToken);

    if (error) {
        return (
            <div className="container mx-auto py-12 px-4">
                <BackButton />
                <Flex direction="column" align="center" justify="center" className="min-h-[50vh] text-center gap-4">
                    <View className="p-4 rounded-full bg-brand-danger/10 text-brand-danger">
                        <AlertCircle size={48} />
                    </View>
                    <Text variant="h3" color="danger" weight="bold">エラーが発生しました</Text>
                    <Text color="secondary">{error}</Text>
                </Flex>
            </div>
        );
    }

    if (!isConnected || !room) {
        return (
            <div className="container mx-auto py-12 px-4">
                <Flex direction="column" align="center" justify="center" className="min-h-[50vh] gap-4">
                    <Spinner size="lg" />
                    <Text color="secondary" weight="bold">サーバーに接続中...</Text>
                </Flex>
            </div>
        );
    }

    const isHost = user?.id === room.host_id;

    return (
        <div className="min-h-screen bg-surface-muted/30">
            <div className="container mx-auto py-8 md:py-12 px-4">
                {room.status === 'Waiting' && (
                    <BattleLobby
                        room={room}
                        isHost={isHost}
                        onStart={startMatch}
                        onUpdateConfig={updateConfig}
                        maxBuzzes={maxBuzzes}
                        onUpdateVisibility={updateVisibility}
                        onResetMatch={resetMatch}
                        selfId={selfId}
                    />
                )}

                {room.status === 'Playing' && isPreparing && (
                    <Flex direction="column" align="center" justify="center" className="min-h-[60vh] gap-8 animate-in fade-in zoom-in duration-500">
                        <View className="relative">
                            <View className="absolute inset-0 bg-brand-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                            <View className="relative p-8 md:p-12 rounded-full bg-surface-base border-4 border-brand-primary/30 shadow-2xl flex flex-col items-center justify-center">
                                <Zap size={64} className="text-brand-primary animate-bounce mb-4" />
                                <Text variant="h2" weight="bold" color="primary" className="tracking-widest">GET READY</Text>
                            </View>
                        </View>

                        <Stack gap="sm" align="center">
                            <Text color="secondary" weight="bold" className="uppercase tracking-[0.3em] opacity-60">クイズを準備中...</Text>
                            <Flex gap="xs" align="center">
                                <View className="w-2 h-2 rounded-full bg-brand-primary animate-ping" />
                                <View className="w-2 h-2 rounded-full bg-brand-primary animate-ping [animation-delay:0.2s]" />
                                <View className="w-2 h-2 rounded-full bg-brand-primary animate-ping [animation-delay:0.4s]" />
                            </Flex>
                        </Stack>
                    </Flex>
                )}

                {room.status === 'Playing' && !isPreparing && questions.length > 0 && currentQuestionIndex >= 0 && currentQuestionIndex < questions.length && (
                    <BattleQuiz
                        question={questions[currentQuestionIndex]}
                        buzzedUserId={buzzedUserId}
                        buzzedUserIds={buzzedUserIds}
                        submittedUserIds={submittedUserIds}
                        lastRoundResult={lastRoundResult}
                        players={room.players}
                        selfId={selfId}
                        onBuzz={buzz}
                        onSubmit={submitAnswer}
                        expiresAtMs={expiresAtMs}
                        answerResult={answerResult}
                        currentQuestionIndex={currentQuestionIndex}
                        totalQuestions={questions.length}
                        maxBuzzes={maxBuzzes}
                    />
                )}

                {room.status === 'Finished' && (
                    <BattleResult
                        scores={room.players}
                        isHost={isHost}
                        onBackToLobby={backToLobby}
                        onReplay={startMatch} // Replay same questions
                        roundSummaries={roundSummaries}
                    />
                )}
            </div>
        </div>
    );
}

