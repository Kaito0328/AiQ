"use client";

import React, { useState } from "react";
import { Card } from "@/src/design/baseComponents/Card";
import { Stack } from "@/src/design/primitives/Stack";
import { Flex } from "@/src/design/primitives/Flex";
import { Text } from "@/src/design/baseComponents/Text";
import { Button } from "@/src/design/baseComponents/Button";
import { View } from "@/src/design/primitives/View";
import {
  CheckCircle,
  XCircle,
  ArrowRight,
  MessageSquare,
  Edit3,
} from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import { Question } from "@/src/entities/question";
import { EditRequestModal } from "@/src/features/questions/components/EditRequestModal";

interface ResultProps {
  isCorrect: boolean;
  correctAnswer: string;
  description?: string;
  onNext: () => void;
  isLastQuestion?: boolean;
  question?: Question;
  userAnswer?: string;
  isOwner?: boolean;
  onEdit?: () => void;
  fuzzyScore?: number; // 0-1 similarity from AI scorer (fuzzy mode only)
}

export function Result({
  isCorrect,
  correctAnswer,
  description,
  onNext,
  isLastQuestion = false,
  question,
  userAnswer,
  isOwner,
  onEdit,
  fuzzyScore,
}: ResultProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleEditClick = () => {
    if (isOwner && onEdit) {
      onEdit();
    } else {
      setIsEditModalOpen(true);
    }
  };

  return (
    <Stack gap="lg" className="w-full max-w-2xl mx-auto">
      <Card
        className={cn(
          "border-2 transition-colors shadow-lg overflow-hidden",
          isCorrect
            ? "border-brand-success bg-brand-success/5"
            : "border-brand-danger bg-brand-danger/5",
        )}
      >
        <Stack gap="lg" className="p-4 sm:p-6">
          {/* Icon + Result at the top */}
          <Flex
            gap="sm"
            align="center"
            justify="center"
            className="animate-in zoom-in fade-in duration-500 py-2"
          >
            {isCorrect ? (
              <CheckCircle
                size={32}
                className="text-brand-success animate-in bounce-in duration-700"
              />
            ) : (
              <XCircle
                size={32}
                className="text-brand-danger animate-in shake-in duration-500"
              />
            )}
            <Text
              variant="h3"
              weight="bold"
              className={cn(
                "text-2xl",
                isCorrect ? "text-brand-success" : "text-brand-danger",
              )}
            >
              {isCorrect ? "正解！" : "不正解"}
            </Text>
          </Flex>

          {/* Question Text */}
          {question && (
            <View className="border-t border-surface-muted/50 pt-4">
              <Text
                variant="body"
                weight="bold"
                className="text-center w-full leading-relaxed"
              >
                Q. {question.questionText}
              </Text>
            </View>
          )}

          {/* Answers Comparison */}
          <Stack
            gap="sm"
            className="w-full bg-surface-base p-4 rounded-xl border border-surface-muted"
          >
            <View>
              <Text variant="xs" color="secondary" weight="bold">
                あなたの回答
              </Text>
              <Text
                variant="body"
                weight="bold"
                className={cn(
                  "mt-1",
                  isCorrect ? "text-brand-success" : "text-brand-danger",
                )}
              >
                {userAnswer || "(未回答)"}
              </Text>
            </View>
            <View className="pt-3 border-t border-surface-muted/50">
              <Text variant="xs" color="secondary" weight="bold">
                {isCorrect ? "正解の候補" : "正解"}
              </Text>
              <Text
                variant="body"
                weight="bold"
                color="primary"
                className="mt-1"
              >
                {correctAnswer}
              </Text>
            </View>
          </Stack>

          {/* Fuzzy similarity meter (fuzzy mode only) */}
          {fuzzyScore !== undefined &&
            (() => {
              const pct = Math.round(fuzzyScore * 100);
              const color =
                pct >= 80 ? "#22c55e" : pct >= 60 ? "#f59e0b" : "#ef4444";
              return (
                <Flex
                  direction="column"
                  align="center"
                  gap="xs"
                  className="pt-2"
                >
                  <Text variant="xs" color="secondary" weight="bold">
                    AI類似度: <span style={{ color }}>{pct}%</span>
                  </Text>
                  <View className="h-1.5 w-full max-w-[200px] bg-surface-muted rounded-full overflow-hidden">
                    <View
                      className="h-full transition-all duration-700"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </View>
                </Flex>
              );
            })()}

          {/* Description */}
          {description && (
            <View className="border-t border-surface-muted/50 pt-4 w-full">
              <Text
                variant="xs"
                color="secondary"
                weight="bold"
                className="mb-2 flex items-center gap-1"
              >
                <MessageSquare size={14} />
                解説
              </Text>
              <Text
                variant="detail"
                color="secondary"
                className="leading-relaxed opacity-90"
              >
                {description}
              </Text>
            </View>
          )}

          {/* Next Button inside Card */}
          <View className="pt-4 mt-2">
            <Button
              variant="solid"
              color="primary"
              size="lg"
              className="w-full py-4 gap-2 shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              onClick={onNext}
            >
              <span className="font-bold text-lg">
                {isLastQuestion ? "終了" : "次へ"}
              </span>
              <ArrowRight size={20} />
            </Button>
          </View>

          {/* Edit/Report button only at bottom */}
          {question && (
            <Flex justify="center" className="pt-2">
              <Button
                variant="ghost"
                color="secondary"
                size="sm"
                onClick={handleEditClick}
                className="gap-2 text-xs opacity-60 hover:opacity-100"
              >
                <Edit3 size={14} />
                {isOwner ? "修正" : "修正提案"}
              </Button>
            </Flex>
          )}
        </Stack>
      </Card>

      {isEditModalOpen && question && (
        <EditRequestModal
          question={question}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </Stack>
  );
}
