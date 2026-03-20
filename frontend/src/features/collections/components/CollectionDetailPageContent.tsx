"use client";
import { logger } from "@/src/shared/utils/logger";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Container } from "@/src/design/primitives/Container";
import { Stack } from "@/src/design/primitives/Stack";
import { Text } from "@/src/design/baseComponents/Text";
import { Button } from "@/src/design/baseComponents/Button";
import { Spinner } from "@/src/design/baseComponents/Spinner";
import { Collection } from "@/src/entities/collection";
import { Question } from "@/src/entities/question";
import { getCollection } from "@/src/features/collections/api";
import { getCollectionQuestions } from "@/src/features/questions/api";
import { CollectionHeader } from "@/src/features/collections/components/CollectionHeader";
import { QuestionList } from "@/src/features/questions/components/QuestionList";
import { QuestionForm } from "@/src/features/questions/components/QuestionForm";
import { EditRequestReviewList } from "@/src/features/questions/components/EditRequestReviewList";
import { useAuth } from "@/src/shared/auth/useAuth";
import { AiGenerationModal } from "@/src/features/collections/components/AiGenerationModal";
import { PdfGenerationModal } from "@/src/features/collections/components/PdfGenerationModal";
import { CsvImportModal } from "@/src/features/collections/components/CsvImportModal";
import { CollectionEditModal } from "@/src/features/collections/components/CollectionEditModal";
import { useToast } from "@/src/shared/contexts/ToastContext";
import { exportCsv } from "@/src/features/collections/api";
import { Flex } from "@/src/design/primitives/Flex";
import { View } from "@/src/design/primitives/View";
import { ArrowUp, Gamepad2 } from "lucide-react";
import { isOfflineError as isOfflineErr } from "@/src/shared/api/isOfflineError";
import {
  getOfflineCollection,
  getOfflineQuestions,
  syncCollectionToOffline,
} from "@/src/shared/api/offlineApi";
import { OfflinePlaceholder } from "@/src/shared/components/Navigation/OfflinePlaceholder";

interface CollectionDetailPageContentProps {
  collectionId: string;
}

export function CollectionDetailPageContent({
  collectionId,
}: CollectionDetailPageContentProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { showToast } = useToast();

  const [collection, setCollection] = useState<Collection | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(
    undefined,
  );
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiModalPrompt, setAiModalPrompt] = useState("");
  const [aiModalCount, setAiModalCount] = useState(5);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [isOffline, setIsOffline] = useState(false);
  const [showScrollTopButton, setShowScrollTopButton] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setIsOffline(false);

    try {
      const data = await getCollection(collectionId);
      setCollection(data);
      const qList = await getCollectionQuestions(collectionId);
      setQuestions(qList);
      setIsOwner(!!(user && user.id === data.userId));
      syncCollectionToOffline(data, qList, false).catch((err) =>
        logger.error("Auto-cache failed", err),
      );
    } catch (err) {
      if (isOfflineErr(err)) {
        setIsOffline(true);
        const offlineData = await getOfflineCollection(collectionId);
        if (offlineData) {
          setCollection(offlineData);
          const offlineQs = await getOfflineQuestions(collectionId);
          setQuestions(offlineQs);
          setIsOwner(!!(user && user.id === offlineData.userId));
        }
      } else {
        logger.error("Failed to fetch collection details", err);
      }
    } finally {
      setLoading(false);
    }
  }, [collectionId, user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    let scrollIdleTimer: ReturnType<typeof setTimeout> | null = null;

    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setShowScrollTopButton(y > 320);
      setIsUserScrolling(true);

      if (scrollIdleTimer) {
        clearTimeout(scrollIdleTimer);
      }
      scrollIdleTimer = setTimeout(() => setIsUserScrolling(false), 180);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      if (scrollIdleTimer) {
        clearTimeout(scrollIdleTimer);
      }
    };
  }, []);

  const handleQuestionDeleted = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleAddQuestion = () => {
    setEditingQuestion(undefined);
    setShowForm(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setShowForm(true);
  };

  const handleQuestionSaved = () => {
    fetchData().catch((err) =>
      logger.error("Failed to refresh collection after save", err),
    );
  };

  const handleExportCsv = async () => {
    try {
      const blob = await exportCsv(collectionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${collection?.name || "collection"}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      showToast({ message: "CSVをエクスポートしました", variant: "success" });
    } catch (err) {
      logger.error(err);
      showToast({ message: "エクスポートに失敗しました", variant: "danger" });
    }
  };

  if (loading) {
    return (
      <View className="flex justify-center py-20 min-h-screen bg-surface-muted">
        <Spinner size="lg" />
      </View>
    );
  }

  if (!collection) {
    return (
      <View className="min-h-screen bg-surface-muted pt-6">
        <Container className="max-w-4xl">
          {isOffline ? (
            <OfflinePlaceholder
              title="コレクションはオフラインです"
              message="このコレクションはまだオフライン保存されていません。一度オンラインで詳細を開いて保存してください。"
            />
          ) : (
            <View className="py-20 text-center">
              <Text color="danger">コレクションが見つかりません</Text>
            </View>
          )}
        </Container>
      </View>
    );
  }

  return (
    <View className="min-h-screen bg-surface-muted">
      <Container className="pt-6 pb-40">
        <Stack gap="xl" className="gap-5 sm:gap-10">
          <CollectionHeader
            collection={collection}
            isOwner={isOwner}
            questionCount={questions.length}
            onEdit={() => setShowCollectionModal(true)}
            onImportCsv={() => setIsCsvModalOpen(true)}
            onExportCsv={handleExportCsv}
            onStartRankingQuiz={() =>
              router.push(`/collections/${collectionId}/ranking`)
            }
          />

          {isOwner && (
            <EditRequestReviewList
              collectionId={collectionId}
              onActionSuccess={handleQuestionSaved}
            />
          )}

          <QuestionList
            questions={questions}
            isOwner={isOwner}
            isEditMode={isEditMode}
            onToggleEditMode={() => setIsEditMode(!isEditMode)}
            onQuestionDeleted={handleQuestionDeleted}
            onEditQuestion={handleEditQuestion}
            onAddQuestion={handleAddQuestion}
            onImportCsv={() => setIsCsvModalOpen(true)}
            onSuccess={handleQuestionSaved}
            collectionId={collectionId}
            collectionDifficulty={collection.difficultyLevel ?? 3}
            onOpenAdvanced={(prompt, count) => {
              setAiModalPrompt(prompt);
              setAiModalCount(count);
              setIsAiModalOpen(true);
            }}
          />
        </Stack>
      </Container>

      {showScrollTopButton && (
        <View className="fixed bottom-28 right-4 sm:right-8 z-40">
          <Button
            variant="solid"
            color="primary"
            className={
              isUserScrolling
                ? "p-2.5 h-auto rounded-full shadow-brand-lg active:scale-90 transition-all opacity-95"
                : "p-2.5 h-auto rounded-full shadow-brand-lg active:scale-90 transition-all opacity-70"
            }
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            title="一番上へ"
          >
            <ArrowUp size={18} className="text-white" strokeWidth={3} />
          </Button>
        </View>
      )}

      <View className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-surface-muted via-surface-muted/95 to-transparent z-[30]">
        <Container>
          <Flex justify="center">
            <Button
              variant="solid"
              color="primary"
              rounded="full"
              size="md"
              className="min-w-[170px] px-6 py-2.5 shadow-brand-lg group active:scale-[0.98] transition-all"
              onClick={() =>
                router.push(`/quiz/start?collectionId=${collectionId}`)
              }
            >
              <Flex gap="sm" align="center">
                <Gamepad2
                  size={18}
                  className="group-hover:rotate-12 transition-transform"
                />
                <Text variant="detail" weight="bold">
                  クイズ開始
                </Text>
              </Flex>
            </Button>
          </Flex>
        </Container>
      </View>

      {showCollectionModal && collection && (
        <CollectionEditModal
          collection={collection}
          onUpdated={(updated) => {
            setCollection(updated);
            setShowCollectionModal(false);
          }}
          onCancel={() => setShowCollectionModal(false)}
        />
      )}

      {showForm && (
        <QuestionForm
          collectionId={collectionId}
          question={editingQuestion}
          onSaved={handleQuestionSaved}
          onCancel={() => {
            setShowForm(false);
            setEditingQuestion(undefined);
          }}
        />
      )}

      <AiGenerationModal
        isOpen={isAiModalOpen}
        onClose={() => {
          setIsAiModalOpen(false);
          setAiModalPrompt("");
        }}
        collectionId={collectionId}
        collectionDifficulty={collection.difficultyLevel ?? 3}
        onSuccess={handleQuestionSaved}
        initialPrompt={aiModalPrompt}
        initialCount={aiModalCount}
      />

      <PdfGenerationModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        collectionId={collectionId}
        collectionDifficulty={collection.difficultyLevel ?? 3}
        onSuccess={handleQuestionSaved}
      />

      <CsvImportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        collectionId={collectionId}
        onSuccess={handleQuestionSaved}
      />
    </View>
  );
}
