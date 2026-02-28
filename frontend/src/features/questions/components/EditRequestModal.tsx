"use client";

import React, { useState } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { TextArea } from '@/src/design/baseComponents/TextArea';
import { X, Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/src/shared/contexts/ToastContext';
import { createEditRequest } from '../api';
import { Question } from '@/src/entities/question';

interface EditRequestModalProps {
    question: Question;
    onClose: () => void;
}

const EDIT_REASONS = [
    { id: 1, label: '誤字脱字' },
    { id: 2, label: '解答が不適切' },
    { id: 3, label: '重複している' },
    { id: 4, label: 'カテゴリ/分類が不適切' },
    { id: 5, label: 'その他' },
];

export function EditRequestModal({ question, onClose }: EditRequestModalProps) {
    const [questionText, setQuestionText] = useState(question.questionText);
    const [correctAnswers, setCorrectAnswers] = useState(question.correctAnswers.join('; '));
    const [descriptionText, setDescriptionText] = useState(question.descriptionText || '');
    const [reasonId, setReasonId] = useState<number>(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await createEditRequest({
                questionId: question.id,
                questionText,
                correctAnswers: correctAnswers.split(';').map(a => a.trim()).filter(a => a !== ''),
                descriptionText: descriptionText.trim() !== '' ? descriptionText : undefined,
                reasonId,
            });
            showToast({ message: '修正依頼を送信しました。オーナーの承認をお待ちください。', variant: 'success' });
            onClose();
        } catch (error) {
            showToast({ message: '修正依頼の送信に失敗しました。', variant: 'danger' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Stack
            gap="xl"
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <Card
                className="w-full max-w-lg overflow-hidden shadow-2xl border border-surface-muted flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <Flex align="center" justify="between" className="px-6 py-4 border-b border-surface-muted bg-surface-muted/50">
                    <Stack gap="xs">
                        <Text weight="bold" variant="h4">修正を提案する</Text>
                        <Text variant="xs" color="secondary">作成者に通知され、承認されると更新されます</Text>
                    </Stack>
                    <Button variant="ghost" size="sm" onClick={onClose} className="rounded-full h-8 w-8 p-0">
                        <X size={18} />
                    </Button>
                </Flex>

                {/* Body */}
                <Stack gap="lg" className="p-6 overflow-y-auto">
                    <Stack gap="xs">
                        <Text variant="detail" weight="medium">修正理由</Text>
                        <Flex gap="xs" wrap>
                            {EDIT_REASONS.map((reason) => (
                                <Button
                                    key={reason.id}
                                    variant={reasonId === reason.id ? 'solid' : 'ghost'}
                                    color={reasonId === reason.id ? 'primary' : 'secondary'}
                                    size="sm"
                                    onClick={() => setReasonId(reason.id)}
                                    className="text-xs h-8"
                                >
                                    {reason.label}
                                </Button>
                            ))}
                        </Flex>
                    </Stack>

                    <Stack gap="xs">
                        <Text variant="detail" weight="medium">問題文</Text>
                        <TextArea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="修正後の問題文..."
                            className="min-h-[100px] text-sm"
                        />
                    </Stack>

                    <Stack gap="xs">
                        <Text variant="detail" weight="medium">解答 (セミコロン区切り)</Text>
                        <Input
                            value={correctAnswers}
                            onChange={(e) => setCorrectAnswers(e.target.value)}
                            placeholder="Paris; パリ"
                            className="text-sm"
                        />
                    </Stack>

                    <Stack gap="xs">
                        <Text variant="detail" weight="medium">解説 (任意)</Text>
                        <TextArea
                            value={descriptionText}
                            onChange={(e) => setDescriptionText(e.target.value)}
                            placeholder="修正後の解説..."
                            className="min-h-[80px] text-sm"
                        />
                    </Stack>

                    <Flex gap="xs" align="center" className="p-3 bg-brand-info/10 border border-brand-info/20 rounded-lg">
                        <AlertCircle size={16} className="text-brand-info shrink-0" />
                        <Text variant="xs" color="info" className="italic">
                            不適切な内容やいたずらはアカウント停止の対象となる場合があります。
                        </Text>
                    </Flex>
                </Stack>

                {/* Footer */}
                <Flex justify="end" gap="md" className="px-6 py-4 border-t border-surface-muted bg-surface-muted/50">
                    <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
                        キャンセル
                    </Button>
                    <Button
                        variant="solid"
                        color="primary"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !questionText.trim() || !correctAnswers.trim()}
                        className="min-w-[120px]"
                    >
                        {isSubmitting ? '送信中...' : (
                            <Flex align="center" gap="xs">
                                <Check size={16} />
                                <span>送信する</span>
                            </Flex>
                        )}
                    </Button>
                </Flex>
            </Card>
        </Stack>
    );
}
