"use client";

import React, { useState } from 'react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Grid } from '@/src/design/primitives/Grid';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { TextArea } from '@/src/design/baseComponents/TextArea';
import { FormField } from '@/src/design/baseComponents/FormField';
import { View } from '@/src/design/primitives/View';
import { Check, AlertCircle } from 'lucide-react';
import { useToast } from '@/src/shared/contexts/ToastContext';
import { createEditRequest, updateQuestion } from '../api';
import { Question } from '@/src/entities/question';
import { cn } from '@/src/shared/utils/cn';

interface EditRequestModalProps {
    question: Question;
    onClose: () => void;
    onDirectUpdate?: (updates: Partial<Question>) => void;
    isOwner?: boolean;
}

const EDIT_REASONS = [
    { id: 1, label: '誤字・脱字' },
    { id: 2, label: '解答の誤り・不備' },
    { id: 3, label: '読み・ルビの修正' },
    { id: 4, label: '選択肢の改善' },
    { id: 5, label: '解説の追加・修正' },
    { id: 6, label: '重複・不適切な内容' },
    { id: 7, label: 'その他' },
];

export function EditRequestModal({ question, onClose, onDirectUpdate, isOwner = false }: EditRequestModalProps) {
    const [questionText, setQuestionText] = useState(question.questionText);
    const [correctAnswers, setCorrectAnswers] = useState(question.correctAnswers.join('; '));
    const [answerRubis, setAnswerRubis] = useState(question.answerRubis?.join('; ') || '');
    const [distractors, setDistractors] = useState(question.distractors?.join('; ') || '');
    const [descriptionText, setDescriptionText] = useState(question.descriptionText || '');
    const [reasonId, setReasonId] = useState<number>(1);
    const [reasonDetails, setReasonDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const updates = {
                questionText,
                correctAnswers: correctAnswers.split(';').map(a => a.trim()).filter(a => a !== ''),
                answerRubis: answerRubis.split(';').map(a => a.trim()).filter(a => a !== ''),
                distractors: distractors.split(';').map(a => a.trim()).filter(a => a !== ''),
                descriptionText: descriptionText.trim() !== '' ? descriptionText : undefined,
            };

            if (isOwner) {
                // Direct update for owners
                await updateQuestion(question.id, updates);
                showToast({ message: '問題を保存・更新しました', variant: 'success' });
            } else {
                // Suggestion for non-owners
                await createEditRequest({
                    questionId: question.id,
                    ...updates,
                    reasonId,
                });
                showToast({ message: '修正依頼を送信しました。オーナーの承認をお待ちください。', variant: 'success' });
            }

            // Reflect changes locally immediately
            onDirectUpdate?.(updates);

            onClose();
        } catch (error) {
            showToast({ message: isOwner ? '保存に失敗しました。' : '修正依頼の送信に失敗しました。', variant: 'danger' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onClose}
            title={isOwner ? "問題を編集する" : "修正を提案する"}
            size="lg"
            footer={
                <Flex justify="end" gap="md" className="w-full">
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
                        {isSubmitting ? '処理中...' : (
                            <Flex align="center" gap="xs">
                                <Check size={16} />
                                <span>{isOwner ? '保存して更新' : '提案を送信'}</span>
                            </Flex>
                        )}
                    </Button>
                </Flex>
            }
        >
            <Stack gap="lg" className="overflow-y-auto max-h-[70vh] px-1">
                {!isOwner && <Text variant="xs" color="secondary">作成者に通知され、承認されると更新されます</Text>}

                {!isOwner && (
                    <Stack gap="xs">
                        <Text variant="detail" weight="bold" color="primary">1. 修正理由を選択してください</Text>
                        <Flex gap="xs" wrap className="mt-1">
                            {EDIT_REASONS.map((reason) => (
                                <Button
                                    key={reason.id}
                                    variant={reasonId === reason.id ? 'solid' : 'outline'}
                                    color={reasonId === reason.id ? 'primary' : undefined}
                                    size="sm"
                                    onClick={() => setReasonId(reason.id)}
                                    className="text-xs h-8 px-3"
                                >
                                    {reason.label}
                                </Button>
                            ))}
                        </Flex>
                    </Stack>
                )}

                <Stack gap="md" className={cn("pt-4", !isOwner && "border-t border-surface-muted/50")}>
                    <Text variant="detail" weight="bold" color="primary">
                        {isOwner ? '修正内容を入力してください' : '2. 修正内容を入力してください'}
                    </Text>

                    <FormField label="問題文">
                        <TextArea
                            value={questionText}
                            onChange={(e) => setQuestionText(e.target.value)}
                            placeholder="修正後の問題文..."
                            className="min-h-[80px]"
                        />
                    </FormField>

                    <Grid cols={{ sm: 1, md: 2 }} gap="md">
                        <FormField label="正解 (セミコロン区切り)">
                            <Input
                                value={correctAnswers}
                                onChange={(e) => setCorrectAnswers(e.target.value)}
                                placeholder="Paris; パリ"
                            />
                        </FormField>
                        <FormField label="読み/ルビ (任意)">
                            <Input
                                value={answerRubis}
                                onChange={(e) => setAnswerRubis(e.target.value)}
                                placeholder="ぱり; PARI"
                            />
                        </FormField>
                    </Grid>

                    <FormField label="誤答/選択肢 (任意、セミコロン区切り)">
                        <Input
                            value={distractors}
                            onChange={(e) => setDistractors(e.target.value)}
                            placeholder="London; Berlin; Rome"
                        />
                    </FormField>

                    <FormField label="解説 (任意)">
                        <TextArea
                            value={descriptionText}
                            onChange={(e) => setDescriptionText(e.target.value)}
                            placeholder="修正後の解説..."
                            className="min-h-[60px]"
                        />
                    </FormField>
                </Stack>

                {!isOwner && (
                    <View padding="md" rounded="lg" className="bg-brand-info/10 border border-brand-info/20">
                        <Flex gap="xs" align="center">
                            <AlertCircle size={16} className="text-brand-info shrink-0" />
                            <Text variant="xs" color="info" className="italic">
                                承認されると、あなたの提案がそのまま問題に反映されます。
                            </Text>
                        </Flex>
                    </View>
                )}
            </Stack>
        </Modal>
    );
}
