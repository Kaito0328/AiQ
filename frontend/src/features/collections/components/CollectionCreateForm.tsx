"use client";

import React, { useState } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { X, FolderPlus } from 'lucide-react';
import { createCollection } from '@/src/features/collections/api';
import { Collection } from '@/src/entities/collection';
import { Checkbox } from '@/src/design/baseComponents/Checkbox';
import { TextArea } from '@/src/design/baseComponents/TextArea';
import { Modal } from '@/src/design/baseComponents/Modal';

interface CollectionCreateFormProps {
    onCreated: (collection: Collection) => void;
    onCancel: () => void;
}

export function CollectionCreateForm({ onCreated, onCancel }: CollectionCreateFormProps) {
    const [name, setName] = useState('');
    const [descriptionText, setDescriptionText] = useState('');
    const [isOpen, setIsOpen] = useState(true);
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
            const created = await createCollection({
                name: name.trim(),
                descriptionText: descriptionText.trim() || undefined,
                isOpen
            });
            onCreated(created);
        } catch (err) {
            console.error('コレクション作成に失敗', err);
            setError('作成に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title="新しいコレクション"
            size="md"
            footer={
                <Flex gap="sm" justify="end">
                    <Button variant="outline" type="button" onClick={onCancel}>
                        キャンセル
                    </Button>
                    <Button variant="solid" color="primary" onClick={handleSubmit} disabled={loading}>
                        {loading ? '作成中...' : '作成'}
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
                            <Text variant="xs" weight="bold">説明（任意）</Text>
                            <TextArea
                                value={descriptionText}
                                onChange={(e) => setDescriptionText(e.target.value)}
                                placeholder="コレクションの内容について説明を入力してください"
                            />
                        </Stack>

                        <Flex gap="sm" align="center">
                            <Checkbox
                                checked={isOpen}
                                onChange={() => setIsOpen(!isOpen)}
                            />
                            <Text variant="xs">公開する</Text>
                        </Flex>
                    </Stack>

                    {error && (
                        <Text variant="xs" color="danger">{error}</Text>
                    )}
                </Stack>
            </form>
        </Modal>
    );
}
