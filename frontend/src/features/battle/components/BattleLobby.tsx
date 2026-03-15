"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Icon } from '@/src/design/baseComponents/Icon';
import { MatchRoom, RoomVisibility, MatchConfig } from '@/src/entities/battle';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { View } from '@/src/design/primitives/View';
import { cn } from '@/src/shared/utils/cn';
import { FilterCondition, SortCondition, QuizMode, SortKey, FilterNode } from '@/src/entities/quiz';
import { QuizOptionsModal } from '@/src/features/quiz/components/QuizOptionsModal';
import { CollectionBrowser } from '@/src/features/collections/components/CollectionBrowser';
import { FixedSelectionTray } from '@/src/features/collections/components/FixedSelectionTray';
import { AddToSetModal } from '@/src/features/collectionSets/components/AddToSetModal';
import { BattleRulesModal } from './BattleRulesModal';
import AppConfig from '@/src/app_config';

interface BattleLobbyProps {
    room: MatchRoom;
    onStart: () => void;
    isHost: boolean;
    onUpdateConfig: (maxBuzzes: number) => void;
    maxBuzzes: number;
    onUpdateVisibility: (visibility: RoomVisibility) => void;
    onResetMatch: (collectionIds: string[], filterNode: FilterNode | undefined, sorts: SortCondition[], totalQuestions: number, preferredMode?: QuizMode, dummyCharCount?: number) => void;
    selfId: string | null;
    config: MatchConfig;
    onUpdateMatchConfig: (config: MatchConfig) => void;
    onLeave: () => void;
}

export function BattleLobby({ room, onStart, isHost, onUpdateConfig, maxBuzzes, onUpdateVisibility, onResetMatch, selfId, config, onUpdateMatchConfig, onLeave }: BattleLobbyProps) {
    const [copied, setCopied] = useState(false);
    const [selectedCollections, setSelectedCollections] = useState<{ id: string, name: string, questionCount: number }[]>([]);
    const [appliedCollectionCount, setAppliedCollectionCount] = useState(0);

    // Quiz options state
    const [filterNode, setFilterNode] = useState<FilterNode | undefined>(undefined);
    const [sorts, setSorts] = useState<SortCondition[]>([{ key: SortKey.RANDOM }]);
    const [limit, setLimit] = useState(30);
    const [isManualLimit, setIsManualLimit] = useState(false);
    const [preferredMode, setPreferredMode] = useState<QuizMode>(room.preferred_mode as QuizMode || 'chips');
    const [dummyCharCount, setDummyCharCount] = useState(room.dummy_char_count || AppConfig.quiz.default_dummy_char_count);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isRulesOpen, setIsRulesOpen] = useState(false);

    // Add to set/UI state
    const [targetCollectionId, setTargetCollectionId] = useState<string | null>(null);
    const [isAddToSetModalOpen, setIsAddToSetModalOpen] = useState(false);
    const [hasManuallyChangedBuzz, setHasManuallyChangedBuzz] = useState(false);

    // Auto-adjust maxBuzzes based on player count until manual change
    useEffect(() => {
        if (!hasManuallyChangedBuzz && isHost && room.players.length > 0) {
            const defaultBuzzes = Math.max(1, Math.floor(room.players.length / 2));
            if (maxBuzzes !== defaultBuzzes) {
                onUpdateConfig(defaultBuzzes);
            }
        }
    }, [room.players.length, hasManuallyChangedBuzz, isHost, maxBuzzes, onUpdateConfig]);

    const totalQuestions = selectedCollections.reduce((sum, c) => sum + (c.questionCount || 0), 0);

    const qrCodeUrl = typeof window !== 'undefined'
        ? `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(window.location.href)}`
        : '';

    const handleCopy = () => {
        if (typeof window !== 'undefined') {
            navigator.clipboard.writeText(room.room_id);
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

            // Smart Limit: If not manually adjusted, sync with total (capped at 30)
            if (!isManualLimit) {
                const newTotal = next.reduce((sum, c) => sum + (c.questionCount || 0), 0);
                setLimit(newTotal > 30 ? 30 : newTotal);
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

    const handleClearAll = () => {
        setSelectedCollections([]);
        setLimit(0);
        setIsManualLimit(false);
    };

    const handleReset = () => {
        if (selectedCollections.length > 0) {
            onResetMatch(selectedCollections.map(c => c.id), filterNode, sorts, limit, preferredMode, dummyCharCount);
            setAppliedCollectionCount(selectedCollections.length);
            setSelectedCollections([]);
            // Reset manual state after applying if desired, or keep it.
            // Let's keep it for now.
        }
    };

    return (
        <Stack gap="lg" className="w-full max-w-5xl mx-auto pb-80 animate-in fade-in slide-in-from-bottom-4 duration-500 relative">

            <View className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
                {/* 参加情報のカード */}
                <Card padding="lg" border="primary" className="lg:col-span-2 shadow-xl overflow-visible relative h-fit">
                    <View className="absolute -top-4 left-6 px-4 py-1 bg-brand-primary text-white text-xs font-bold rounded-full shadow-lg">
                        WAITING FOR PLAYERS
                    </View>

                    <Stack gap="lg">
                        <Flex justify="between" align="start">
                            <Stack gap="none" className="w-full">
                                <Flex align="center" justify="between" className="w-full">
                                    <Text variant="h3" weight="bold">対戦ロビー</Text>
                                    <Flex gap="sm" align="center" className="bg-surface-muted px-2 py-1 rounded-lg border border-surface-muted ml-auto">
                                        <Text variant="xs" color="secondary" weight="bold">ID:</Text>
                                        <Text variant="xs" weight="bold" className="font-mono">{room.room_id.slice(0, 8)}</Text>
                                        <Button size="sm" variant="ghost" className="p-1 h-auto" onClick={handleCopy} title="参加リンクをコピー">
                                            {copied ? <Icon name="check" size={14} className="text-green-500" /> : <Icon name="copy" size={14} />}
                                        </Button>
                                    </Flex>
                                </Flex>
                                <Text variant="xs" color="secondary" className="mt-1">プレイヤーが集まるまでお待ちください</Text>
                            </Stack>
                        </Flex>

                        <Stack gap="xs">
                            <Flex gap="sm" align="center" className="text-brand-primary">
                                <Icon name="users" size={18} />
                                <Text variant="detail" weight="bold">参加者 ({room.players.length})</Text>
                            </Flex>

                            <Flex className="gap-3 sm:gap-4 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1 whitespace-nowrap">
                                {room.players.map((player) => {
                                    const isMe = player.user_id === selfId;
                                    const isHost = player.user_id === room.host_id;
                                    return (
                                        <Stack
                                            key={player.user_id}
                                            gap="xs"
                                            className="items-center justify-start shrink-0 w-14 sm:w-16"
                                        >
                                            <View className="relative">
                                                <View className={cn(
                                                    "w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center overflow-hidden border-[3px]",
                                                    isMe ? "border-brand-primary bg-brand-primary text-white shadow-md shadow-brand-primary/20" : "border-surface-muted bg-surface-muted text-secondary"
                                                )}>
                                                    {(player as any).icon_url ? (
                                                        <View as="img" src={(player as any).icon_url} alt={player.username} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Icon name="user" size={18} className={isMe ? "text-white" : "text-secondary"} />
                                                    )}
                                                </View>
                                            </View>
                                            <Stack gap="none" className="items-center">
                                                <Text weight="bold" variant="xs" className="text-[10px] sm:text-[11px] max-w-full truncate text-center px-0.5">
                                                    {player.username}
                                                </Text>
                                                {isHost && (
                                                    <Text variant="xs" weight="bold" className="text-[8px] bg-amber-400 text-white px-1.5 rounded-full mt-0.5 uppercase tracking-tighter">
                                                        HOST
                                                    </Text>
                                                )}
                                            </Stack>
                                        </Stack>
                                    );
                                })}
                            </Flex>
                        </Stack>

                        <Stack gap="md" className="mt-2 pt-4 border-t border-surface-muted/50">
                            {/* ルームの公開設定 */}
                            <Stack gap="sm">
                                <Text variant="detail" weight="bold">ルームの公開設定</Text>
                                <Flex wrap gap="xs">
                                    <VisibilityButton
                                        icon={<Icon name="lock" size={16} />}
                                        title="非公開"
                                        selected={room.visibility === 'private'}
                                        onClick={isHost ? () => onUpdateVisibility('private') : undefined}
                                    />
                                    <VisibilityButton
                                        icon={<Icon name="users" size={16} />}
                                        title="フォロワー限定"
                                        selected={room.visibility === 'followers'}
                                        onClick={isHost ? () => onUpdateVisibility('followers') : undefined}
                                    />
                                    <VisibilityButton
                                        icon={<Icon name="globe" size={16} />}
                                        title="公開"
                                        selected={room.visibility === 'public'}
                                        onClick={isHost ? () => onUpdateVisibility('public') : undefined}
                                    />
                                </Flex>
                                <Text variant="xs" color="secondary" className="px-1 leading-tight">
                                    {!isHost && <span className="text-brand-primary/60 mr-1">[ホストのみ変更可能]</span>}
                                    {room.visibility === 'private' && "リンクを知っている人のみ参加可能です（デフォルト）"}
                                    {room.visibility === 'followers' && "フォロワーのみ参加可能です"}
                                    {room.visibility === 'public' && "全ユーザーがロビーから参加可能です"}
                                </Text>
                            </Stack>

                            {/* ルール設定 */}
                            <Stack gap="sm">
                                <Text variant="detail" weight="bold">ルール設定</Text>
                                <Flex gap="sm" className="flex-wrap">
                                    <Button size="sm" variant="outline" onClick={() => setIsSettingsOpen(true)}>
                                        <Icon name="settings" size={14} className="mr-1" />
                                        出題設定 {!isHost && "(表示のみ)"}
                                    </Button>
                                    <Button size="sm" variant="outline" onClick={() => setIsRulesOpen(true)}>
                                        <Icon name="settings" size={14} className="mr-1" />
                                        対戦形式 {!isHost && "(表示のみ)"}
                                    </Button>
                                </Flex>
                            </Stack>
                        </Stack>

                        {!isHost && (
                            <View border="primary" className="mt-4 p-4 rounded-xl bg-brand-primary/5 flex items-center justify-center gap-3">
                                <Spinner size="sm" />
                                <Text variant="xs" weight="bold" color="primary">ホストの開始を待っています...</Text>
                            </View>
                        )}
                    </Stack>
                </Card >

                <Stack gap="md" className="h-fit">
                    {/* QRコードカード */}
                    <Card padding="md" border="base" className="shadow-lg bg-surface-base">
                        <Stack gap="sm" align="center">
                            <Text variant="xs" weight="bold" color="secondary" className="uppercase tracking-widest opacity-60">スマホでスキャンして参加</Text>
                            {qrCodeUrl && (
                                <View className="p-2 bg-white rounded-xl border border-surface-muted shadow-inner">
                                    <View as="img" src={qrCodeUrl} alt="QR Code" className="w-24 h-24 sm:w-32 sm:h-32" />
                                </View>
                            )}
                        </Stack>
                    </Card>
                </Stack>
            </View >

            {/* 問題セレクター（ホスト専用、統合表示） */}
            {
                isHost && (
                    <Card padding="none" border="base" className="shadow-xl overflow-hidden bg-surface-base mt-[-12px] sm:mt-0">
                        <View className="p-4 border-b border-surface-muted bg-surface-muted/10">
                            <Flex gap="md" align="center">
                                <Icon name="collection" className="text-brand-primary" size={20} />
                                <Stack gap="none">
                                    <Text variant="detail" weight="bold">クイズ問題集を選択</Text>
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
                )
            }

            {/* ボトム固定トレイ (ホスト専用) */}
            {
                isHost && (
                    <>
                        <FixedSelectionTray
                            selectedCollections={selectedCollections}
                            onRemoveCollection={(id) => handleToggleCollection(id, "", 0)}
                            onClearAll={handleClearAll}
                            onStart={() => {
                                // First send reset with selection, then start
                                onResetMatch(selectedCollections.map(c => c.id), filterNode, sorts, limit, preferredMode, dummyCharCount);
                                // We don't clear selectedCollections immediately to allow the backend to process
                                // and to keep UI consistent until transition
                                setAppliedCollectionCount(selectedCollections.length);
                                onStart();
                            }}
                            startLabel="クイズを開始"
                            limit={limit}
                            maxLimit={totalQuestions > 0 ? totalQuestions : 0}
                            onLimitChange={handleLimitChange}
                        />

                        {/* 設定モーダル */}
                        <QuizOptionsModal
                            isOpen={isSettingsOpen}
                            onClose={() => setIsSettingsOpen(false)}
                            filterNode={filterNode}
                            sorts={sorts}
                            limit={limit}
                            maxLimit={totalQuestions > 0 ? totalQuestions : 0}
                            onFilterNodeChange={setFilterNode}
                            onSortChange={setSorts}
                            onLimitChange={handleLimitChange}
                            preferredMode={preferredMode}
                            onModeChange={setPreferredMode}
                            dummyCharCount={dummyCharCount}
                            onDummyCountChange={setDummyCharCount}
                            matchConfig={config}
                            onMatchConfigChange={onUpdateMatchConfig}
                            hideFuzzy
                            hideMatchConfig
                            hideLimit
                            readOnly={!isHost}
                            onStart={() => {
                                onResetMatch(selectedCollections.map(c => c.id), filterNode, sorts, limit, preferredMode, dummyCharCount);
                                setIsSettingsOpen(false);
                            }}
                        />

                        {/* ルール設定モーダル */}
                        <BattleRulesModal
                            isOpen={isRulesOpen}
                            onClose={() => setIsRulesOpen(false)}
                            config={config}
                            onApply={onUpdateMatchConfig}
                            maxPlayers={room.players.length}
                            maxBuzzes={maxBuzzes}
                            onMaxBuzzesChange={(val) => {
                                setHasManuallyChangedBuzz(true);
                                onUpdateConfig(val);
                            }}
                            readOnly={!isHost}
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
                )
            }
        </Stack >
    );
}

function VisibilityButton({ icon, title, selected, onClick }: any) {
    return (
        <View
            onClick={onClick}
            className={cn(
                "p-2.5 rounded-xl border-2 transition-all flex items-center gap-2",
                selected
                    ? "border-brand-primary bg-brand-primary/5 text-brand-primary"
                    : "border-surface-muted hover:border-surface-primary bg-surface-base text-secondary",
                !onClick ? "cursor-default opacity-80" : "cursor-pointer"
            )}
        >
            {icon}
            <Text weight="bold" variant="xs" color="inherit">{title}</Text>
        </View>
    );
}
