import React from 'react';
import { Flex } from '@/src/design/primitives/Flex';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { View } from '@/src/design/primitives/View';
import { PlayerScore } from '@/src/entities/battle';
import { Clock, X } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

interface BattleQuizHeaderProps {
    players: PlayerScore[];
    buzzerQueue: string[];
    buzzedUserId: string | null;
    selfId: string | null;
    answerResult: { user_id: string, is_correct: boolean } | null;
    buzzTimesRef: React.MutableRefObject<Map<string, number>>;
    currentQuestionIndex: number;
    totalQuestions: number;
    expiresAtMs: number | null;
    lastRoundResult: any;
    timeLeftMs: number;
}

const ordinal = (n: number): string => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export function BattleQuizHeader({
    players,
    buzzerQueue,
    buzzedUserId,
    selfId,
    answerResult,
    buzzTimesRef,
    currentQuestionIndex,
    totalQuestions,
    expiresAtMs,
    lastRoundResult,
    timeLeftMs
}: BattleQuizHeaderProps) {
    return (
        <Stack gap="xs" className="px-1">
            <Flex gap="sm" className="justify-end overflow-x-auto no-scrollbar">
                {[...players]
                    .sort((a, b) => {
                        const bA = buzzerQueue.indexOf(a.user_id);
                        const bB = buzzerQueue.indexOf(b.user_id);
                        if (bA !== -1 && bB !== -1) return bA - bB;
                        if (bA !== -1) return -1;
                        if (bB !== -1) return 1;
                        return b.score - a.score;
                    })
                    .map((p) => {
                        const buzzIdx = buzzerQueue.indexOf(p.user_id);
                        const isBuzzed = buzzIdx !== -1;
                        const isActive = buzzedUserId === p.user_id;
                        const isUserResult = answerResult?.user_id === p.user_id;
                        const buzzTime = buzzTimesRef.current.get(p.user_id);

                        return (
                            <View key={p.user_id} className="flex flex-col items-center gap-0 shrink-0">
                                <View className="h-[14px] flex items-end justify-center">
                                    <Text className="text-[9px] font-mono text-brand-primary/80 leading-tight h-3 text-center">
                                        {buzzTime !== undefined ? `${(buzzTime / 1000).toFixed(1)}s` : ''}
                                    </Text>
                                </View>

                                <View className="relative mt-0.5">
                                    <View className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center bg-surface-muted overflow-hidden font-bold text-sm",
                                        p.user_id === selfId ? "ring-2 ring-brand-primary ring-offset-1" : "",
                                        isActive ? "ring-2 ring-yellow-400 ring-offset-1" : ""
                                    )}>
                                        {p.icon_url
                                            ? <View as="img" src={p.icon_url} alt={p.username} className="w-full h-full object-cover" />
                                            : <Text as="span" className="font-bold">{p.username.charAt(0).toUpperCase()}</Text>}
                                    </View>
                                    {isUserResult && (
                                        <View className="absolute inset-0 rounded-full flex items-center justify-center animate-in zoom-in duration-300 z-20 overflow-hidden pointer-events-none">
                                            {answerResult!.is_correct
                                                ? <View className="w-8 h-8 rounded-full border-[5px] border-brand-success" />
                                                : <X size={40} strokeWidth={5} className="text-brand-danger drop-shadow-sm" />}
                                        </View>
                                    )}
                                    {isBuzzed && (
                                        <View className={cn(
                                            "absolute -bottom-1 -left-1 px-1 min-w-[18px] h-4 rounded-full flex items-center justify-center text-[8px] font-black border border-white leading-none z-10",
                                            isActive ? "bg-yellow-400 text-slate-900" : "bg-surface-muted text-white"
                                        )}>
                                            {ordinal(buzzIdx + 1)}
                                        </View>
                                    )}
                                </View>

                                <Text className="text-[9px] font-bold max-w-[48px] px-1 break-words text-center leading-tight mt-0.5" style={{ wordBreak: 'break-word', overflowWrap: 'break-word', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                    {p.username}
                                </Text>

                                <Text className="text-[10px] font-black font-mono text-brand-primary leading-tight">
                                    {p.score}
                                </Text>
                            </View>
                        );
                    })}
            </Flex>

            <Flex align="center" className="w-full">
                <View className="flex-1" />
                <Text variant="xs" color="primary" weight="bold" className="flex-1 text-center uppercase tracking-widest opacity-60 text-[10px]">
                    {currentQuestionIndex + 1} / {totalQuestions}
                </Text>
                <View className="flex-1 flex justify-end">
                    {expiresAtMs && !lastRoundResult && (
                        <Flex gap="xs" align="center">
                            <Clock size={11} className={cn(timeLeftMs < 5000 ? "text-brand-danger animate-pulse" : "text-secondary")} />
                            <Text className={cn("text-[10px] font-mono font-bold", timeLeftMs < 5000 ? "text-brand-danger" : "text-secondary")}>
                                {(timeLeftMs / 1000).toFixed(1)}s
                            </Text>
                        </Flex>
                    )}
                </View>
            </Flex>
        </Stack>
    );
}
