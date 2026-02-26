import React, { useState } from 'react';
import { View } from '@/src/design/primitives/View';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { createSet, updateSet, CreateCollectionSetRequest, UpdateCollectionSetRequest } from '../api';
import { CollectionSet } from '@/src/entities/collection';
import { Card } from '@/src/design/baseComponents/Card';
import { Modal } from '@/src/design/baseComponents/Modal';

interface CollectionSetFormProps {
    initialData?: CollectionSet;
    onSuccess: (set: CollectionSet) => void;
    onCancel: () => void;
}

export function CollectionSetForm({ initialData, onSuccess, onCancel }: CollectionSetFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.descriptionText || '');
    const [isOpen, setIsOpen] = useState(initialData?.isOpen ?? false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isEdit = !!initialData;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let result: CollectionSet;
            if (isEdit) {
                const req: UpdateCollectionSetRequest = { name, descriptionText: description, isOpen };
                result = await updateSet(initialData.id, req);
            } else {
                const req: CreateCollectionSetRequest = { name, descriptionText: description, isOpen };
                result = await createSet(req);
            }
            onSuccess(result);
        } catch (err) {
            setError('送信に失敗しました。');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title={isEdit ? 'セットを編集' : '新しいセットを作成'}
            size="md"
            footer={
                <View className="flex gap-3 pt-2">
                    <Button
                        type="button"
                        variant="ghost"
                        fullWidth
                        onClick={onCancel}
                        disabled={loading}
                    >
                        キャンセル
                    </Button>
                    <Button
                        type="submit"
                        variant="solid"
                        fullWidth
                        loading={loading}
                        onClick={handleSubmit}
                    >
                        {isEdit ? '更新' : '作成'}
                    </Button>
                </View>
            }
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="lg">
                    {error && (
                        <View bg="danger" padding="sm" rounded="md">
                            <Text color="secondary" variant="xs">{error}</Text>
                        </View>
                    )}

                    <Stack gap="xs">
                        <label className="text-xs font-bold text-slate-500 ml-1">名前</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-3 rounded-brand-md border border-surface-muted bg-surface-base focus:border-brand-primary outline-none transition-all"
                            placeholder="セット名を入力..."
                            required
                        />
                    </Stack>

                    <Stack gap="xs">
                        <label className="text-xs font-bold text-slate-500 ml-1">説明</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full p-3 rounded-brand-md border border-surface-muted bg-surface-base focus:border-brand-primary outline-none transition-all min-h-[100px] resize-none"
                            placeholder="セットの説明を入力..."
                        />
                    </Stack>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            checked={isOpen}
                            onChange={(e) => setIsOpen(e.target.checked)}
                            className="w-5 h-5 rounded border-surface-muted text-brand-primary focus:ring-brand-primary cursor-pointer"
                        />
                        <Stack gap="none">
                            <Text variant="xs" weight="bold">公開する</Text>
                            <Text variant="xs" color="secondary" className="opacity-70">セットを他のユーザーからも見えるようにします</Text>
                        </Stack>
                    </label>
                </Stack>
            </form>
        </Modal>
    );
}
