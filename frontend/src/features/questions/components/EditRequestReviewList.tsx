"use client"
import { logger } from '@/src/shared/utils/logger';

import React, { useState, useEffect } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import { Badge } from '@/src/design/baseComponents/Badge';
import { Input } from '@/src/design/baseComponents/Input';
import { TextArea } from '@/src/design/baseComponents/TextArea';
import { Check, X, ArrowRight, MessageSquare, AlertCircle, Trash2, Edit2, Save } from 'lucide-react';
import { getEditRequests, getMyPendingRequests, updateEditRequestStatus, updateQuestion } from '../api';
import { useToast } from '@/src/shared/contexts/ToastContext';
import { cn } from '@/src/shared/utils/cn';
import { useNetworkStatus } from '@/src/shared/contexts/NetworkStatusContext';
import { ApiError } from '@/src/shared/api/error';
import { loadPendingEditRequestsCache, savePendingEditRequestsCache } from '@/src/shared/api/editRequestCache';

interface EditRequestReviewListProps {
    collectionId?: string;
    onActionSuccess?: () => void;
    isGlobal?: boolean;
}

const REASON_LABELS: Record<number, string> = {
    1: '誤字脱字',
    2: '解答が不適切',
    3: '重複している',
    4: 'カテゴリ/分類が不適切',
    5: 'その他',
};

export function EditRequestReviewList({ collectionId, onActionSuccess, isGlobal = false }: EditRequestReviewListProps) {
    const [requests, setRequests] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRequestId, setEditingRequestId] = useState<string | null>(null);
    const [editData, setEditData] = useState<any>(null);
    const [isShowingCachedData, setIsShowingCachedData] = useState(false);
    const { showToast } = useToast();
    const { isOnline } = useNetworkStatus();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            let data;
            if (isGlobal) {
                data = await getMyPendingRequests();
                savePendingEditRequestsCache(data);
                setIsShowingCachedData(false);
            } else if (collectionId) {
                data = await getEditRequests(collectionId);
                data = data.filter((r: any) => r.status === 'pending');
            } else {
                data = [];
            }
            setRequests(data);
        } catch (error) {
            logger.error('Failed to fetch requests', error);
            // オフライン（503/0）の場合はトーストを表示しない
            const isOfflineError = error instanceof ApiError && (error.status === 503 || error.status === 0);
            if (isGlobal && isOfflineError) {
                const cached = loadPendingEditRequestsCache();
                setRequests(cached as any[]);
                setIsShowingCachedData(true);
            }
            if (!isOfflineError) {
                showToast({ message: 'リクエストの取得に失敗しました', variant: 'danger' });
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [collectionId, isGlobal]);

    const handleStartEdit = (request: any) => {
        setEditingRequestId(request.id);
        setEditData({
            questionText: request.questionText,
            correctAnswers: request.correctAnswers.join('; '),
            answerRubis: request.answerRubis?.join('; ') || '',
            distractors: request.distractors?.join('; ') || '',
            descriptionText: request.descriptionText || '',
        });
    };

    const handleApprove = async (request: any) => {
        try {
            const finalData = editingRequestId === request.id ? {
                questionText: editData.questionText,
                correctAnswers: editData.correctAnswers.split(';').map((a: string) => a.trim()).filter((a: string) => a !== ''),
                answerRubis: editData.answerRubis.split(';').map((a: string) => a.trim()).filter((a: string) => a !== ''),
                distractors: editData.distractors.split(';').map((a: string) => a.trim()).filter((a: string) => a !== ''),
                descriptionText: editData.descriptionText.trim() !== '' ? editData.descriptionText : undefined,
            } : {
                questionText: request.questionText,
                correctAnswers: request.correctAnswers,
                answerRubis: request.answerRubis,
                distractors: request.distractors,
                descriptionText: request.descriptionText,
            };

            // 1. Update the actual question
            await updateQuestion(request.questionId, finalData);

            // 2. Update request status to approved
            await updateEditRequestStatus(request.id, 'approved');

            showToast({ message: '修正案を承認し、問題を更新しました', variant: 'success' });
            setEditingRequestId(null);
            fetchRequests();
            if (onActionSuccess) onActionSuccess();
        } catch (error) {
            showToast({ message: '承認に失敗しました', variant: 'danger' });
        }
    };

    const handleReject = async (requestId: string) => {
        try {
            await updateEditRequestStatus(requestId, 'rejected');
            showToast({ message: '修正案を却下しました', variant: 'info' });
            fetchRequests();
        } catch (error) {
            showToast({ message: '却下に失敗しました', variant: 'danger' });
        }
    };

    if (loading) {
        return <View className="py-8 text-center"><Text color="secondary">読み込み中...</Text></View>;
    }

    if (requests.length === 0) {
        if (isGlobal) {
            return (
                <View className="py-12 text-center bg-surface-base rounded-2xl border-2 border-dashed border-surface-muted">
                    <Stack gap="md" align="center">
                        <MessageSquare size={48} className="text-secondary opacity-20" />
                        <Text color="secondary" weight="medium">現在、未承認の修正依頼はありません</Text>
                    </Stack>
                </View>
            );
        }
        return null; // Don't show anything in collection detail if no requests
    }

    return (
        <Stack gap="lg">
            {!isGlobal && (
                <Flex align="center" gap="sm">
                    <Badge variant="primary">{requests.length}</Badge>
                    <Text variant="h3" weight="bold">修正依頼の確認</Text>
                </Flex>
            )}

            <Stack gap="md">
                {requests.map((request) => {
                    return (
                        <Card key={request.id} padding="lg" className="border-l-4 border-l-brand-primary">
                            <Stack gap="lg">
                                {/* Meta Header */}
                                <Flex justify="between" align="start">
                                    <Stack gap="xs">
                                        <Flex gap="sm" align="center">
                                            <Badge variant="secondary" className="text-[10px]">
                                                {REASON_LABELS[request.reasonId] || 'その他'}
                                            </Badge>
                                            {isShowingCachedData && (
                                                <Badge variant="warning" className="text-[10px]">
                                                    キャッシュ表示
                                                </Badge>
                                            )}
                                            <Text variant="xs" color="secondary">
                                                依頼者: {request.requesterName || '匿名ユーザー'}
                                            </Text>
                                        </Flex>
                                    </Stack>
                                    <Flex gap="sm">
                                        <Button
                                            variant="ghost"
                                            color="secondary"
                                            size="sm"
                                            className="h-9 gap-1 text-brand-danger hover:bg-brand-danger/10"
                                            onClick={() => handleReject(request.id)}
                                            disabled={!isOnline}
                                        >
                                            <X size={16} />
                                            却下
                                        </Button>
                                        <Button
                                            variant="solid"
                                            color="primary"
                                            size="sm"
                                            className="h-9 gap-1 shadow-md shadow-brand-primary/20"
                                            onClick={() => handleApprove(request)}
                                            disabled={!isOnline}
                                        >
                                            <Check size={16} />
                                            {editingRequestId === request.id ? '修正して承認' : '承認して更新'}
                                        </Button>
                                    </Flex>
                                </Flex>

                                {/* Comparison Grid */}
                                <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Original */}
                                    <Stack gap="xs">
                                        <Text variant="xs" weight="bold" color="secondary">現在の内容</Text>
                                        <View padding="md" rounded="lg" className="bg-surface-muted/30 border border-surface-muted opacity-60">
                                            <Stack gap="sm">
                                                <Text variant="detail" weight="medium">{request.originalQuestionText}</Text>
                                                <Text variant="xs" color="secondary">
                                                    答: {request.originalCorrectAnswers?.join(' / ') || '未設定'}
                                                </Text>
                                                {request.originalAnswerRubis?.length > 0 && (
                                                    <Text variant="xs" color="secondary">
                                                        読み: {request.originalAnswerRubis.join(' / ')}
                                                    </Text>
                                                )}
                                                {request.originalDistractors?.length > 0 && (
                                                    <Text variant="xs" color="secondary">
                                                        選択肢: {request.originalDistractors.join(' / ')}
                                                    </Text>
                                                )}
                                                {request.originalDescriptionText && (
                                                    <Text variant="xs" color="secondary" className="italic mt-1">
                                                        解説: {request.originalDescriptionText}
                                                    </Text>
                                                )}
                                            </Stack>
                                        </View>
                                    </Stack>

                                    {/* Proposed / Editable */}
                                    <Stack gap="xs">
                                        <Flex justify="between" align="center">
                                            <Text variant="xs" weight="bold" color="primary">
                                                {editingRequestId === request.id ? '内容を編集中' : '提案された内容'}
                                            </Text>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                color={editingRequestId === request.id ? 'danger' : 'primary'}
                                                className="h-7 px-2"
                                                onClick={() => editingRequestId === request.id ? setEditingRequestId(null) : handleStartEdit(request)}
                                            >
                                                {editingRequestId === request.id ? (
                                                    <Flex gap="xs" align="center">
                                                        <X size={12} />
                                                        <span>キャンセル</span>
                                                    </Flex>
                                                ) : (
                                                    <Flex gap="xs" align="center">
                                                        <Edit2 size={12} />
                                                        <span>編集して承認</span>
                                                    </Flex>
                                                )}
                                            </Button>
                                        </Flex>
                                        <View padding="md" rounded="lg" className={cn(
                                            "border relative min-h-[140px]",
                                            editingRequestId === request.id ? "bg-surface-base border-brand-primary ring-1 ring-brand-primary/20" : "bg-brand-primary/5 border-brand-primary/20"
                                        )}>
                                            <ArrowRight size={20} className="absolute -left-6 top-1/2 -translate-y-1/2 text-brand-primary hidden md:block" />
                                            {editingRequestId === request.id ? (
                                                <Stack gap="md">
                                                    <Stack gap="xs">
                                                        <Text variant="xs" weight="bold">問題文</Text>
                                                        <TextArea
                                                            value={editData.questionText}
                                                            onChange={(e) => setEditData({ ...editData, questionText: e.target.value })}
                                                            className="text-xs min-h-[60px]"
                                                        />
                                                    </Stack>
                                                    <View className="grid grid-cols-2 gap-2">
                                                        <Stack gap="xs">
                                                            <Text variant="xs" weight="bold">正解 (;区切り)</Text>
                                                            <Input
                                                                value={editData.correctAnswers}
                                                                onChange={(e) => setEditData({ ...editData, correctAnswers: e.target.value })}
                                                                className="text-xs h-8"
                                                            />
                                                        </Stack>
                                                        <Stack gap="xs">
                                                            <Text variant="xs" weight="bold">読み (;区切り)</Text>
                                                            <Input
                                                                value={editData.answerRubis}
                                                                onChange={(e) => setEditData({ ...editData, answerRubis: e.target.value })}
                                                                className="text-xs h-8"
                                                            />
                                                        </Stack>
                                                    </View>
                                                    <Stack gap="xs">
                                                        <Text variant="xs" weight="bold">選択肢/誤答 (;区切り)</Text>
                                                        <Input
                                                            value={editData.distractors}
                                                            onChange={(e) => setEditData({ ...editData, distractors: e.target.value })}
                                                            className="text-xs h-8"
                                                        />
                                                    </Stack>
                                                    <Stack gap="xs">
                                                        <Text variant="xs" weight="bold">解説</Text>
                                                        <TextArea
                                                            value={editData.descriptionText}
                                                            onChange={(e) => setEditData({ ...editData, descriptionText: e.target.value })}
                                                            className="text-xs min-h-[40px]"
                                                        />
                                                    </Stack>
                                                </Stack>
                                            ) : (
                                                <Stack gap="sm">
                                                    <Text
                                                        variant="detail"
                                                        weight="bold"
                                                        className={cn(request.originalQuestionText !== request.questionText && "text-brand-primary")}
                                                    >
                                                        {request.questionText}
                                                    </Text>
                                                    <Text
                                                        variant="xs"
                                                        className={cn(request.originalCorrectAnswers?.join(';') !== request.correctAnswers.join(';') && "text-brand-primary font-bold")}
                                                    >
                                                        答: {request.correctAnswers.join(' / ')}
                                                    </Text>
                                                    {(request.answerRubis?.length > 0 || request.originalAnswerRubis?.length > 0) && (
                                                        <Text
                                                            variant="xs"
                                                            className={cn(request.originalAnswerRubis?.join(';') !== request.answerRubis?.join(';') && "text-brand-primary font-bold")}
                                                        >
                                                            読み: {request.answerRubis?.join(' / ') || '(なし)'}
                                                        </Text>
                                                    )}
                                                    {(request.distractors?.length > 0 || request.originalDistractors?.length > 0) && (
                                                        <Text
                                                            variant="xs"
                                                            className={cn(request.originalDistractors?.join(';') !== request.distractors?.join(';') && "text-brand-primary font-bold")}
                                                        >
                                                            選択肢: {request.distractors?.join(' / ') || '(なし)'}
                                                        </Text>
                                                    )}
                                                    {request.descriptionText && (
                                                        <View className="mt-2 pt-2 border-t border-brand-primary/10">
                                                            <Text variant="xs" color="secondary" className="italic">
                                                                解説: {request.descriptionText}
                                                            </Text>
                                                        </View>
                                                    )}
                                                </Stack>
                                            )}
                                        </View>
                                    </Stack>
                                </View>
                            </Stack>
                        </Card>
                    );
                })}
            </Stack>
        </Stack >
    );
}
