"use client";

import React from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Text } from '@/src/design/baseComponents/Text';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { useUserCollectionSets } from '@/src/features/collections/hooks/useCollections';
import { useAuth } from '@/src/shared/auth/useAuth';
import { addCollectionToSet } from '../api';
import { FolderOpen, X, Plus } from 'lucide-react';
import { Modal } from '@/src/design/baseComponents/Modal';

interface AddToSetModalProps {
    collectionId: string;
    onClose: () => void;
    onSuccess?: () => void;
}

export function AddToSetModal({ collectionId, onClose, onSuccess }: AddToSetModalProps) {
    const { user } = useAuth();
    const { collectionSets, loading } = useUserCollectionSets(user?.id);

    const handleAdd = async (setId: string) => {
        try {
            // displayOrderは現時点では簡易的に0を指定
            await addCollectionToSet(setId, { collectionId, displayOrder: 0 });
            onSuccess?.();
            onClose();
        } catch (err: any) {
            console.error('Failed to add collection to set', err);
            // 本来はToastなどを使いたいが、プロジェクトの慣習に合わせる
            alert('セットへの追加に失敗しました。既に含まれている可能性があります。');
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title="セットに追加"
            size="md"
            footer={
                <Button variant="outline" className="w-full" onClick={onClose}>
                    キャンセル
                </Button>
            }
        >
            <Stack gap="md">
                <Text variant="xs" color="secondary">このコレクションを追加するセットを選択してください</Text>

                <View className="max-h-[400px] overflow-y-auto pr-1">
                    {loading ? (
                        <Flex justify="center" className="py-10">
                            <Spinner />
                        </Flex>
                    ) : collectionSets.length === 0 ? (
                        <Stack gap="md" align="center" className="py-10 text-center">
                            <FolderOpen size={40} className="text-slate-200" />
                            <Text color="secondary">セットがまだありません</Text>
                            <Text variant="xs" color="secondary" className="max-w-[200px]">
                                プロフィールページから新しいコレクションセットを作成できます
                            </Text>
                        </Stack>
                    ) : (
                        <Stack gap="sm">
                            {collectionSets.map(set => (
                                <View
                                    key={set.id}
                                    onClick={() => handleAdd(set.id)}
                                    className="group p-4 rounded-lg border border-surface-muted hover:border-brand-primary hover:bg-brand-primary/[0.02] cursor-pointer transition-all flex items-center justify-between"
                                >
                                    <Flex gap="md" align="center">
                                        <View className="p-2 rounded bg-brand-primary/10 text-brand-primary group-hover:bg-brand-primary group-hover:text-white transition-colors">
                                            <FolderOpen size={18} />
                                        </View>
                                        <Stack gap="none">
                                            <Text weight="bold" variant="detail">{set.name}</Text>
                                            <Text variant="xs" color="secondary" className="opacity-70">
                                                作成: {new Date(set.createdAt).toLocaleDateString()}
                                            </Text>
                                        </Stack>
                                    </Flex>
                                    <Plus size={18} className="text-brand-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                                </View>
                            ))}
                        </Stack>
                    )}
                </View>
            </Stack>
        </Modal>
    );
}
