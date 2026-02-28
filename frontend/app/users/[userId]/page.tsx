"use client";

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Container } from '@/src/design/primitives/Container';
import { Stack } from '@/src/design/primitives/Stack';
import { Button } from '@/src/design/baseComponents/Button';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { Text } from '@/src/design/baseComponents/Text';
import { UserHeader } from '@/src/features/users/components/UserHeader';
import { UserContentTabs } from '@/src/features/users/components/UserContentTabs';
import { useProfile } from '@/src/features/users/hooks/useProfile';
import { Plus } from 'lucide-react';

import { useAuth } from '@/src/shared/auth/useAuth';
import { BackButton } from '@/src/shared/components/Navigation/BackButton';

import { Collection, CollectionSet } from '@/src/entities/collection';
import { CollectionCreateForm } from '@/src/features/collections/components/CollectionCreateForm';
import { CollectionEditModal } from '@/src/features/collections/components/CollectionEditModal';
import { deleteCollection } from '@/src/features/collections/api';

import { startRankingQuiz } from '@/src/features/quiz/api';

import { CollectionSetForm } from '@/src/features/collectionSets/components/CollectionSetForm';
import { deleteSet } from '@/src/features/collectionSets/api';
import { AddToSetModal } from '@/src/features/collectionSets/components/AddToSetModal';
import { useUserCollections, useUserCollectionSets } from '@/src/features/collections/hooks/useCollections';

export default function UserPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const userId = params.userId as string;

    const { profile, loading: profileLoading, error: profileError } = useProfile(userId);
    const { collections } = useUserCollections(userId);
    const { collectionSets, refresh: refreshSets } = useUserCollectionSets(userId);

    const [showCreateForm, setShowCreateForm] = useState(false);
    const [showCreateSetForm, setShowCreateSetForm] = useState(false);
    const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
    const [editingSet, setEditingSet] = useState<CollectionSet | null>(null);

    const [targetCollectionId, setTargetCollectionId] = useState<string | null>(null);
    const [isAddToSetModalOpen, setIsAddToSetModalOpen] = useState(false);

    const isOwnProfile = !!(user && user.id === userId);

    const handleOpenAddToSet = (collectionId: string) => {
        setTargetCollectionId(collectionId);
        setIsAddToSetModalOpen(true);
    };

    const handleStartRanking = async (id: string) => {
        try {
            const resp = await startRankingQuiz(id);
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('quizData', JSON.stringify(resp));
            }
            router.push('/quiz');
        } catch (err) {
            console.error('Failed to start ranking quiz', err);
        }
    };

    const handleDeleteCollection = async (id: string) => {
        if (!confirm('本当にこのコレクションを削除しますか？内の問題もすべて削除されます。')) return;
        try {
            await deleteCollection(id);
            window.location.reload();
        } catch (err) {
            console.error('Failed to delete collection', err);
        }
    };

    const handleEditCollection = (id: string) => {
        const target = collections.find(c => c.id === id);
        if (target) {
            setEditingCollection(target);
        }
    };

    const handleDeleteSet = async (id: string) => {
        try {
            await deleteSet(id);
            refreshSets();
        } catch (err) {
            console.error('Failed to delete set', err);
        }
    };

    const handleEditSet = (id: string) => {
        const target = collectionSets.find(s => s.id === id);
        if (target) {
            setEditingSet(target);
        }
    };

    if (profileLoading) {
        return (
            <div className="flex justify-center py-20">
                <Spinner size="lg" />
            </div>
        );
    }

    if (profileError || !profile) {
        return (
            <Container className="py-20 text-center">
                <Text color="danger">エラー: {profileError || 'ユーザーが見つかりません'}</Text>
            </Container>
        );
    }

    return (
        <div className="min-h-screen bg-surface-muted transition-all duration-300">
            <BackButton />
            <Container className="pt-20 pb-12">
                <Stack gap="xl">
                    <UserHeader profile={profile} />

                    <UserContentTabs
                        userId={userId}
                        isSelectionMode={false}
                        selectedIds={[]}
                        onToggleCollection={() => { }}
                        onDeleteCollection={isOwnProfile ? handleDeleteCollection : undefined}
                        onEditCollection={isOwnProfile ? handleEditCollection : undefined}
                        onStartRanking={handleStartRanking}
                        onAddToSet={handleOpenAddToSet} // Available for all collections
                        onDeleteSet={isOwnProfile ? handleDeleteSet : undefined}
                        onEditSet={isOwnProfile ? handleEditSet : undefined}
                        collectionActions={isOwnProfile && (
                            <Button
                                size="md"
                                variant="outline"
                                className="gap-1.5"
                                onClick={() => setShowCreateForm(true)}
                            >
                                <Plus size={18} />
                                新規作成
                            </Button>
                        )}
                        setActions={isOwnProfile && (
                            <Button
                                size="md"
                                variant="outline"
                                className="gap-1.5"
                                onClick={() => setShowCreateSetForm(true)}
                            >
                                <Plus size={18} />
                                新規作成
                            </Button>
                        )}
                        hideExtras={false} // Show extras on user profile
                    />
                </Stack>
            </Container>

            {showCreateForm && (
                <CollectionCreateForm
                    onCreated={(c) => {
                        setShowCreateForm(false);
                        router.push(`/collections/${c.id}`);
                    }}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}

            {editingCollection && (
                <CollectionEditModal
                    collection={editingCollection}
                    onUpdated={() => {
                        setEditingCollection(null);
                        window.location.reload();
                    }}
                    onCancel={() => setEditingCollection(null)}
                />
            )}

            {showCreateSetForm && (
                <CollectionSetForm
                    onSuccess={() => {
                        setShowCreateSetForm(false);
                        refreshSets();
                    }}
                    onCancel={() => setShowCreateSetForm(false)}
                />
            )}

            {editingSet && (
                <CollectionSetForm
                    initialData={editingSet}
                    onSuccess={() => {
                        setEditingSet(null);
                        refreshSets();
                    }}
                    onCancel={() => setEditingSet(null)}
                />
            )}

            {isAddToSetModalOpen && targetCollectionId && (
                <AddToSetModal
                    collectionId={targetCollectionId}
                    onClose={() => setIsAddToSetModalOpen(false)}
                    onSuccess={() => {
                        setTargetCollectionId(null);
                        setIsAddToSetModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}
