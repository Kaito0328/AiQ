import React from 'react';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Flex } from '@/src/design/primitives/Flex';
import { cn } from '@/src/shared/utils/cn';
import { LucideIcon } from 'lucide-react';

interface BattleQuestionDisplayProps {
    revealedText: string;
    unrevealedText: string;
    isRevealed: boolean;
    hasBuzzed: boolean;
    showFullQuestion: boolean;
    genre: string;
    difficulty: string;
}

export function BattleQuestionDisplay({
    revealedText,
    unrevealedText,
    isRevealed,
    hasBuzzed,
    showFullQuestion,
    genre,
    difficulty
}: BattleQuestionDisplayProps) {
    // Basic difficulty color mapping
    const getDifficultyColor = (diff: string) => {
        switch (diff.toLowerCase()) {
            case 'easy': return 'text-brand-success';
            case 'normal': return 'text-brand-warning';
            case 'hard': return 'text-brand-danger';
            case 'extreme': return 'text-brand-danger animate-pulse';
            default: return 'text-brand-primary';
        }
    };

    return (
        <View className="flex-1 w-full flex flex-col items-center justify-center p-2 min-h-[min(30vh,250px)] max-h-[40vh] relative mb-1">
            <View className={cn(
                "w-full h-full p-4 md:p-6 rounded-2xl flex flex-col items-center justify-center relative shadow-sm border overflow-hidden",
                hasBuzzed
                    ? "bg-brand-primary/10 border-brand-primary/30"
                    : "bg-surface-elevated border-surface-muted",
                showFullQuestion && "shadow-brand-primary/20",
                "transition-all duration-300 ease-out"
            )}>
                {showFullQuestion && (
                    <View className="absolute inset-0 bg-brand-primary/5 animate-pulse rounded-2xl pointer-events-none" />
                )}

                <Flex gap="sm" align="center" className="absolute top-2 left-3 opacity-60">
                    <Text variant="xs" weight="bold" className="uppercase tracking-widest text-[#7C3AED]">
                        {genre || "GENERAL"}
                    </Text>
                    <View className="w-1 h-1 rounded-full bg-surface-muted" />
                    <Text variant="xs" weight="bold" className={cn("uppercase tracking-widest", getDifficultyColor(difficulty))}>
                        {difficulty || "NORMAL"}
                    </Text>
                </Flex>

                <View className="w-full mt-4 flex items-center justify-center min-h-[120px]">
                    <Text
                        className={cn(
                            "text-2xl md:text-3xl lg:text-4xl font-bold text-center leading-[1.4] transition-all duration-300",
                            hasBuzzed && !showFullQuestion ? "animate-pulse shadow-sm" : ""
                        )}
                        style={{
                            wordBreak: 'keep-all',
                            overflowWrap: 'anywhere',
                            textWrap: 'balance' as any
                        }}
                    >
                        <Text as="span" className={cn(
                            "text-brand-primary drop-shadow-sm font-black transition-colors duration-300",
                            hasBuzzed && !showFullQuestion ? "text-brand-primary" : "text-brand-primary"
                        )}>
                            {revealedText}
                        </Text>
                        {!isRevealed && !showFullQuestion && (
                            <Text as="span" className={cn(
                                "opacity-40",
                                hasBuzzed ? "blur-[2px] opacity-20 transition-all duration-500" : ""
                            )}>
                                {unrevealedText}
                            </Text>
                        )}
                    </Text>
                </View>
            </View>
        </View>
    );
}
