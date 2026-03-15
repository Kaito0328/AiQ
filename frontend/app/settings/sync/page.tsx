"use client";

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/src/shared/db/db';
import { syncManager } from '@/src/shared/api/SyncManager';
import { Container } from '@/src/design/primitives/Container';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Card } from '@/src/design/baseComponents/Card';
import { Button } from '@/src/design/baseComponents/Button';
import { Badge } from '@/src/design/baseComponents/Badge';
import { 
    Cloud, 
    AlertTriangle, 
    RefreshCcw, 
    Trash2, 
    Clock, 
    CheckCircle2,
    UserPlus,
    UserMinus,
    Heart,
    PlusCircle,
    Save,
    WifiOff
} from 'lucide-react';
import { useNetworkStatus } from '@/src/shared/contexts/NetworkStatusContext';

export default function SyncSettingsPage() {
    const { isOnline } = useNetworkStatus();
    
    const pendingActions = useLiveQuery(
        () => db.pendingActions.orderBy('timestamp').reverse().toArray(),
        []
    ) || [];

    const getActionIcon = (type: string) => {
        switch (type) {
            case 'FOLLOW_USER': return <UserPlus size={16} className="text-blue-500" />;
            case 'UNFOLLOW_USER': return <UserMinus size={16} className="text-gray-500" />;
            case 'FAVORITE_COLLECTION': return <Heart size={16} className="text-pink-500 fill-pink-500" />;
            case 'UNFAVORITE_COLLECTION': return <Heart size={16} className="text-gray-400" />;
            case 'CREATE_COLLECTION': return <PlusCircle size={16} className="text-green-500" />;
            case 'UPDATE_COLLECTION': return <Save size={16} className="text-amber-500" />;
            case 'DELETE_COLLECTION': return <Trash2 size={16} className="text-red-500" />;
            case 'SUBMIT_QUIZ_RESULT': return <CheckCircle2 size={16} className="text-emerald-500" />;
            case 'CREATE_EDIT_REQUEST': return <AlertTriangle size={16} className="text-indigo-500" />;
            default: return <RefreshCcw size={16} className="text-slate-400" />;
        }
    };

    const getActionLabel = (type: string) => {
        switch (type) {
            case 'FOLLOW_USER': return 'ユーザーのフォロー';
            case 'UNFOLLOW_USER': return 'フォロー解除';
            case 'FAVORITE_COLLECTION': return 'お気に入り追加';
            case 'UNFAVORITE_COLLECTION': return 'お気に入り解除';
            case 'CREATE_COLLECTION': return 'コレクション作成';
            case 'UPDATE_COLLECTION': return 'コレクション更新';
            case 'DELETE_COLLECTION': return 'コレクション削除';
            case 'CREATE_QUESTION': return '問題作成';
            case 'UPDATE_QUESTION': return '問題更新';
            case 'DELETE_QUESTION': return '問題削除';
            case 'BATCH_QUESTIONS': return '問題の一括更新';
            case 'SUBMIT_QUIZ_RESULT': return 'クイズ結果の送信';
            case 'CREATE_EDIT_REQUEST': return '問題の修正提案';
            default: return type;
        }
    };

    const handleSyncAll = () => {
        syncManager.sync();
    };

    return (
        <Container className="py-8 px-4 max-w-3xl">
            <Stack gap="xl">
                <Flex justify="between" align="center">
                    <Stack gap="xs">
                        <Text variant="h2" weight="bold">同期ステータス</Text>
                        <Text color="secondary" variant="body">
                            オフライン中に行った操作の待機リストです。
                        </Text>
                    </Stack>
                    <Button 
                        variant="solid" 
                        color="primary" 
                        onClick={handleSyncAll}
                        disabled={!isOnline || pendingActions.length === 0}
                    >
                        <Flex gap="xs" align="center">
                            <RefreshCcw size={18} />
                            今すぐ同期
                        </Flex>
                    </Button>
                </Flex>

                {!isOnline && (
                    <Card bg="muted" className="border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900/30">
                        <Flex gap="md" align="center">
                            <View className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-full text-amber-600">
                                <WifiOff size={20} />
                            </View>
                            <Stack gap="xs">
                                <Text weight="bold" color="primary">オフラインモード</Text>
                                <Text variant="body" color="secondary">
                                    インターネットに接続すると、保留中のアクションが自動的に送信されます。
                                </Text>
                            </Stack>
                        </Flex>
                    </Card>
                )}

                <Stack gap="md">
                    <Flex justify="between" align="center">
                        <Text weight="bold">保留中のアクション ({pendingActions.length})</Text>
                        {pendingActions.length > 0 && (
                            <Text variant="xs" color="secondary">新しい順</Text>
                        )}
                    </Flex>

                    {pendingActions.length === 0 ? (
                        <Card className="py-12 flex flex-col items-center justify-center border-dashed border-2">
                            <CheckCircle2 size={48} className="text-emerald-500/30 mb-4" />
                            <Text color="secondary">すべての操作が同期済みです</Text>
                        </Card>
                    ) : (
                        <Stack gap="sm">
                            {pendingActions.map((action) => (
                                <Card key={action.id} className="p-0 overflow-hidden border border-surface-muted/50 shadow-sm hover:shadow-md transition-shadow">
                                    <View className="h-1 w-full" style={{ 
                                        backgroundColor: action.status === 'error' ? 'var(--color-danger-500)' : 'var(--color-primary-500)' 
                                    }} />
                                    <View className="p-4">
                                        <Flex justify="between" align="start">
                                            <Flex gap="md" align="start">
                                                <View className="mt-1">
                                                    {getActionIcon(action.type)}
                                                </View>
                                                <Stack gap="xs">
                                                    <Flex gap="sm" align="center">
                                                        <Text weight="bold" variant="detail">
                                                            {getActionLabel(action.type)}
                                                        </Text>
                                                        {action.status === 'error' && (
                                                            <Badge variant="danger" className="text-[10px] py-0 px-1.5">エラー</Badge>
                                                        )}
                                                        {action.status === 'pending' && (
                                                            <Badge variant="secondary" className="text-[10px] py-0 px-1.5">待機中</Badge>
                                                        )}
                                                    </Flex>
                                                    <Text variant="xs" color="secondary" className="flex items-center gap-1 opacity-70">
                                                        <Clock size={10} />
                                                        {new Date(action.timestamp).toLocaleString()}
                                                        {action.type === 'SUBMIT_QUIZ_RESULT' && action.payload.answers && (
                                                            <span className="ml-2 font-medium text-brand-primary">
                                                                ({action.payload.answers.length} 回答分)
                                                            </span>
                                                        )}
                                                    </Text>
                                                    {action.status === 'error' && (
                                                        <Text variant="xs" color="danger" className="mt-1 flex items-center gap-1 font-medium">
                                                            <AlertTriangle size={12} />
                                                            {action.errorMessage}
                                                        </Text>
                                                    )}
                                                </Stack>
                                            </Flex>
                                            
                                            <Flex gap="xs">
                                                {action.status === 'error' && (
                                                    <Button 
                                                        size="sm" 
                                                        variant="soft" 
                                                        color="primary"
                                                        onClick={() => syncManager.retryAction(action.id!)}
                                                        disabled={!isOnline}
                                                    >
                                                        再試行
                                                    </Button>
                                                )}
                                                <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    color="danger"
                                                    className="p-2 h-auto"
                                                    onClick={() => {
                                                        if (window.confirm('この操作を破棄しますか？取り消すことはできません。')) {
                                                            syncManager.discardAction(action.id!);
                                                        }
                                                    }}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </Flex>
                                        </Flex>
                                    </View>
                                </Card>
                            ))}
                        </Stack>
                    )}
                </Stack>
            </Stack>
        </Container>
    );
}
