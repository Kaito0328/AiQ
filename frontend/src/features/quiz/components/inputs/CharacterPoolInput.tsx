"use client";

import React from 'react';
import { Stack } from '@/src/design/primitives/Stack';
import { View } from '@/src/design/primitives/View';
import { Button } from '@/src/design/baseComponents/Button';
import { useMemo } from 'react';
import { shuffleArray } from './FourChoiceInput';
import AppConfig from '@/src/app_config';

const KATAKANA_POOL = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン";
const ALPHA_UPPER_POOL = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const ALPHA_LOWER_POOL = "abcdefghijklmnopqrstuvwxyz";
const DIGIT_POOL = "0123456789";
const HIRAGANA_POOL = "あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん";

const getCharType = (char: string) => {
    // Basic Hiragana
    if (/[\u3041-\u3096\u30FC]/.test(char)) return 'hiragana';
    // Basic Katakana
    if (/[\u30A1-\u30FA\u30FC]/.test(char)) return 'katakana';
    // Alphabets
    if (/[A-Z]/.test(char)) return 'alpha_upper';
    if (/[a-z]/.test(char)) return 'alpha_lower';
    // Digits
    if (/[0-9]/.test(char)) return 'digit';
    return 'other';
};

const getPoolForType = (type: string) => {
    switch (type) {
        case 'hiragana': return HIRAGANA_POOL.split('');
        case 'katakana': return KATAKANA_POOL.split('');
        case 'alpha_upper': return ALPHA_UPPER_POOL.split('');
        case 'alpha_lower': return ALPHA_LOWER_POOL.split('');
        case 'digit': return DIGIT_POOL.split('');
        default: return (HIRAGANA_POOL + KATAKANA_POOL + ALPHA_UPPER_POOL + ALPHA_LOWER_POOL + DIGIT_POOL + " .,!?'\"-").split('');
    }
};

const CONFUSING_SETS = [
    ['ア', 'ァ', 'あ', 'ぁ'],
    ['イ', 'ィ', 'い', 'ぃ'],
    ['ウ', 'ゥ', 'う', 'ぅ', 'ヴ'],
    ['エ', 'ェ', 'え', 'ぇ'],
    ['オ', 'ォ', 'お', 'ぉ'],
    ['カ', 'ガ', 'か', 'が'],
    ['キ', 'ギ', 'き', 'ぎ'],
    ['ク', 'グ', 'く', 'ぐ'],
    ['ケ', 'ゲ', 'け', 'げ'],
    ['コ', 'ゴ', 'こ', 'ご'],
    ['サ', 'ザ', 'さ', 'ざ'],
    ['シ', 'ジ', 'し', 'じ', 'ツ', 'ッ'], // 'シ' and 'ツ' visual similarity + voicing
    ['ス', 'ズ', 'す', 'ず'],
    ['セ', 'ゼ', 'せ', 'ぜ'],
    ['ソ', 'ゾ', 'そ', 'ぞ', 'ン'], // 'ソ' and 'ン' visual similarity + voicing
    ['タ', 'ダ', 'た', 'だ'],
    ['チ', 'ヂ', 'ち', 'ぢ'],
    ['ツ', 'ヅ', 'ッ', 'つ', 'づ', 'っ'],
    ['テ', 'デ', 'て', 'で'],
    ['ト', 'ド', 'と', 'ど'],
    ['ハ', 'バ', 'パ', 'は', 'ば', 'ぱ'],
    ['ヒ', 'ビ', 'ピ', 'ひ', 'び', 'ぴ'],
    ['フ', 'ブ', 'プ', 'ふ', 'ぶ', 'ぷ'],
    ['ヘ', 'ベ', 'ペ', 'へ', 'べ', 'ぺ'],
    ['ホ', 'ボ', 'ポ', 'ほ', 'ぼ', 'ぽ'],
    ['ヤ', 'ャ', 'や', 'ゃ'],
    ['ユ', 'ュ', 'ゆ', 'ゅ'],
    ['ヨ', 'ョ', 'よ', 'ょ'],
    ['ワ', 'ヮ', 'わ', 'ゎ'],
];

interface CharacterPoolInputProps {
    rubis?: string[];
    answers?: string[];
    onInput: (char: string) => void;
    currentInput: string;
    decoyCount?: number;
    distractors?: string[];
}

export const CharacterPoolInput = ({ rubis = [], answers = [], onInput, currentInput, decoyCount = AppConfig.quiz.default_dummy_char_count, distractors = [] }: CharacterPoolInputProps) => {
    const pool = useMemo(() => {
        const hasKanji = (text: string) => /[\u4E00-\u9FAF]/.test(text);

        // 1. Select the "Representative" target answer
        // Criteria: Prefer first one with rubi or no kanji
        let targetIndex = 0;
        let isRubiTarget = false;

        for (let i = 0; i < answers.length; i++) {
            const rubi = rubis[i]?.trim();
            const ans = answers[i]?.trim();
            if (rubi && rubi.length > 0) {
                targetIndex = i;
                isRubiTarget = true;
                break;
            }
            if (ans && ans.length > 0 && !hasKanji(ans)) {
                targetIndex = i;
                isRubiTarget = false;
                break;
            }
        }

        const targetSource = isRubiTarget ? rubis : answers;
        const target = (targetSource[targetIndex] || "").replace(/\s/g, "");
        if (!target) return [];

        const inputNoSpaces = currentInput.replace(/\s/g, "");
        if (inputNoSpaces.length >= target.length) return [];

        const nextChar = target[inputNoSpaces.length];

        // 2. Identify all characters from ALL correct answers (to exclude from decoys)
        // And find the first characters of all variants
        const allAnswerChars = new Set<string>();
        const allAnswerStarts = new Set<string>();

        answers.forEach((ans, i) => {
            const a = ans.replace(/\s/g, "");
            if (a.length > 0) {
                allAnswerStarts.add(a[0]);
                for (const char of a) allAnswerChars.add(char);
            }
            const r = (rubis[i] || "").replace(/\s/g, "");
            if (r.length > 0) {
                allAnswerStarts.add(r[0]);
                for (const char of r) allAnswerChars.add(char);
            }
        });

        const poolChars = [nextChar];
        const nextCharType = getCharType(nextChar);

        // 3. Initial character logic: Include heads of distractors
        // BUT exclude if they match ANY correct answer's start character
        if (inputNoSpaces.length === 0 && distractors && distractors.length > 0) {
            distractors.forEach(d => {
                const firstChar = d.trim().charAt(0);
                if (firstChar && getCharType(firstChar) === nextCharType) {
                    // Check if it's already in pool OR if it collides with ANY answer start
                    if (!poolChars.includes(firstChar) && !allAnswerStarts.has(firstChar)) {
                        poolChars.push(firstChar);
                    }
                }
            });
        }

        const decoyPool = getPoolForType(nextCharType);

        // 4. Exclude characters from ANY correct answers (other than potential next correct ones?)
        // The user said "それ以外の正解の文字を含まないようにして下さい" - interpreted as excluding all answer chars from decoys
        const toExclude = new Set<string>(poolChars);
        allAnswerChars.forEach(c => toExclude.add(c));

        CONFUSING_SETS.forEach(set => {
            if (set.includes(nextChar)) {
                set.forEach(c => toExclude.add(c));
            }
        });

        const availableDecoys = decoyPool.filter(c => !toExclude.has(c));
        const shuffledDecoys = shuffleArray(availableDecoys);

        // Fill up to decoyCount
        while (poolChars.length < decoyCount && shuffledDecoys.length > 0) {
            const decoy = shuffledDecoys.pop()!;
            if (!poolChars.includes(decoy)) {
                poolChars.push(decoy);
            }
        }

        // Final fallback if still short
        const allFallback = shuffleArray(HIRAGANA_POOL.split(''));
        while (poolChars.length < decoyCount && allFallback.length > 0) {
            const decoy = allFallback.pop()!;
            if (!poolChars.includes(decoy) && !toExclude.has(decoy)) {
                poolChars.push(decoy);
            }
        }

        return shuffleArray(poolChars);
    }, [rubis.join('|'), answers.join('|'), currentInput, decoyCount, distractors.join('|')]);

    if (pool.length === 0) return null;

    return (
        <Stack gap="md" className="w-full">
            <View className="grid grid-cols-6 gap-2 p-2 sm:p-4 bg-surface-muted/50 rounded-2xl border border-surface-muted shadow-inner justify-items-center">
                {pool.map((char, i) => (
                    <Button
                        key={`${char}-${i}`}
                        variant="outline"
                        className="w-full aspect-square p-0 text-lg md:text-2xl font-black bg-surface-base hover:bg-brand-primary/10 hover:border-brand-primary active:scale-90 active:bg-brand-primary active:text-white transition-all rounded-xl shadow-sm min-w-0"
                        onClick={() => onInput(char)}
                    >
                        {char}
                    </Button>
                ))}
            </View>
        </Stack>
    );
};
