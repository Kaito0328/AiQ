"use client";

import React, { useState } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { X, Edit3 } from 'lucide-react';
import { updateCollection } from '@/src/features/collections/api';
import { Collection } from '@/src/entities/collection';
import { Checkbox } from '@/src/design/baseComponents/Checkbox';
import { TextArea } from '@/src/design/baseComponents/TextArea';
import { View } from '@/src/design/primitives/View';
import { Modal } from '@/src/design/baseComponents/Modal';

interface CollectionEditModalProps {
    collection: Collection;
    onUpdated: (collection: Collection) => void;
    onCancel: () => void;
}

export function CollectionEditModal({ collection, onUpdated, onCancel }: CollectionEditModalProps) {
    const [name, setName] = useState(collection.name);
    const [descriptionText, setDescriptionText] = useState(collection.descriptionText || '');
    const [isOpen, setIsOpen] = useState(collection.isOpen);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            setError('コレクション名は必須です');
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const updated = await updateCollection(collection.id, {
                name: name.trim(),
                descriptionText: descriptionText.trim() || undefined,
                isOpen
            });
            onUpdated(updated);
        } catch (err) {
            console.error('コレクション更新に失敗', err);
            setError('更新に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title="コレクションの編集"
            size="md"
            footer={
                <Flex gap="sm" justify="end">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        キャンセル
                    </Button>
                    <Button variant="solid" color="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? '保存中...' : '変更を保存'}
                    </Button>
                </Flex>
            }
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                    <Stack gap="md">
                        <Stack gap="xs">
                            <Text variant="xs" weight="bold">コレクション名 *</Text>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="例: 英語の基本単語"
                                autoFocus
                            />
                        </Stack>

                        <Stack gap="xs">
                            <Text variant="xs" weight="bold">説明</Text>
                            <TextArea
                                value={descriptionText}
                                onChange={(e) => setDescriptionText(e.target.value)}
                                placeholder="コレクションの内容について説明を入力してください"
                            />
                        </Stack>

                        <label className="flex items-center gap-3 cursor-pointer group">
                            <Checkbox
                                checked={isOpen}
                                onChange={() => setIsOpen(!isOpen)}
                            />
                            <Stack gap="none">
                                <Text variant="xs" weight="bold">公開する</Text>
                                <Text variant="xs" color="secondary" className="opacity-70">このコレクションを他のユーザーからも見えるようにします</Text>
                            </Stack>
                        </label>
                    </Stack>

                    {error && (
                        <Text variant="xs" color="danger">{error}</Text>
                    )}
                </Stack>
            </form>
        </Modal>
    );
}
