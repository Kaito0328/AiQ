"use client";

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
    const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
    const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getCollection(collectionId);
                setCollection(data);
                const qList = await getCollectionQuestions(collectionId);
                setQuestions(qList);
                setIsOwner(!!(user && user.id === data.userId));
            } catch (err) {
                console.error('Failed to fetch collection details', err);
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
            console.error(err);
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
            <View className="min-h-screen bg-surface-muted pt-20">
                <BackButton />
                <Container className="py-20 text-center">
                    <Text color="danger">コレクションが見つかりません</Text>
                </Container>
            </View>
        );
    }

    return (
        <View className="min-h-screen bg-surface-muted">
            <BackButton />
            <Container className="pt-20 pb-12">
                <Stack gap="xl">
                    <CollectionHeader
                        collection={collection}
                        isOwner={isOwner}
                        questionCount={questions.length}
                        onEdit={() => setShowCollectionModal(true)}
                        onImportCsv={() => setIsCsvModalOpen(true)}
                        onExportCsv={handleExportCsv}
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
                    />
                </Stack>
            </Container>

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
                onClose={() => setIsAiModalOpen(false)}
                collectionId={collectionId}
                onSuccess={handleQuestionSaved}
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
