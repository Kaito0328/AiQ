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
import { AlertCircle } from 'lucide-react';
import { BackButton } from '@/src/shared/components/Navigation/BackButton';

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
        lastRoundResult,
        answerResult,
        expiresAtMs,
        maxBuzzes,
        selfId,
        selfUsername,
        error,
        isConnected,
        startMatch,
        buzz,
        submitAnswer,
        updateConfig,
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
                        onResetMatch={resetMatch}
                        selfId={selfId}
                    />
                )}

                {room.status === 'Playing' && questions.length > 0 && currentQuestionIndex >= 0 && (
                    <BattleQuiz
                        question={questions[currentQuestionIndex]}
                        buzzedUserId={buzzedUserId}
                        lastRoundResult={lastRoundResult}
                        players={room.players}
                        selfId={selfId}
                        onBuzz={buzz}
                        onSubmit={submitAnswer}
                        expiresAtMs={expiresAtMs}
                        answerResult={answerResult}
                        currentQuestionIndex={currentQuestionIndex}
                        totalQuestions={questions.length}
                    />
                )}

                {room.status === 'Finished' && (
                    <BattleResult
                        scores={room.players}
                        isHost={isHost}
                        onBackToLobby={backToLobby}
                        onReplay={startMatch} // Replay same questions
                    />
                )}
            </div>
        </div>
    );
}

