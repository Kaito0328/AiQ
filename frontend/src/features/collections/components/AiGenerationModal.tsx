"use client";

import React, { useState } from 'react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { TextArea } from '@/src/design/baseComponents/TextArea';
import { Input } from '@/src/design/baseComponents/Input';
import { Flex } from '@/src/design/primitives/Flex';
import { View } from '@/src/design/primitives/View';
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useAiGeneration } from '../hooks/useAiGeneration';
import { useToast } from '@/src/shared/contexts/ToastContext';

interface AiGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: string;
    onSuccess: () => void;
}

export function AiGenerationModal({ isOpen, onClose, collectionId, onSuccess }: AiGenerationModalProps) {
    const [prompt, setPrompt] = useState('');
    const [count, setCount] = useState(5);
    const { showToast } = useToast();
    const { generate, reset, status, message, generatedQuestions } = useAiGeneration(collectionId);

    const handleGenerate = () => {
        if (!prompt.trim()) {
            showToast({ message: 'トピックまたは指示を入力してください', variant: 'warning' });
            return;
        }
        generate({ prompt, count });
    };

    const handleClose = () => {
        reset();
        onClose();
        if (status === 'completed') {
            onSuccess();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="AIで問題作成"
            size="md"
        >
            <Stack gap="xl">
                {status === 'idle' ? (
                    <>
                        <Stack gap="sm">
                            <Text weight="bold" variant="xs">トピック・指示</Text>
                            <TextArea
                                placeholder="例: 日本の地理についての中学生レベルの問題を作って / 以下の文章から問題を5問作成して：..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={5}
                            />
                            <Text variant="xs" color="secondary">
                                具体的なトピックや難易度、対象者を指定するとより良い問題が生成されます。
                            </Text>
                        </Stack>

                        <Stack gap="sm">
                            <Text weight="bold" variant="xs">問題数 (1〜10)</Text>
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                value={count}
                                onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                            />
                        </Stack>

                        <Flex justify="end" gap="sm">
                            <Button variant="ghost" onClick={onClose}>
                                キャンセル
                            </Button>
                            <Button variant="solid" onClick={handleGenerate} className="gap-2">
                                <Sparkles size={18} />
                                生成を開始
                            </Button>
                        </Flex>
                    </>
                ) : (
                    <View className="py-8">
                        <Stack gap="lg" align="center">
                            {status === 'processing' || status === 'saving' ? (
                                <>
                                    <Loader2 size={48} className="text-brand-primary animate-spin" />
                                    <Stack gap="xs" align="center">
                                        <Text weight="bold" variant="body">{message}</Text>
                                        <Text variant="xs" color="secondary">これには数十秒かかる場合があります...</Text>
                                    </Stack>
                                </>
                            ) : status === 'completed' ? (
                                <>
                                    <CheckCircle size={48} className="text-green-500" />
                                    <Stack gap="xs" align="center">
                                        <Text weight="bold" variant="body">生成が完了しました！</Text>
                                        <Text variant="xs" color="secondary">{generatedQuestions.length}問の問題を追加しました。</Text>
                                    </Stack>
                                    <Button variant="solid" onClick={handleClose} className="w-full mt-4">
                                        閉じる
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={48} className="text-red-500" />
                                    <Stack gap="xs" align="center">
                                        <Text weight="bold" variant="body">エラーが発生しました</Text>
                                        <Text variant="xs" color="secondary">{message}</Text>
                                    </Stack>
                                    <Button variant="outline" onClick={reset} className="w-full mt-4">
                                        やり直す
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </View>
                )}
            </Stack>
        </Modal>
    );
}
