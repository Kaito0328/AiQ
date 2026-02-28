"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import { Input } from '@/src/design/baseComponents/Input';
import { TextArea } from '@/src/design/baseComponents/TextArea';
import { Question } from '@/src/entities/question';
import { Eye, EyeOff, Trash2, Edit, Plus, Sparkles, FileUp, Save, X, RotateCcw, Settings, MessageSquare, Loader2 } from 'lucide-react';
import { deleteQuestion, batchQuestions, completeQuestions } from '@/src/features/questions/api';
import { cn } from '@/src/shared/utils/cn';
import { useToast } from '@/src/shared/contexts/ToastContext';
import { EditRequestModal } from './EditRequestModal';
import { AiSettingsModal } from './AiSettingsModal';

interface QuestionDraft {
    id: string; // Existing ID or temp ID
    questionText: string;
    correctAnswers: string[];
    descriptionText?: string;
    isNew?: boolean;
    isModified?: boolean;
    aiFields?: Set<string>; // Track which fields were filled by AI
    modifiedFields?: Set<string>; // Track manually modified fields
}

interface QuestionListProps {
    questions: Question[];
    isOwner: boolean;
    isEditMode: boolean;
    onToggleEditMode: () => void;
    onQuestionDeleted: (questionId: string) => void;
    onEditQuestion: (question: Question) => void;
    onAddQuestion: () => void;
    onImportCsv: () => void;
    onSuccess: () => void;
}

export function QuestionList({
    questions,
    isOwner,
    isEditMode,
    onToggleEditMode,
    onQuestionDeleted,
    onEditQuestion,
    onAddQuestion,
    onImportCsv,
    onSuccess,
}: QuestionListProps) {
    const { showToast } = useToast();
    const [visibleAnswers, setVisibleAnswers] = useState<Set<string>>(new Set());
    const [allVisible, setAllVisible] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [drafts, setDrafts] = useState<QuestionDraft[]>([]);
    const [isSaving, setIsSaving] = useState(false);
    const [isAutoFilling, setIsAutoFilling] = useState(false);
    const [shouldCompleteDescription, setShouldCompleteDescription] = useState(true);
    const [deletedIds, setDeletedIds] = useState<string[]>([]);
    const [questionFormat, setQuestionFormat] = useState('');
    const [answerFormat, setAnswerFormat] = useState('');
    const [isAiSettingsModalOpen, setIsAiSettingsModalOpen] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
    // Initialize drafts when entering edit mode
    useEffect(() => {
        if (isEditMode) {
            setDeletedIds([]);
            setDrafts(questions.map(q => ({
                id: q.id,
                questionText: q.questionText,
                correctAnswers: q.correctAnswers,
                descriptionText: q.descriptionText,
                isNew: false,
                isModified: false,
                aiFields: new Set(),
                modifiedFields: new Set(),
            })));
        }
    }, [isEditMode, questions]);

    const handleBatchSave = async () => {
        setIsSaving(true);
        try {
            const collectionId = questions[0]?.collectionId || (window.location.pathname.split('/').pop() as string);
            const upsertItems = drafts.map(d => ({
                id: d.isNew ? undefined : d.id,
                questionText: d.questionText,
                correctAnswers: d.correctAnswers,
                descriptionText: d.descriptionText || null,
            }));

            await batchQuestions(collectionId, { upsertItems, deleteIds: deletedIds });
            showToast({ message: '一括保存が完了しました', variant: 'success' });
            onToggleEditMode();
            onSuccess();
        } catch (err) {
            console.error('一括保存に失敗しました', err);
            showToast({ message: '保存に失敗しました', variant: 'danger' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAutoFill = async (settings?: {
        questionFormat: string;
        answerFormat: string;
        shouldCompleteDescription: boolean;
    }) => {
        if (drafts.length === 0) return;
        setIsAutoFilling(true);

        const qFmt = settings ? settings.questionFormat : questionFormat;
        const aFmt = settings ? settings.answerFormat : answerFormat;
        const cDesc = settings ? settings.shouldCompleteDescription : shouldCompleteDescription;

        // Update states if settings provided from modal
        if (settings) {
            setQuestionFormat(settings.questionFormat);
            setAnswerFormat(settings.answerFormat);
            setShouldCompleteDescription(settings.shouldCompleteDescription);
        }

        try {
            const payload = {
                items: drafts.map(d => ({
                    id: d.id,
                    questionText: (d.questionText && d.questionText.trim() !== '') ? d.questionText : null,
                    correctAnswers: (d.correctAnswers && d.correctAnswers.length > 0 && d.correctAnswers[0].trim() !== '') ? d.correctAnswers : null,
                    descriptionText: (d.descriptionText && d.descriptionText.trim() !== '') ? d.descriptionText : null,
                })),
                complete_description: cDesc,
                questionFormat: qFmt,
                answerFormat: aFmt
            };

            const completed = await completeQuestions(payload) as any[];

            // Merge back into drafts using ID to ensure correct rows
            setDrafts(prev => prev.map((d) => {
                const comp = completed.find(c => c.id === d.id);
                if (!comp) return d;

                const isQuestionEmpty = !d.questionText || d.questionText.trim() === '';
                const areAnswersEmpty = !d.correctAnswers || d.correctAnswers.length === 0 || (d.correctAnswers.length === 1 && d.correctAnswers[0].trim() === '');
                const isDescriptionEmpty = !d.descriptionText || d.descriptionText.trim() === '';

                const newQuestion = comp.questionText;
                const newAnswers = comp.correctAnswers;
                const newDescription = comp.descriptionText;

                const hasChanges = (isQuestionEmpty && newQuestion) ||
                    (areAnswersEmpty && newAnswers) ||
                    (isDescriptionEmpty && newDescription);

                if (!hasChanges) return d;

                const newAiFields = new Set(d.aiFields || []);
                if (isQuestionEmpty && newQuestion) newAiFields.add('questionText');
                if (areAnswersEmpty && newAnswers) newAiFields.add('correctAnswers');
                if (isDescriptionEmpty && newDescription) newAiFields.add('descriptionText');

                const newModifiedFields = new Set(d.modifiedFields || []);

                return {
                    ...d,
                    questionText: isQuestionEmpty ? (newQuestion || d.questionText) : d.questionText,
                    correctAnswers: areAnswersEmpty ? (newAnswers || d.correctAnswers) : d.correctAnswers,
                    descriptionText: isDescriptionEmpty ? (newDescription || d.descriptionText) : d.descriptionText,
                    isModified: true,
                    aiFields: newAiFields,
                    modifiedFields: newModifiedFields
                };
            }));

            showToast({ message: 'AIによる補完が完了しました', variant: 'success' });
        } catch (err) {
            console.error('AI補完に失敗しました', err);
            showToast({ message: '補完に失敗しました', variant: 'danger' });
        } finally {
            setIsAutoFilling(false);
        }
    };

    const addEmptyRow = () => {
        const newId = `new-${Date.now()}`;
        setDrafts(prev => [...prev, {
            id: newId,
            questionText: '',
            correctAnswers: [''],
            descriptionText: '',
            isNew: true,
            isModified: true,
            aiFields: new Set(),
            modifiedFields: new Set(['questionText', 'correctAnswers', 'descriptionText']),
        }]);
    };

    const updateDraft = (id: string, field: keyof QuestionDraft, value: any) => {
        setDrafts(prev => prev.map(d => {
            if (d.id === id) {
                let finalValue = value;
                // 解答欄の場合、セミコロンで分割
                if (field === 'correctAnswers' && typeof value === 'string') {
                    finalValue = value.split(';').map(s => s.trim());
                }

                // AI補完フラグを削除、手動変更フラグを追加
                const newAiFields = new Set(d.aiFields);
                newAiFields.delete(field as string);

                const newModifiedFields = new Set(d.modifiedFields);
                newModifiedFields.add(field as string);

                return {
                    ...d,
                    [field]: finalValue,
                    isModified: true,
                    aiFields: newAiFields,
                    modifiedFields: newModifiedFields
                };
            }
            return d;
        }));
    };

    const removeDraft = (id: string) => {
        const draftToRemove = drafts.find(d => d.id === id);
        if (draftToRemove && !draftToRemove.isNew) {
            setDeletedIds(prev => [...prev, id]);
        }
        setDrafts(prev => prev.filter(d => d.id !== id));
    };

    const toggleAnswer = (id: string) => {
        setVisibleAnswers(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const toggleAllAnswers = () => {
        if (allVisible) {
            setVisibleAnswers(new Set());
        } else {
            setVisibleAnswers(new Set(questions.map(q => q.id)));
        }
        setAllVisible(!allVisible);
    };

    const handleDelete = async (questionId: string) => {
        if (!confirm('この問題を削除してもよろしいですか？')) return;
        setDeletingId(questionId);
        try {
            await deleteQuestion(questionId);
            onQuestionDeleted(questionId);
        } catch (err) {
            console.error('問題の削除に失敗しました', err);
        } finally {
            setDeletingId(null);
        }
    };

    if (isEditMode) {
        return (
            <Stack gap="lg">
                <Flex justify="between" align="center">
                    <Stack gap="xs">
                        <Text variant="h3" weight="bold">一括編集モード</Text>
                        <Text variant="xs" color="secondary">変更は「保存」ボタンを押すまで確定されません。</Text>
                    </Stack>
                    <Stack gap="xs" align="end">
                        <Flex gap="sm" align="center" className="flex-wrap justify-end">
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={() => setIsAiSettingsModalOpen(true)}
                                className="gap-1.5 border-brand-primary/30 text-brand-primary hover:bg-brand-primary/5 h-8"
                                loading={isAutoFilling}
                                disabled={isSaving}
                            >
                                <Sparkles size={14} />
                                AIで補完
                            </Button>
                            <Button
                                variant="ghost"
                                size="lg"
                                onClick={onToggleEditMode}
                                className="gap-1.5 h-8 text-xs"
                                disabled={isSaving || isAutoFilling}
                            >
                                <X size={14} />
                                キャンセル
                            </Button>
                            <Button
                                variant="solid"
                                color="primary"
                                size="lg"
                                onClick={handleBatchSave}
                                className="gap-1.5 h-8 text-xs font-bold"
                                loading={isSaving}
                            >
                                <Save size={14} />
                                変更を保存
                            </Button>
                        </Flex>
                    </Stack>
                </Flex>

                <Card padding="none" border="primary" className="overflow-hidden">
                    <View className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-brand-primary/5 border-b border-brand-primary/10">
                                    <th className="p-3 text-xs font-bold text-secondary w-12 text-center">#</th>
                                    <th className="p-3 text-xs font-bold text-secondary min-w-[300px]">問題文</th>
                                    <th className="p-3 text-xs font-bold text-secondary min-w-[200px]">解答 (セミコロン区切りで複数可)</th>
                                    <th className="p-3 text-xs font-bold text-secondary min-w-[200px]">解説 (任意)</th>
                                    <th className="p-3 text-xs font-bold text-secondary w-12"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {drafts.map((draft, index) => (
                                    <tr key={draft.id} className={cn(
                                        "border-b border-gray-100 hover:bg-gray-50/50 transition-colors",
                                        (draft.isModified || draft.isNew) && "bg-brand-primary/[0.02]"
                                    )}>
                                        <td className="p-3 text-center">
                                            <Flex gap="xs" align="center" justify="center">
                                                <Text
                                                    variant="xs"
                                                    weight="bold"
                                                    className={cn(
                                                        (draft.isModified || draft.isNew) ? "text-brand-primary" : "text-secondary"
                                                    )}
                                                >
                                                    {index + 1}
                                                </Text>
                                                {(draft.isModified || draft.isNew) && (
                                                    <Text variant="xs" color="primary" weight="bold">*</Text>
                                                )}
                                            </Flex>
                                        </td>
                                        <td className={cn(
                                            "p-2 relative group",
                                            draft.aiFields?.has('questionText') ? "bg-brand-primary/10" : (draft.modifiedFields?.has('questionText') ? "bg-gray-200" : "")
                                        )}>
                                            <TextArea
                                                value={draft.questionText}
                                                onChange={(e) => updateDraft(draft.id, 'questionText', e.target.value)}
                                                placeholder="問題を入力..."
                                                className="min-h-[60px] text-sm border-transparent hover:border-gray-200 focus:border-brand-primary/30 bg-transparent"
                                            />
                                            {draft.aiFields?.has('questionText') && (
                                                <div className="absolute bottom-1 right-1 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <Sparkles size={12} className="text-brand-primary" />
                                                </div>
                                            )}
                                        </td>
                                        <td className={cn(
                                            "p-2 relative group",
                                            draft.aiFields?.has('correctAnswers') ? "bg-brand-primary/10" : (draft.modifiedFields?.has('correctAnswers') ? "bg-gray-200" : "")
                                        )}>
                                            <Input
                                                value={(draft.correctAnswers || []).join(';')}
                                                onChange={(e) => updateDraft(draft.id, 'correctAnswers', e.target.value)}
                                                placeholder="解答を入力..."
                                                className="text-sm border-transparent hover:border-gray-200 focus:border-brand-primary/30 bg-transparent"
                                            />
                                            {draft.aiFields?.has('correctAnswers') && (
                                                <div className="absolute bottom-1 right-1 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <Sparkles size={12} className="text-brand-primary" />
                                                </div>
                                            )}
                                        </td>
                                        <td className={cn(
                                            "p-2 relative group",
                                            draft.aiFields?.has('descriptionText') ? "bg-brand-primary/10" : (draft.modifiedFields?.has('descriptionText') ? "bg-gray-200" : "")
                                        )}>
                                            <TextArea
                                                value={draft.descriptionText || ''}
                                                onChange={(e) => updateDraft(draft.id, 'descriptionText', e.target.value)}
                                                placeholder="解説を入力..."
                                                className="min-h-[60px] text-sm border-transparent hover:border-gray-200 focus:border-brand-primary/30 bg-transparent"
                                            />
                                            {draft.aiFields?.has('descriptionText') && (
                                                <div className="absolute bottom-1 right-1 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
                                                    <Sparkles size={12} className="text-brand-primary" />
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => removeDraft(draft.id)}
                                                className="text-brand-danger hover:bg-brand-danger/10"
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </View>
                    <View className="p-4 bg-gray-50/50 border-t border-gray-100">
                        <Button
                            variant="ghost"
                            size="md"
                            onClick={addEmptyRow}
                            className="w-full border border-dashed border-gray-300 hover:border-brand-primary/50 text-secondary hover:text-brand-primary gap-2"
                        >
                            <Plus size={16} />
                            新しい行を追加
                        </Button>
                    </View>
                </Card>
                <AiSettingsModal
                    isOpen={isAiSettingsModalOpen}
                    onClose={() => setIsAiSettingsModalOpen(false)}
                    initialSettings={{
                        questionFormat,
                        answerFormat,
                        shouldCompleteDescription
                    }}
                    onConfirm={handleAutoFill}
                />
            </Stack >
        );
    }

    return (
        <Stack gap="lg">
            <Flex justify="between" align="center">
                <Text variant="h3" weight="bold">問題一覧 ({questions.length})</Text>
                <Flex gap="sm">
                    <Button
                        variant="ghost"
                        size="lg"
                        onClick={toggleAllAnswers}
                        className="gap-1.5 text-foreground/60"
                    >
                        {allVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                        {allVisible ? '全て隠す' : '全て表示'}
                    </Button>
                    {isOwner && (
                        <>
                            <Button
                                variant="outline"
                                size="lg"
                                onClick={onToggleEditMode}
                                className="gap-1.5 border-gray-200"
                            >
                                <Edit size={16} />
                                編集モード
                            </Button>
                            <Button
                                variant="solid" color="primary"
                                size="lg"
                                onClick={onAddQuestion}
                                className="gap-1.5"
                            >
                                <Plus size={16} />
                                問題を追加
                            </Button>
                        </>
                    )}
                </Flex>
            </Flex>

            {questions.length === 0 ? (
                <Card border="base" bg="muted" className="border-dashed">
                    <View className="py-16 px-6 text-center">
                        <Stack gap="lg" align="center">
                            <View className="bg-brand-primary/10 p-4 rounded-2xl">
                                <Sparkles size={48} className="text-brand-primary animate-pulse" />
                            </View>

                            <Stack gap="sm">
                                <Text variant="h2" weight="bold">コレクションはまだ空です</Text>
                                <Text color="secondary" className="max-w-sm mx-auto">
                                    上のバーを使ってAIに問題を生成させるか、下のボタンから手動で追加してください。
                                </Text>
                            </Stack>

                            {isOwner && (
                                <Flex gap="md" className="w-full max-w-xs justify-center">
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={onAddQuestion}
                                        className="gap-2"
                                    >
                                        <Plus size={18} />
                                        手動で追加
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={onToggleEditMode}
                                        className="gap-2"
                                    >
                                        <Edit size={18} />
                                        編集モード
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        onClick={onImportCsv}
                                        className="gap-2"
                                    >
                                        <FileUp size={18} />
                                        CSV
                                    </Button>
                                </Flex>
                            )}
                        </Stack>
                    </View>
                </Card>
            ) : (
                <Stack gap="md">
                    {questions.map((question, index) => {
                        const isVisible = visibleAnswers.has(question.id);
                        const isDeleting = deletingId === question.id;

                        return (
                            <Card
                                key={question.id}
                                padding="md"
                                border="base"
                                className={cn(
                                    "transition-all",
                                    isDeleting && "opacity-50"
                                )}
                            >
                                <Stack gap="md">
                                    <Flex justify="between" align="start">
                                        <Flex gap="sm" align="start" className="flex-1">
                                            <Text
                                                variant="xs"
                                                weight="bold"
                                                className="bg-brand-primary text-white rounded-full w-7 h-7 flex items-center justify-center shrink-0 mt-0.5"
                                            >
                                                {index + 1}
                                            </Text>
                                            <Text weight="medium" className="flex-1">
                                                {question.questionText}
                                            </Text>
                                        </Flex>

                                        <Flex gap="xs" className="shrink-0 ml-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => toggleAnswer(question.id)}
                                                className="p-1.5 h-auto text-foreground/50"
                                                title={isVisible ? '答えを隠す' : '答えを表示'}
                                            >
                                                {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </Button>
                                            {!isOwner && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedQuestion(question)}
                                                    className="p-1.5 h-auto text-brand-primary"
                                                    title="修正を提案"
                                                >
                                                    <MessageSquare size={16} />
                                                </Button>
                                            )}
                                            {isOwner && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => onEditQuestion(question)}
                                                        className="p-1.5 h-auto text-brand-primary"
                                                        title="編集"
                                                    >
                                                        <Edit size={16} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(question.id)}
                                                        className="p-1.5 h-auto text-brand-danger"
                                                        title="削除"
                                                        disabled={isDeleting}
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </>
                                            )}
                                        </Flex>
                                    </Flex>

                                    {isVisible && (
                                        <View className="border-t border-surface-muted-border pt-3">
                                            <Stack gap="xs">
                                                <Flex gap="sm" align="start">
                                                    <Text variant="xs" weight="bold" color="primary" className="shrink-0">
                                                        答え:
                                                    </Text>
                                                    <Text variant="detail" weight="bold" color="primary">
                                                        {(question.correctAnswers || []).join(' / ')}
                                                    </Text>
                                                </Flex>
                                                {question.descriptionText && (
                                                    <Flex gap="sm" align="start">
                                                        <Text variant="xs" color="secondary" className="shrink-0">
                                                            解説:
                                                        </Text>
                                                        <Text variant="xs" color="secondary" className="leading-relaxed">
                                                            {question.descriptionText}
                                                        </Text>
                                                    </Flex>
                                                )}
                                            </Stack>
                                        </View>
                                    )}
                                </Stack>
                            </Card>
                        );
                    })}
                </Stack>
            )}

            {selectedQuestion && (
                <EditRequestModal
                    question={selectedQuestion}
                    onClose={() => setSelectedQuestion(null)}
                />
            )}
        </Stack>
    );
}
