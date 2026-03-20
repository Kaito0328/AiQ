"use client";

import React, { useMemo, useState } from "react";
import { Card } from "@/src/design/baseComponents/Card";
import { Stack } from "@/src/design/primitives/Stack";
import { Flex } from "@/src/design/primitives/Flex";
import { Text } from "@/src/design/baseComponents/Text";
import { Button } from "@/src/design/baseComponents/Button";
import { Input } from "@/src/design/baseComponents/Input";
import { View } from "@/src/design/primitives/View";
import { Send, AlertCircle, Zap } from "lucide-react";
import { Question } from "@/src/entities/question";
import { FourChoiceInput } from "./inputs/FourChoiceInput";
import { CharacterPoolInput } from "./inputs/CharacterPoolInput";
import { useEffect } from "react";
import AppConfig from "@/src/app_config";

type ChipTarget = {
  answer: string;
  rubi?: string;
};

function hasKanji(text: string): boolean {
  return /[\u4E00-\u9FAF]/.test(text);
}

function resolveChipTarget(question: Question): ChipTarget | null {
  const explicitChip = (question.chipAnswer || "").trim();
  if (explicitChip.length > 0) {
    return {
      answer: question.correctAnswers[0] || explicitChip,
      rubi: explicitChip,
    };
  }

  const candidates: ChipTarget[] = [];
  question.correctAnswers.forEach((ans, index) => {
    const answer = (ans || "").trim();
    const rubi = (question.answerRubis?.[index] || "").trim();
    if (!answer) return;

    // chipAnswer が無い場合: 漢字なし、またはルビありのものだけ候補にする
    if (!hasKanji(answer) || rubi.length > 0) {
      candidates.push({
        answer,
        rubi: rubi || undefined,
      });
    }
  });

  if (candidates.length === 0) {
    return null;
  }

  // ルビがある場合はルビ、ない場合は回答文字列を比較対象にして最短を選ぶ
  candidates.sort((a, b) => {
    const aText = (a.rubi || a.answer).replace(/\s/g, "");
    const bText = (b.rubi || b.answer).replace(/\s/g, "");
    if (aText.length !== bText.length) {
      return aText.length - bText.length;
    }
    return aText.localeCompare(bText, "ja");
  });

  return candidates[0];
}

interface QuizFormProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onSubmitAnswer: (answer: string) => void;
  preferredMode?: string;
  dummyCharCount?: number;
}

export function QuizForm({
  question,
  questionNumber,
  totalQuestions,
  onSubmitAnswer,
  preferredMode = "fourChoice",
  dummyCharCount = AppConfig.quiz.default_dummy_char_count,
}: QuizFormProps) {
  const [answer, setAnswer] = useState("");
  const [activeMode, setActiveMode] = useState<string>(preferredMode);
  const [showFallback, setShowFallback] = useState(false);
  const chipTarget = useMemo(() => resolveChipTarget(question), [question]);

  // Mode fallback logic
  useEffect(() => {
    // 1. Initial mode choice
    let targetMode = question.isSelectionOnly ? "fourChoice" : preferredMode;

    // 2. Compatibility Checks & Fallbacks

    // 4-choice fallback: needs distractors
    if (
      targetMode === "fourChoice" &&
      (!question.distractors || question.distractors.length === 0)
    ) {
      // If it was forced by isSelectionOnly but has no distractors, this is a data error,
      // but we fallback to text to keep it playable.
      targetMode = "text";
    }

    // Chips fallback: needs explicit chipAnswer OR derivable chip target
    if (targetMode === "chips" && !chipTarget) {
      targetMode = "text";
    }

    if (targetMode !== activeMode) {
      // Show fallback warning if the mode was changed from what was requested (either via prop or isSelectionOnly)
      const isForcedFailure =
        question.isSelectionOnly && targetMode !== "fourChoice";
      const isPreferenceFailure =
        !question.isSelectionOnly && targetMode !== preferredMode;

      if (isForcedFailure || isPreferenceFailure) {
        setShowFallback(true);
        const timer = setTimeout(() => setShowFallback(false), 3000);
        setActiveMode(targetMode);
        return () => clearTimeout(timer);
      }

      setActiveMode(targetMode);
    }
  }, [question, preferredMode, activeMode, chipTarget]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!answer.trim()) return;
    onSubmitAnswer(answer.trim());
    setAnswer("");
  };

  return (
    <Card className="border border-gray-300 w-full max-w-2xl mx-auto flex flex-col max-h-full overflow-hidden">
      <Stack gap="md" className="flex-1 overflow-y-auto p-4 sm:p-6">
        {/* Question */}
        <View className="py-2 text-center relative shrink-0">
          {/* Fallback Notification */}
          {showFallback && (
            <View className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-brand-primary text-white text-xs font-bold rounded-full shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4 z-50 whitespace-nowrap border-2 border-white/20">
              <Zap size={14} fill="white" />
              {question.isSelectionOnly
                ? "この問題は4択のみ有効です。4択でお答えください。"
                : "モード未対応のため、最適な回答方式に切り替えました"}
            </View>
          )}
          <Text
            variant="h3"
            weight="bold"
            className="leading-tight sm:leading-relaxed text-lg sm:text-2xl"
          >
            {question.questionText}
          </Text>
        </View>

        {/* Answer Input */}
        <View className="flex-1 flex flex-col items-center justify-center min-h-0 overflow-y-auto">
          {activeMode === "fourChoice" ? (
            <View className="w-full max-w-lg">
              <FourChoiceInput
                correctAnswers={question.correctAnswers}
                distractors={question.distractors || []}
                onInput={(val) => {
                  setAnswer(val);
                  onSubmitAnswer(val);
                }}
              />
            </View>
          ) : activeMode === "chips" ? (
            <Stack gap="md" className="w-full max-w-md">
              <View className="relative">
                <Input
                  readOnly
                  value={answer}
                  placeholder="回答中..."
                  className="text-2xl py-8 shadow-inner bg-surface-base border-2 border-brand-primary text-center font-bold tracking-widest pointer-events-none"
                />
              </View>

              <CharacterPoolInput
                rubis={chipTarget?.rubi ? [chipTarget.rubi] : []}
                answers={
                  chipTarget ? [chipTarget.answer] : question.correctAnswers
                }
                currentInput={answer}
                decoyCount={dummyCharCount}
                distractors={question.distractors || []}
                onInput={(char) => setAnswer((prev) => prev + char)}
              />

              <Flex justify="center" gap="md" className="mt-4">
                <Button variant="ghost" size="sm" onClick={() => setAnswer("")}>
                  リセット
                </Button>
                <Button
                  variant="solid"
                  color="primary"
                  disabled={!answer.trim()}
                  onClick={() => handleSubmit()}
                >
                  回答する
                </Button>
              </Flex>
            </Stack>
          ) : (
            <View as="form" onSubmit={handleSubmit} className="w-full">
              <Flex gap="sm">
                <Input
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  placeholder="回答を入力..."
                  className="flex-1"
                  autoFocus
                />
                <Button
                  variant="solid"
                  color="primary"
                  type="submit"
                  disabled={!answer.trim()}
                  className="gap-1.5 shrink-0"
                >
                  <Send size={16} />
                  回答
                </Button>
              </Flex>
            </View>
          )}
        </View>
      </Stack>
    </Card>
  );
}
