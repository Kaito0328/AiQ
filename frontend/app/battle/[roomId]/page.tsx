"use client";

import React, { Suspense } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
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

function BattlePageContent() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();

    const roomId = params.roomId as string;
    const joinToken = searchParams.get('token') || '';

    const {
        room,
        questions,
        currentQuestionIndex,
        buzzedUserId,
        buzzerQueue,
        buzzedUserIds,
        submittedUserIds,
        lastRoundResult,
        answerResult,
        expiresAtMs,
        isPreparing,
        maxBuzzes,
        config,
        selfId,
        partialAnswers,
        activeBuzzers,
        roundSummaries,
        error,
        isConnected,
        startMatch,
        buzz,
        submitAnswer,
        submitPartialAnswer,
        updateConfig,
        updateMatchConfig,
        updateVisibility,
        backToLobby,
        resetMatch,
        updateLocalQuestion
    } = useBattle(roomId, joinToken);

    // Show loading while connecting, even if there's a transient error
    if (!isConnected || !room) {
        return (
            <div className="container mx-auto py-12 px-4">
                <Flex direction="column" align="center" justify="center" className="min-h-[50vh] gap-4">
                    <Spinner size="lg" />
                    <Text color="secondary" weight="bold">サーバーに接続中...</Text>
                    {error && (
                        <Text variant="xs" color="danger" className="animate-pulse">
                            接続エラーが発生しています：{error}
                        </Text>
                    )}
                </Flex>
            </div>
        );
    }

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

    const isHost = React.useMemo(() => {
        if (!user || !room) return false;
        return user.id.toLowerCase() === room.host_id.toLowerCase();
    }, [user, room]);

    return (
        <div className="h-[100dvh] overflow-hidden bg-surface-muted/30 flex flex-col">
            <div className="flex-1 flex flex-col overflow-y-auto w-full max-w-5xl mx-auto px-2 sm:px-4 py-2 sm:py-4">
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
                        config={config}
                        onUpdateMatchConfig={updateMatchConfig}
                        onLeave={() => router.push('/home')}
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
                        buzzerQueue={buzzerQueue}
                        submittedUserIds={submittedUserIds}
                        lastRoundResult={lastRoundResult}
                        players={room.players}
                        selfId={selfId}
                        onBuzz={buzz}
                        onSubmit={submitAnswer}
                        onPartialSubmit={submitPartialAnswer}
                        partialAnswers={partialAnswers}
                        activeBuzzers={activeBuzzers}
                        expiresAtMs={expiresAtMs}
                        answerResult={answerResult}
                        currentQuestionIndex={currentQuestionIndex}
                        totalQuestions={questions.length}
                        maxBuzzes={maxBuzzes}
                        preferredMode={room.preferred_mode}
                        dummyCharCount={room.dummy_char_count}
                        config={config}
                        onBackToLobby={backToLobby}
                        onUpdateLocalQuestion={updateLocalQuestion}
                        isHost={isHost}
                    />
                )}

                {room.status === 'Finished' && (
                    <BattleResult
                        scores={room.players}
                        isHost={isHost}
                        onBackToLobby={backToLobby}
                        onReplay={startMatch}
                        roundSummaries={roundSummaries}
                        onUpdateLocalQuestion={updateLocalQuestion}
                    />
                )}
            </div>
        </div>
    );
}

export default function BattlePage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto py-12 px-4">
                <Flex direction="column" align="center" justify="center" className="min-h-[50vh] gap-4">
                    <Spinner size="lg" />
                    <Text color="secondary" weight="bold">読み込み中...</Text>
                </Flex>
            </div>
        }>
            <BattlePageContent />
        </Suspense>
    );
}
