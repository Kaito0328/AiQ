"use client";

import React, { useState } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { MatchRoom } from '@/src/entities/battle';
import { User, Shield, Users, Play, Copy, Check, Library } from 'lucide-react';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { View } from '@/src/design/primitives/View';
import { cn } from '@/src/shared/utils/cn';
import { FilterCondition, SortCondition } from '@/src/entities/quiz';
import { QuizOptionsModal } from '@/src/features/quiz/components/QuizOptionsModal';
import { CollectionBrowser } from '@/src/features/collections/components/CollectionBrowser';
import { FixedSelectionTray } from '@/src/features/collections/components/FixedSelectionTray';
import { AddToSetModal } from '@/src/features/collectionSets/components/AddToSetModal';

interface BattleLobbyProps {
    room: MatchRoom;
    onStart: () => void;
    isHost: boolean;
    onUpdateConfig: (maxBuzzes: number) => void;
    maxBuzzes: number;
    onResetMatch: (collectionIds: string[], filters: FilterCondition[], sorts: SortCondition[], totalQuestions: number) => void;
    selfId: string | null;
}

export function BattleLobby({ room, onStart, isHost, onUpdateConfig, maxBuzzes, onResetMatch, selfId }: BattleLobbyProps) {
    const [copied, setCopied] = useState(false);
    const [selectedCollections, setSelectedCollections] = useState<{ id: string, name: string, questionCount: number }[]>([]);
    const [appliedCollectionCount, setAppliedCollectionCount] = useState(0);

    // Quiz options state
    const [filters, setFilters] = useState<FilterCondition[]>([]);
    const [sorts, setSorts] = useState<SortCondition[]>([]);
    const [limit, setLimit] = useState(0);
    const [isManualLimit, setIsManualLimit] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    // Add to set state
    const [targetCollectionId, setTargetCollectionId] = useState<string | null>(null);
    const [isAddToSetModalOpen, setIsAddToSetModalOpen] = useState(false);

    const totalQuestions = selectedCollections.reduce((sum, c) => sum + (c.questionCount || 0), 0);

    const qrCodeUrl = typeof window !== 'undefined'
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`
        : '';

    const handleCopy = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(window.location.href);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleToggleCollection = (id: string, name: string, count?: number) => {
        setSelectedCollections(prev => {
            const isRemoving = prev.some(c => c.id === id);
            const next = isRemoving
                ? prev.filter(c => c.id !== id)
                : [...prev, { id, name, questionCount: count || 0 }];

            // Smart Limit: If not manually adjusted, sync with total
            if (!isManualLimit) {
                const newTotal = next.reduce((sum, c) => sum + (c.questionCount || 0), 0);
                setLimit(newTotal);
            }

            return next;
        });
    };

    const handleLimitChange = (newLimit: number) => {
        setLimit(newLimit);
        setIsManualLimit(true);
    };

    const handleOpenAddToSet = (id: string) => {
        setTargetCollectionId(id);
        setIsAddToSetModalOpen(true);
    };

    const handleReset = () => {
        if (selectedCollections.length > 0) {
            onResetMatch(selectedCollections.map(c => c.id), filters, sorts, limit);
            setAppliedCollectionCount(selectedCollections.length);
            setSelectedCollections([]);
            // Reset manual state after applying if desired, or keep it.
            // Let's keep it for now.
        }
    };

    return (
        <Stack gap="xl" className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 参加情報のカード */}
                <Card padding="lg" className="lg:col-span-2 border-2 border-brand-primary/20 shadow-xl overflow-visible relative h-fit">
                    <View className="absolute -top-4 left-6 px-4 py-1 bg-brand-primary text-white text-xs font-bold rounded-full shadow-lg">
                        WAITING FOR PLAYERS
                    </View>

                    <Stack gap="lg">
                        <Flex justify="between" align="center">
                            <Stack gap="none">
                                <Text variant="h3" weight="bold">対戦ロビー</Text>
                                <Text variant="xs" color="secondary">プレイヤーが集まるまでお待ちください</Text>
                            </Stack>
                            <Flex gap="sm" align="center" className="bg-surface-muted px-3 py-1.5 rounded-lg border border-surface-muted">
                                <Text variant="xs" color="secondary" weight="bold">ROOM ID:</Text>
                                <Text variant="xs" weight="bold" className="font-mono">{room.room_id.slice(0, 8)}</Text>
                                <Button size="sm" variant="ghost" className="p-1 h-auto" onClick={handleCopy} title="参加リンクをコピー">
                                    {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                                </Button>
                            </Flex>
                        </Flex>

                        <Stack gap="md">
                            <Flex gap="sm" align="center" className="text-brand-primary">
                                <Users size={18} />
                                <Text variant="detail" weight="bold">参加者 ({room.players.length})</Text>
                            </Flex>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {room.players.map((player) => {
                                    const isMe = player.user_id === selfId;
                                    return (
                                        <View
                                            key={player.user_id}
                                            className={cn(
                                                "p-4 rounded-xl border transition-all flex items-center justify-between group",
                                                isMe ? "border-brand-primary bg-brand-primary/5 shadow-sm" : "border-surface-muted bg-surface-base hover:border-brand-primary/30"
                                            )}
                                        >
                                            <Flex gap="md" align="center">
                                                <View className={cn(
                                                    "p-2 rounded-full",
                                                    isMe ? "bg-brand-primary text-white" : "bg-brand-primary/10 text-brand-primary"
                                                )}>
                                                    {player.user_id === room.host_id ? <Shield size={18} /> : <User size={18} />}
                                                </View>
                                                <Stack gap="none">
                                                    <Text weight="bold" variant="detail">
                                                        {player.username}
                                                        {isMe && " (YOU)"}
                                                    </Text>
                                                    {player.user_id === room.host_id && (
                                                        <Text variant="xs" color="primary" weight="bold">HOST</Text>
                                                    )}
                                                </Stack>
                                            </Flex>
                                            <View className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                        </View>
                                    );
                                })}
                            </div>
                        </Stack>

                        {isHost ? (
                            <>
                                <Button
                                    variant="solid"
                                    color="primary"
                                    size="lg"
                                    className="w-full mt-4 py-6 text-lg shadow-lg shadow-brand-primary/20 gap-2"
                                    onClick={onStart}
                                    disabled={room.players.length < 1 || appliedCollectionCount === 0}
                                >
                                    <Play size={20} fill="currentColor" />
                                    対戦を開始する
                                </Button>
                                {isHost && appliedCollectionCount === 0 && (
                                    <View className="mt-4 p-4 bg-brand-primary/5 border-2 border-dashed border-brand-primary/30 rounded-xl">
                                        <Text variant="xs" color="primary" weight="bold" align="center" className="animate-pulse">
                                            ※下のセレクターから問題集を選んで「適用」してください
                                        </Text>
                                    </View>
                                )}
                            </>
                        ) : (
                            <View className="mt-4 p-4 rounded-xl bg-brand-primary/5 border border-brand-primary/10 flex items-center justify-center gap-3">
                                <Spinner size="sm" />
                                <Text variant="xs" weight="bold" color="primary">ホストの開始を待っています...</Text>
                            </View>
                        )}
                    </Stack>
                </Card>

                <Stack gap="lg" className="h-fit">
                    {/* QRコードカード */}
                    <Card padding="lg" className="border border-surface-muted shadow-lg bg-surface-base">
                        <Stack gap="md" align="center">
                            <Text variant="detail" weight="bold">スマホでスキャンして参加</Text>
                            {qrCodeUrl && (
                                <View className="p-3 bg-white rounded-xl border border-surface-muted shadow-inner">
                                    <img src={qrCodeUrl} alt="QR Code" className="w-40 h-40 md:w-48 md:h-48" />
                                </View>
                            )}
                            <Text variant="xs" color="secondary" className="text-center px-2">
                                スキャンするとすぐに参加画面へ移動できます
                            </Text>
                        </Stack>
                    </Card>

                    {/* 部屋設定 (ホストのみ、サイドバーへ移動) */}
                    {isHost && (
                        <Card padding="lg" className="border border-surface-muted shadow-lg bg-surface-base">
                            <Stack gap="md">
                                <Text variant="xs" color="secondary" weight="bold">1人あたりの回答権数</Text>
                                <Flex gap="sm" align="center" className="flex-wrap">
                                    {[1, 2, 3, 5].map((val) => (
                                        <Button
                                            key={val}
                                            size="sm"
                                            variant={maxBuzzes === val ? "solid" : "outline"}
                                            onClick={() => onUpdateConfig(val)}
                                            className="px-4"
                                        >
                                            {val}回
                                        </Button>
                                    ))}
                                </Flex>
                            </Stack>
                        </Card>
                    )}
                </Stack>
            </div>

            {/* 問題セレクター（ホスト専用、統合表示） */}
            {isHost && (
                <Card padding="none" className="border border-surface-muted shadow-xl overflow-hidden bg-surface-base">
                    <View className="p-6 border-b border-surface-muted bg-surface-muted/10">
                        <Flex gap="md" align="center">
                            <Library className="text-brand-primary" size={24} />
                            <Stack gap="none">
                                <Text variant="h4" weight="bold">クイズ問題集を選択</Text>
                                <Text variant="xs" color="secondary">
                                    {appliedCollectionCount > 0
                                        ? `現在 ${appliedCollectionCount} 件のコレクションが適用されています`
                                        : "対戦で使用するコレクションを選んでください"}
                                </Text>
                            </Stack>
                        </Flex>
                    </View>

                    <View className="p-6 min-h-[500px]">
                        <CollectionBrowser
                            selectedIds={selectedCollections.map(c => c.id)}
                            onToggleCollection={handleToggleCollection}
                            onAddToSet={handleOpenAddToSet}
                        />
                    </View>
                </Card>
            )}

            {/* ボトム固定トレイ (ホスト専用) */}
            {isHost && (
                <>
                    <FixedSelectionTray
                        selectedCollections={selectedCollections}
                        onRemoveCollection={(id) => handleToggleCollection(id, "", 0)}
                        onClearAll={() => {
                            setSelectedCollections([]);
                            if (!isManualLimit) setLimit(0);
                        }}
                        onOpenSettings={() => setIsSettingsOpen(true)}
                        onStart={handleReset}
                        startLabel="適用してリセット"
                        limit={limit}
                    />

                    {/* 設定モーダル */}
                    <QuizOptionsModal
                        isOpen={isSettingsOpen}
                        onClose={() => setIsSettingsOpen(false)}
                        filters={filters}
                        sorts={sorts}
                        limit={limit}
                        maxLimit={totalQuestions > 0 ? totalQuestions : 0}
                        onFilterChange={setFilters}
                        onSortChange={setSorts}
                        onLimitChange={handleLimitChange}
                    />

                    {/* セットに追加モーダル */}
                    {isAddToSetModalOpen && targetCollectionId && (
                        <AddToSetModal
                            collectionId={targetCollectionId}
                            onClose={() => setIsAddToSetModalOpen(false)}
                            onSuccess={() => {
                                setTargetCollectionId(null);
                                setIsAddToSetModalOpen(false);
                            }}
                        />
                    )}
                </>
            )}
        </Stack >
    );
}
