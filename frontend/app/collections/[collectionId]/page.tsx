"use client"
import { logger } from '@/src/shared/utils/logger';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/src/design/primitives/Container';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { Collection } from '@/src/entities/collection';
import { Question } from '@/src/entities/question';
import { getCollection } from '@/src/features/collections/api';
import { getCollectionQuestions } from '@/src/features/questions/api';
import { CollectionHeader } from '@/src/features/collections/components/CollectionHeader';
import { QuestionList } from '@/src/features/questions/components/QuestionList';
import { QuestionForm } from '@/src/features/questions/components/QuestionForm';
import { EditRequestReviewList } from '@/src/features/questions/components/EditRequestReviewList';
import { BackButton } from '@/src/shared/components/Navigation/BackButton';
import { useAuth } from '@/src/shared/auth/useAuth';
import { Plus } from 'lucide-react';
import { AiGenerationModal } from '@/src/features/collections/components/AiGenerationModal';
import { PdfGenerationModal } from '@/src/features/collections/components/PdfGenerationModal';
import { CsvImportModal } from '@/src/features/collections/components/CsvImportModal';
import { AiQuickBar } from '@/src/features/collections/components/AiQuickBar';
import { CollectionEditModal } from '@/src/features/collections/components/CollectionEditModal';
import { useToast } from '@/src/shared/contexts/ToastContext';
import { exportCsv } from '@/src/features/collections/api';
import { FileUp, Download } from 'lucide-react';
import { Flex } from '@/src/design/primitives/Flex';
import { View } from '@/src/design/primitives/View';
import { ArrowUp, ArrowDown, Gamepad2, WifiOff } from 'lucide-react';
import { ApiError } from '@/src/shared/api/error';
import { getOfflineCollection, getOfflineQuestions, syncCollectionToOffline } from '@/src/shared/api/offlineApi';
import { OfflinePlaceholder } from '@/src/shared/components/Navigation/OfflinePlaceholder';

export default function CollectionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { showToast } = useToast();
    const collectionId = params.collectionId as string;

    const [collection, setCollection] = useState<Collection | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [showCollectionModal, setShowCollectionModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);
    const [aiModalPrompt, setAiModalPrompt] = useState('');
    const [aiModalCount, setAiModalCount] = useState(5);
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            setIsOffline(false);
            try {
                const data = await getCollection(collectionId);
                setCollection(data);
                const qList = await getCollectionQuestions(collectionId);
                setQuestions(qList);
                setIsOwner(!!(user && user.id === data.userId));
                // 自動キャッシュを保存
                syncCollectionToOffline(data, qList, false).catch(err => logger.error('Auto-cache failed', err));
            } catch (err) {
                if (err instanceof ApiError && (err.status === 503 || err.status === 0)) {
                    setIsOffline(true);
                    // オフラインキャッシュから取得を試みる
                    const offlineData = await getOfflineCollection(collectionId);
                    if (offlineData) {
                        setCollection(offlineData);
                        const offlineQs = await getOfflineQuestions(collectionId);
                        setQuestions(offlineQs);
                        setIsOwner(!!(user && user.id === offlineData.userId));
                    }
                } else {
                    logger.error('Failed to fetch collection details', err);
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [collectionId, user]);

    const handleQuestionDeleted = (id: string) => {
        setQuestions(prev => prev.filter(q => q.id !== id));
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
        // Simple reload to get updated list and counts
        window.location.reload();
    };

    const handleExportCsv = async () => {
        try {
            const blob = await exportCsv(collectionId);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${collection?.name || 'collection'}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            showToast({ message: 'CSVをエクスポートしました', variant: 'success' });
        } catch (err) {
            logger.error(err);
            showToast({ message: 'エクスポートに失敗しました', variant: 'danger' });
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
            <Container className="pt-6 pb-12">
                <Stack gap="xl">
                    <CollectionHeader
                        collection={collection}
                        isOwner={isOwner}
                        questionCount={questions.length}
                        onEdit={() => setShowCollectionModal(true)}
                        onImportCsv={() => setIsCsvModalOpen(true)}
                        onExportCsv={handleExportCsv}
                        onStartRankingQuiz={() => router.push(`/collections/${collectionId}/ranking`)}
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
                        onOpenAdvanced={(prompt, count) => {
                            setAiModalPrompt(prompt);
                            setAiModalCount(count);
                            setIsAiModalOpen(true);
                        }}
                    />
                </Stack>
            </Container>

            {/* Floating Scroll Buttons */}
            <View className="fixed bottom-24 right-4 sm:right-8 z-40 flex flex-col gap-2">
                <Button
                    variant="solid"
                    color="primary"
                    className="p-3 h-auto rounded-full shadow-brand-lg active:scale-90 transition-transform"
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    title="一番上へ"
                >
                    <ArrowUp size={20} className="text-white" strokeWidth={3} />
                </Button>
                <Button
                    variant="solid"
                    color="primary"
                    className="p-3 h-auto rounded-full shadow-brand-lg active:scale-90 transition-transform"
                    onClick={() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })}
                    title="一番下へ"
                >
                    <ArrowDown size={20} className="text-white" strokeWidth={3} />
                </Button>
            </View>

            {/* Bottom Fixed Quiz Action */}
            <View className="fixed bottom-0 left-0 right-0 p-4 pb-6 bg-gradient-to-t from-surface-muted via-surface-muted/95 to-transparent z-[30]">
                <Container>
                    <Button
                        variant="solid"
                        color="primary"
                        rounded="full"
                        size="lg"
                        className="w-full py-4 shadow-brand-lg group active:scale-[0.98] transition-all"
                        onClick={() => router.push(`/quiz/start?collectionId=${collectionId}`)}
                    >
                        <Flex gap="sm" align="center">
                            <Gamepad2 size={24} className="group-hover:rotate-12 transition-transform" />
                            <Text variant="detail" weight="bold">このコレクションでクイズを開始</Text>
                        </Flex>
                    </Button>
                </Container>
            </View>

            {showCollectionModal && collection && (
                <CollectionEditModal
                    collection={collection}
                    onUpdated={(updated) => {
                        setCollection(updated);
                        setShowCollectionModal(false);
                        showToast({ message: 'コレクションを更新しました', variant: 'success' });
                    }}
                    onCancel={() => setShowCollectionModal(false)}
                />
            )}

            {showForm && (
                <QuestionForm
                    collectionId={collectionId}
                    question={editingQuestion}
                    onSaved={handleQuestionSaved}
                    onCancel={() => { setShowForm(false); setEditingQuestion(undefined); }}
                />
            )}

            <AiGenerationModal
                isOpen={isAiModalOpen}
                onClose={() => {
                    setIsAiModalOpen(false);
                    setAiModalPrompt('');
                }}
                collectionId={collectionId}
                onSuccess={handleQuestionSaved}
                initialPrompt={aiModalPrompt}
                initialCount={aiModalCount}
            />

            <PdfGenerationModal
                isOpen={isPdfModalOpen}
                onClose={() => setIsPdfModalOpen(false)}
                collectionId={collectionId}
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
