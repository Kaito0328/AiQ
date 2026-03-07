"use client";

import React, { useState, useEffect } from 'react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { View } from '@/src/design/primitives/View';
import { Select } from '@/src/design/baseComponents/Select';
import { FormField } from '@/src/design/baseComponents/FormField';
import { Badge } from '@/src/design/baseComponents/Badge';
import { Question, QuestionInput } from '@/src/entities/question';
import { createQuestion, updateQuestion } from '@/src/features/questions/api';
import AppConfig from '@/src/app_config';

interface QuestionFormProps {
    collectionId: string;
    question?: Question; // 編集時に既存の問題を渡す
    onSaved: (question: Question) => void;
    onCancel: () => void;
}

export function QuestionForm({ collectionId, question, onSaved, onCancel }: QuestionFormProps) {
    const isEditing = !!question;
    const [input, setInput] = useState<QuestionInput>({
        questionText: question?.questionText || '',
        correctAnswers: question?.correctAnswers || [''],
        answerRubis: question?.answerRubis || [''],
        distractors: question?.distractors || ['', '', ''],
        descriptionText: question?.descriptionText || '',
        preferredMode: question?.preferredMode || 'default',
    });
    const [answersString, setAnswersString] = useState(question?.correctAnswers.join(', ') || '');
    const [rubisString, setRubisString] = useState(question?.answerRubis?.join(', ') || '');
    const [distractorsString, setDistractorsString] = useState(question?.distractors?.join(', ') || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const correctAnswers = answersString.split(',').map(s => s.trim()).filter(s => s !== '');
        const answerRubis = rubisString.split(',').map(s => s.trim()).filter(s => s !== '');
        const distractors = distractorsString.split(',').map(s => s.trim()).filter(s => s !== '');

        if (!input.questionText.trim() || correctAnswers.length === 0) {
            setError('問題文と正解は必須です');
            return;
        }

        const data: QuestionInput = {
            ...input,
            correctAnswers,
            answerRubis,
            distractors
        };

        setLoading(true);
        setError(null);

        try {
            let result: Question;
            if (isEditing && question) {
                result = await updateQuestion(question.id, data);
            } else {
                result = await createQuestion(collectionId, data);
            }
            onSaved(result);
        } catch (err) {
            console.error('問題の保存に失敗しました', err);
            setError('保存に失敗しました。もう一度お試しください。');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={true}
            onClose={onCancel}
            title={isEditing ? '問題を編集' : '問題を追加'}
            size="md"
            footer={
                <Flex gap="sm" justify="end" className="w-full">
                    <Button variant="ghost" type="button" onClick={onCancel}>
                        キャンセル
                    </Button>
                    <Button variant="solid" color="primary" type="button" onClick={handleSubmit} disabled={loading}>
                        {loading ? '保存中...' : (isEditing ? '更新' : '追加')}
                    </Button>
                </Flex>
            }
        >
            <form onSubmit={handleSubmit}>
                <Stack gap="md">
                    <FormField label="問題文" required>
                        <Input
                            value={input.questionText}
                            onChange={(e) => setInput({ ...input, questionText: e.target.value })}
                            placeholder="問題文を入力してください"
                            maxLength={AppConfig.quiz.question_text_max_length}
                            autoFocus
                        />
                    </FormField>

                    <FormField
                        label="正解"
                        required
                        description="※ 最初の解答がクイズのチップモードなどで優先的に使用されます。"
                    >
                        <Input
                            value={answersString}
                            onChange={(e) => setAnswersString(e.target.value)}
                            placeholder="正解を入力してください（複数の場合はカンマ区切り）"
                        />
                    </FormField>

                    <FormField label="読み (文字チップ用)">
                        <Input
                            value={rubisString}
                            onChange={(e) => setRubisString(e.target.value)}
                            placeholder="ひらがな・英数字で入力（複数の場合はカンマ区切り）"
                        />
                    </FormField>

                    <FormField label="解説（任意）">
                        <Input
                            value={input.descriptionText}
                            onChange={(e) => setInput({ ...input, descriptionText: e.target.value })}
                            placeholder="解説を入力してください"
                            maxLength={AppConfig.quiz.description_max_length}
                        />
                    </FormField>

                    <View className="pt-2 border-t border-surface-muted/50">
                        <FormField
                            label="4択の選択肢 (誤答)"
                            description="※ 4択モードで使用"
                        >
                            <Input
                                value={distractorsString}
                                onChange={(e) => setDistractorsString(e.target.value)}
                                placeholder="誤答を入力（3つ推奨、カンマ区切り）"
                            />
                        </FormField>
                    </View>

                    <FormField label="回答方式の設定">
                        <Stack gap="sm">
                            {question?.recommendedMode && (
                                <View>
                                    <Badge variant="primary">
                                        AI推奨: {
                                            question.recommendedMode === 'chips' ? '文字チップ' :
                                                question.recommendedMode === 'fourChoice' ? '4択' :
                                                    question.recommendedMode === 'text' ? 'テキスト' :
                                                        question.recommendedMode === 'choice' ? '選択肢系' : '通常'
                                        }
                                    </Badge>
                                </View>
                            )}
                            <Select
                                value={input.preferredMode}
                                onChange={(e) => setInput({ ...input, preferredMode: e.target.value as any })}
                            >
                                <option value="default">自動 (おまかせ)</option>
                                <option value="text">テキスト入力</option>
                                <option value="fourChoice">4択</option>
                                <option value="chips">文字チップ</option>
                            </Select>
                            <Text variant="xs" color="secondary">
                                ※ 「自動」を選択すると、上記AI推奨や画面設定に合わせて最適化されます。
                            </Text>
                        </Stack>
                    </FormField>

                    {error && (
                        <Text variant="xs" color="danger">{error}</Text>
                    )}
                </Stack>
            </form>
        </Modal>
    );
}
