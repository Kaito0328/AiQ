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
import { BackButton } from '@/src/shared/components/Navigation/BackButton';
import { useAuth } from '@/src/shared/auth/useAuth';
import { Plus } from 'lucide-react';
import { Flex } from '@/src/design/primitives/Flex';

export default function CollectionDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const collectionId = params.collectionId as string;

    const [collection, setCollection] = useState<Collection | null>(null);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [isOwner, setIsOwner] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | undefined>(undefined);

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

    const handleQuestionSaved = (question: Question) => {
        // Simple reload to get updated list and counts
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="flex justify-center py-20 min-h-screen bg-surface-muted">
                <Spinner size="lg" />
            </div>
        );
    }

    if (!collection) {
        return (
            <div className="min-h-screen bg-surface-muted pt-20">
                <BackButton />
                <Container className="py-20 text-center">
                    <Text color="danger">コレクションが見つかりません</Text>
                </Container>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-surface-muted">
            <BackButton />
            <Container className="pt-20 pb-12">
                <Stack gap="xl">
                    <CollectionHeader
                        collection={collection}
                        isOwner={isOwner}
                        questionCount={questions.length}
                    />

                    <QuestionList
                        questions={questions}
                        isOwner={isOwner}
                        onQuestionDeleted={handleQuestionDeleted}
                        onEditQuestion={handleEditQuestion}
                        onAddQuestion={handleAddQuestion}
                    />
                </Stack>
            </Container>

            {showForm && (
                <QuestionForm
                    collectionId={collectionId}
                    question={editingQuestion}
                    onSaved={handleQuestionSaved}
                    onCancel={() => { setShowForm(false); setEditingQuestion(undefined); }}
                />
            )}
        </div>
    );
}
