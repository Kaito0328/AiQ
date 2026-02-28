"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import { Badge } from '@/src/design/baseComponents/Badge';
import { Check, X, ArrowRight, MessageSquare, AlertCircle, Trash2 } from 'lucide-react';
import { getEditRequests, getMyPendingRequests, updateEditRequestStatus, updateQuestion } from '../api';
import { useToast } from '@/src/shared/contexts/ToastContext';
import { cn } from '@/src/shared/utils/cn';

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
    const { showToast } = useToast();

    const fetchRequests = async () => {
        setLoading(true);
        try {
            let data;
            if (isGlobal) {
                data = await getMyPendingRequests();
            } else if (collectionId) {
                data = await getEditRequests(collectionId);
                data = data.filter((r: any) => r.status === 'pending');
            } else {
                data = [];
            }
            setRequests(data);
        } catch (error) {
            console.error('Failed to fetch requests', error);
            showToast({ message: 'リクエストの取得に失敗しました', variant: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [collectionId, isGlobal]);

    const handleApprove = async (request: any) => {
        try {
            // 1. Update the actual question
            await updateQuestion(request.questionId, {
                questionText: request.questionText,
                correctAnswers: request.correctAnswers,
                descriptionText: request.descriptionText,
            });

            // 2. Update request status to approved
            await updateEditRequestStatus(request.id, 'approved');

            showToast({ message: '修正案を承認し、問題を更新しました', variant: 'success' });
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
                                        >
                                            <Check size={16} />
                                            承認して更新
                                        </Button>
                                    </Flex>
                                </Flex>

                                {/* Comparison Grid */}
                                <View className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {/* Original */}
                                    <Stack gap="xs">
                                        <Text variant="xs" weight="bold" color="secondary">現在の内容</Text>
                                        <View className="p-4 rounded-xl bg-surface-muted/30 border border-surface-muted opacity-60">
                                            <Stack gap="sm">
                                                <Text variant="detail" weight="medium">{request.originalQuestionText}</Text>
                                                <Text variant="xs" color="secondary">
                                                    答: {request.originalCorrectAnswers?.join(' / ') || '未設定'}
                                                </Text>
                                                {request.originalDescriptionText && (
                                                    <Text variant="xs" color="secondary" className="italic mt-1">
                                                        解説: {request.originalDescriptionText}
                                                    </Text>
                                                )}
                                            </Stack>
                                        </View>
                                    </Stack>

                                    {/* Proposed */}
                                    <Stack gap="xs">
                                        <Text variant="xs" weight="bold" color="primary">提案された内容</Text>
                                        <View className="p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/20 relative">
                                            <ArrowRight size={20} className="absolute -left-6 top-1/2 -translate-y-1/2 text-brand-primary hidden md:block" />
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
                                                {request.descriptionText && (
                                                    <View className="mt-2 pt-2 border-t border-brand-primary/10">
                                                        <Text variant="xs" color="secondary" className="italic">
                                                            解説: {request.descriptionText}
                                                        </Text>
                                                    </View>
                                                )}
                                            </Stack>
                                        </View>
                                    </Stack>
                                </View>
                            </Stack>
                        </Card>
                    );
                })}
            </Stack>
        </Stack>
    );
}
