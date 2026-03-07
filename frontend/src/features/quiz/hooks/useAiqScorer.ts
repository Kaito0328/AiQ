"use client"
import { logger } from '@/src/shared/utils/logger';

import { useRef, useState, useCallback } from 'react';

// ───────────────────────────────────────────────────────────
// Module-level singleton so the model survives re-renders
// and is never loaded more than once per browser session.
// ───────────────────────────────────────────────────────────
let _extractor: any = null;
let _loadPromise: Promise<void> | null = null;

const MODEL_ID = 'Miya67/aiq-scoring-e5-small';
const THRESHOLD = 0.80;

function normalizeText(text: string): string {
    // Full-width → half-width, lowercase, collapse whitespace
    return text
        .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0))
        .toLowerCase()
        .replace(/\s+/g, '');
}

function hasKanji(text: string): boolean {
    return /[\u4e00-\u9faf]/.test(text);
}

/** Try to find the hiragana reading of `expected` using the question's answerRubis.
 *  correctAnswers[i] ↔ answerRubis[i]
 *  Falls back to undefined if not found. */
function rubisToHiragana(
    expected: string,
    correctAnswers: string[],
    answerRubis?: string[]
): string | undefined {
    if (!answerRubis || answerRubis.length === 0) return undefined;
    const idx = correctAnswers.indexOf(expected);
    if (idx !== -1 && answerRubis[idx]) return answerRubis[idx];
    return undefined;
}

async function cosineSim(a: Float32Array | number[], b: Float32Array | number[]): Promise<number> {
    const { cos_sim } = await import('@huggingface/transformers');
    return cos_sim(a as any, b as any);
}

async function evaluatePair(extractor: any, question: string, expected: string, userAnswer: string): Promise<number> {
    const promptExpected = `query: 問題: ${question} 回答: ${expected}`;
    const promptUser = `query: 問題: ${question} 回答: ${userAnswer}`;
    const [outExp, outUser] = await Promise.all([
        extractor(promptExpected, { pooling: 'mean', normalize: true }),
        extractor(promptUser, { pooling: 'mean', normalize: true }),
    ]);
    return cosineSim(outExp.data, outUser.data);
}

export function useAiqScorer() {
    const [isLoading, setIsLoading] = useState(false);
    const [isReady, setIsReady] = useState(_extractor !== null);
    const [progress, setProgress] = useState(0);
    const abortRef = useRef(false);

    const load = useCallback(async () => {
        if (_extractor) {
            setIsReady(true);
            return;
        }
        if (_loadPromise) {
            setIsLoading(true);
            await _loadPromise;
            setIsLoading(false);
            setIsReady(true);
            return;
        }

        setIsLoading(true);
        setProgress(0);

        _loadPromise = (async () => {
            const { pipeline, env } = await import('@huggingface/transformers');
            // Use browser cache so subsequent loads are instant
            env.useBrowserCache = true;

            let maxProgress = 0;

            _extractor = await pipeline(
                'feature-extraction',
                MODEL_ID,
                {
                    subfolder: 'onnx',
                    quantized: true,
                    progress_callback: (info: any) => {
                        // progress fires per-file; cap at the highest value seen so far
                        // to avoid the counter jumping backwards between files
                        if (typeof info.progress === 'number') {
                            const p = Math.round(info.progress);
                            maxProgress = Math.max(maxProgress, p);
                            setProgress(maxProgress);
                        } else if (info.status === 'done') {
                            maxProgress = Math.max(maxProgress, 95);
                            setProgress(maxProgress);
                        }
                    },
                } as any
            );
        })();

        try {
            await _loadPromise;
            if (!abortRef.current) {
                setIsReady(true);
                setProgress(100);
            }
        } catch (err) {
            logger.error('[AiqScorer] Failed to load model:', err);
            _loadPromise = null;
        } finally {
            if (!abortRef.current) setIsLoading(false);
        }
    }, []);

    /**
     * Evaluate whether `userAnswer` is semantically close enough to any of the
     * correct answers (or their rubis). Returns the best similarity score (0–1)
     * and whether it cleared the threshold.
     *
     * All correct answer candidates and rubis are checked; the maximum score wins.
     */
    const evaluate = useCallback(async (
        questionText: string,
        correctAnswers: string[],
        userAnswer: string,
        answerRubis?: string[]
    ): Promise<{ correct: boolean; topScore: number }> => {
        if (!_extractor) return { correct: false, topScore: 0 };

        const normalizedUser = normalizeText(userAnswer);
        let topScore = 0;

        // Build candidate list: each correct answer + its rubi (if present)
        const candidates: string[] = [];
        for (let i = 0; i < correctAnswers.length; i++) {
            candidates.push(correctAnswers[i]);
            // Also push the corresponding rubi (hiragana reading)
            if (answerRubis && answerRubis[i]) {
                candidates.push(answerRubis[i]);
            }
        }

        for (const candidate of candidates) {
            // Exact match shortcut
            if (normalizeText(candidate) === normalizedUser) {
                return { correct: true, topScore: 1 };
            }

            const score = await evaluatePair(_extractor, questionText, candidate, userAnswer);
            topScore = Math.max(topScore, score);

            // If kanji present and no rubi for this candidate, also check if userAnswer
            // might be the hiragana of the candidate (we already included rubis above,
            // so this handles the case where the user typed hiragana for a kanji answer
            // but no rubi was registered — compare user↔candidate without rubi)
            if (hasKanji(candidate) && !answerRubis) {
                // No rubis available; raw score is the best we can do
            }
        }

        return { correct: topScore >= THRESHOLD, topScore };
    }, []);

    return { isLoading, isReady, progress, load, evaluate };
}
