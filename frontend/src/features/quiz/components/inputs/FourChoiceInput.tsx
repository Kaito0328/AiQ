"use client";

import React from 'react';
import { Stack } from '@/src/design/primitives/Stack';
import { View } from '@/src/design/primitives/View';
import { Button } from '@/src/design/baseComponents/Button';
import { useMemo } from 'react';

export const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
};

interface FourChoiceInputProps {
    correctAnswers: string[];
    distractors: string[];
    onInput: (choice: string) => void;
    disabled?: boolean;
}

export const FourChoiceInput = ({ correctAnswers, distractors, onInput, disabled }: FourChoiceInputProps) => {
    const choices = useMemo(() => {
        const all = [correctAnswers[0], ...distractors];
        return shuffleArray(all);
    }, [correctAnswers, distractors]);

    return (
        <Stack gap="md" className="w-full">
            <View className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4">
                {choices.map((choice, i) => (
                    <Button
                        key={`${choice}-${i}`}
                        variant="outline"
                        disabled={disabled}
                        className="h-16 text-lg font-bold bg-surface-base hover:bg-brand-primary/10 hover:border-brand-primary active:scale-95 transition-all rounded-xl shadow-sm border-2"
                        onClick={() => onInput(choice)}
                    >
                        {choice}
                    </Button>
                ))}
            </View>
        </Stack>
    );
};
