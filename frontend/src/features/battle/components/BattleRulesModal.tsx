"use client";

import React, { useState } from 'react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { View } from '@/src/design/primitives/View';
import { Clock, Award, Zap, XCircle, Trophy, Users } from 'lucide-react';
import { MatchConfig } from '@/src/entities/battle';
import { Slider } from '@/src/design/baseComponents/Slider';
import { Range } from '@/src/design/baseComponents/Range';
import { cn } from '@/src/shared/utils/cn';
import { DEFAULT_CONFIG } from '../hooks/useBattle';

interface BattleRulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    config: MatchConfig;
    onApply: (config: MatchConfig) => void;
    maxPlayers: number;
    maxBuzzes: number;
    onMaxBuzzesChange: (val: number) => void;
    readOnly?: boolean;
}

function RangeRow({
    icon,
    label,
    value,
    unit,
    min,
    max,
    step,
    color,
    onChange,
    readOnly,
}: {
    icon: React.ReactNode;
    label: string;
    value: number;
    unit: string;
    min: number;
    max: number;
    step?: number;
    color?: string;
    onChange: (v: number) => void;
    readOnly?: boolean;
}) {
    return (
        <Stack gap="xs">
            <Flex justify="between" align="center">
                <Flex gap="xs" align="center">
                    {icon}
                    <Text variant="xs" weight="bold" className={color}>{label}</Text>
                </Flex>
                <Flex gap="xs" align="center">
                    <View
                        as="input"
                        type="number"
                        min={min}
                        max={max}
                        step={step ?? 1}
                        value={value}
                        readOnly={readOnly}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                            if (readOnly) return;
                            const v = parseInt(e.target.value);
                            if (!isNaN(v)) onChange(v);
                        }}
                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                            if (readOnly) return;
                            const v = Math.max(min, Math.min(max, parseInt(e.target.value) || min));
                            onChange(v);
                        }}
                        className={cn(
                            "w-16 text-right text-xs font-bold font-mono bg-surface-muted border border-surface-muted rounded-md px-1.5 py-0.5 focus:outline-none focus:border-brand-primary",
                            color,
                            readOnly && "cursor-default opacity-70"
                        )}
                    />
                    <Text variant="xs" color="secondary">{unit}</Text>
                </Flex>
            </Flex>
            <Range
                min={min}
                max={max}
                step={step ?? 1}
                value={value}
                disabled={readOnly}
                onChange={(e) => onChange(parseInt(e.target.value))}
                variant={color === "text-brand-danger" ? "danger" : color === "text-brand-warning" ? "warning" : "primary"}
            />
            <Flex justify="between">
                <Text variant="xs" color="secondary">{min}</Text>
                <Text variant="xs" color="secondary">{max}</Text>
            </Flex>
        </Stack>
    );
}

// Ensure every field is always a defined value (guards against server sending partial config)
function sanitize(c: MatchConfig): MatchConfig {
    return {
        text_timer_s: c.text_timer_s ?? DEFAULT_CONFIG.text_timer_s,
        chips_char_timer_s: c.chips_char_timer_s ?? DEFAULT_CONFIG.chips_char_timer_s,
        choice_timer_s: c.choice_timer_s ?? DEFAULT_CONFIG.choice_timer_s,
        base_score: c.base_score ?? DEFAULT_CONFIG.base_score,
        speed_bonus_max: c.speed_bonus_max ?? DEFAULT_CONFIG.speed_bonus_max,
        penalty: c.penalty ?? DEFAULT_CONFIG.penalty,
        first_wrong_penalty: c.first_wrong_penalty ?? DEFAULT_CONFIG.first_wrong_penalty,
        win_score: c.win_score !== undefined ? c.win_score : DEFAULT_CONFIG.win_score,
        post_round_delay_seconds: c.post_round_delay_seconds ?? DEFAULT_CONFIG.post_round_delay_seconds ?? 5,
    };
}

export function BattleRulesModal({ isOpen, onClose, config, onApply, maxPlayers, maxBuzzes, onMaxBuzzesChange, readOnly }: BattleRulesModalProps) {
    const [draft, setDraft] = useState<MatchConfig>(sanitize(config));
    const [localMaxBuzzes, setLocalMaxBuzzes] = useState(maxBuzzes ?? 1);

    // Sync when modal opens
    React.useEffect(() => {
        if (isOpen) {
            setDraft(sanitize(config));
            setLocalMaxBuzzes(maxBuzzes ?? 1);
        }
    }, [isOpen, config, maxBuzzes]);

    const upd = (updates: Partial<MatchConfig>) => {
        if (readOnly) return;
        setDraft(prev => ({ ...prev, ...updates }));
    };

    const handleApply = () => {
        if (readOnly) return;
        onApply(draft);
        onMaxBuzzesChange(localMaxBuzzes);
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={readOnly ? "対戦形式 (表示のみ)" : "ルール設定"}
            size="md"
            footer={
                <Flex justify="center" gap="sm" className="w-full">
                    {readOnly ? (
                        <Button variant="solid" color="primary" onClick={onClose} className="px-12">
                            閉じる
                        </Button>
                    ) : (
                        <>
                            <Button variant="ghost" onClick={onClose}>キャンセル</Button>
                            <Button variant="solid" color="primary" onClick={handleApply} className="px-8">
                                適用する
                            </Button>
                        </>
                    )}
                </Flex>
            }
        >
            <Stack gap="xl" className="p-6 sm:p-8 pb-10">
                {/* 解答人数 */}
                <Stack gap="sm">
                    <Flex gap="xs" align="center">
                        <Users size={15} className="text-brand-primary" />
                        <Text variant="detail" weight="bold" color="primary">解答人数</Text>
                    </Flex>
                    <Slider
                        label="1問あたりの解答人数"
                        min={1}
                        max={Math.max(1, maxPlayers)}
                        value={localMaxBuzzes}
                        onChange={readOnly ? () => { } : setLocalMaxBuzzes}
                        disabled={readOnly}
                    />
                </Stack>

                <View className="h-px bg-surface-muted/50" />

                {/* スコア設定 */}
                <Stack gap="md">
                    <Flex gap="xs" align="center">
                        <Award size={15} className="text-brand-primary" />
                        <Text variant="detail" weight="bold" color="primary">スコア</Text>
                    </Flex>

                    {/* 勝利ポイント */}
                    <Stack gap="xs">
                        <Flex justify="between" align="center">
                            <Flex gap="xs" align="center">
                                <Trophy size={13} className="text-brand-warning" />
                                <Text variant="xs" weight="bold">勝利ポイント</Text>
                            </Flex>
                            {draft.win_score === null ? (
                                <Text variant="xs" weight="bold" className="font-mono text-secondary">∞ 無制限</Text>
                            ) : (
                                <Flex gap="xs" align="center">
                                    <View
                                        as="input"
                                        type="number"
                                        min={10}
                                        max={500}
                                        step={10}
                                        value={draft.win_score}
                                        readOnly={readOnly}
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                            if (readOnly) return;
                                            const v = parseInt(e.target.value);
                                            if (!isNaN(v)) upd({ win_score: v });
                                        }}
                                        onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
                                            if (readOnly) return;
                                            const v = Math.max(10, Math.min(500, parseInt(e.target.value) || 10));
                                            upd({ win_score: v });
                                        }}
                                        className={cn(
                                            "w-16 text-right text-xs font-bold font-mono bg-surface-muted border border-surface-muted rounded-md px-1.5 py-0.5 focus:outline-none focus:border-brand-primary",
                                            readOnly && "cursor-default opacity-70"
                                        )}
                                    />
                                    <Text variant="xs" color="secondary">pts</Text>
                                </Flex>
                            )}
                        </Flex>
                        <Flex gap="sm" align="center">
                            <Range
                                min={10}
                                max={500}
                                step={10}
                                value={draft.win_score ?? 0}
                                disabled={draft.win_score === null || readOnly}
                                onChange={(e) => upd({ win_score: parseInt(e.target.value) })}
                                variant="warning"
                                className={cn("flex-1", (draft.win_score === null || readOnly) && "opacity-30")}
                            />
                            {!readOnly && (
                                <Button
                                    size="sm"
                                    variant={draft.win_score === null ? "solid" : "outline"}
                                    color={draft.win_score === null ? "primary" : undefined}
                                    onClick={() => upd({ win_score: draft.win_score === null ? 100 : null })}
                                    className="shrink-0 text-[10px] px-2"
                                >
                                    {draft.win_score === null ? "∞ ON" : "無制限"}
                                </Button>
                            )}
                        </Flex>
                        <Flex justify="between">
                            <Text variant="xs" color="secondary">10</Text>
                            <Text variant="xs" color="secondary">500</Text>
                        </Flex>
                        <Text variant="xs" color="secondary" className="px-1">
                            {draft.win_score === null ? "問題が終わるまでゲームが続きます" : `${draft.win_score}ptに到達したプレイヤーが勝者となります`}
                        </Text>
                    </Stack>

                    <RangeRow
                        icon={<Award size={13} className="text-secondary" />}
                        label="基本スコア"
                        value={draft.base_score}
                        unit="pts"
                        min={0} max={100} step={5}
                        onChange={(v) => upd({ base_score: v })}
                        readOnly={readOnly}
                    />
                    <RangeRow
                        icon={<Zap size={13} className="text-brand-warning" />}
                        label="1stボーナス"
                        value={draft.speed_bonus_max}
                        unit="pts"
                        min={0} max={100} step={5}
                        color="text-brand-warning"
                        onChange={(v) => upd({ speed_bonus_max: v })}
                        readOnly={readOnly}
                    />
                    <RangeRow
                        icon={<XCircle size={13} className="text-brand-danger" />}
                        label="誤答ペナルティ"
                        value={draft.penalty}
                        unit="pts"
                        min={0} max={100} step={5}
                        color="text-brand-danger"
                        onChange={(v) => upd({ penalty: v })}
                        readOnly={readOnly}
                    />
                    <RangeRow
                        icon={<XCircle size={13} className="text-brand-danger" />}
                        label="1st追加ペナルティ"
                        value={draft.first_wrong_penalty}
                        unit="pts"
                        min={0} max={100} step={5}
                        color="text-brand-danger"
                        onChange={(v) => upd({ first_wrong_penalty: v })}
                        readOnly={readOnly}
                    />
                </Stack>

                <View className="h-px bg-surface-muted/50" />

                {/* タイマー設定 */}
                <Stack gap="md">
                    <Flex gap="xs" align="center">
                        <Clock size={15} className="text-brand-primary" />
                        <Text variant="detail" weight="bold" color="primary">タイマー</Text>
                    </Flex>
                    <RangeRow
                        icon={<Clock size={13} className="text-secondary" />}
                        label="テキスト回答時間"
                        value={draft.text_timer_s}
                        unit="s"
                        min={5} max={60}
                        onChange={(v) => upd({ text_timer_s: v })}
                        readOnly={readOnly}
                    />
                    <RangeRow
                        icon={<Clock size={13} className="text-secondary" />}
                        label="4択タイマー"
                        value={draft.choice_timer_s}
                        unit="s"
                        min={3} max={30}
                        onChange={(v) => upd({ choice_timer_s: v })}
                        readOnly={readOnly}
                    />
                    <RangeRow
                        icon={<Clock size={13} className="text-secondary" />}
                        label="チップ文字タイマー"
                        value={draft.chips_char_timer_s}
                        unit="s"
                        min={1} max={15}
                        onChange={(v) => upd({ chips_char_timer_s: v })}
                        readOnly={readOnly}
                    />
                    <RangeRow
                        icon={<Clock size={13} className="text-brand-primary" />}
                        label="正解表示時間"
                        value={draft.post_round_delay_seconds}
                        unit="s"
                        min={1} max={10}
                        onChange={(v) => upd({ post_round_delay_seconds: v })}
                        readOnly={readOnly}
                    />
                </Stack>
            </Stack>
        </Modal>
    );
}
