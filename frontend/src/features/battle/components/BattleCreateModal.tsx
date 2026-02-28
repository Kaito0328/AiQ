"use client";

import React, { useState } from 'react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Flex } from '@/src/design/primitives/Flex';
import { Globe, Lock, Users, Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createMatchRoom } from '../api';
import { View } from '@/src/design/primitives/View';
import { cn } from '@/src/shared/utils/cn';

interface BattleCreateModalProps {
    isOpen: boolean;
    onClose: () => void;
}

type Visibility = 'public' | 'private' | 'followers';

export function BattleCreateModal({ isOpen, onClose }: BattleCreateModalProps) {
    const router = useRouter();
    const [visibility, setVisibility] = useState<Visibility>('public');
    const [loading, setLoading] = useState(false);

    const handleCreate = async () => {
        setLoading(true);
        try {
            const resp = await createMatchRoom({
                collectionIds: [], // Currently empty, but can be expanded later
                filterTypes: [],
                sortKeys: [],
                totalQuestions: 10,
                maxBuzzesPerRound: 2,
                visibility: visibility
            });
            router.push(`/battle/${resp.roomId}?token=${resp.joinToken}`);
            onClose();
        } catch (err) {
            console.error('Failed to create room', err);
            alert('ルームの作成に失敗しました');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="ルームを作成" size="sm">
            <Stack gap="xl" className="py-2">
                <Stack gap="md">
                    <Text variant="xs" weight="bold">公開範囲</Text>
                    <Stack gap="sm">
                        <VisibilityOption
                            icon={<Globe size={18} />}
                            title="公開"
                            description="全ユーザーがロビーから参加できます"
                            selected={visibility === 'public'}
                            onClick={() => setVisibility('public')}
                        />
                        <VisibilityOption
                            icon={<Lock size={18} />}
                            title="非公開"
                            description="URLを知っている人のみ参加できます"
                            selected={visibility === 'private'}
                            onClick={() => setVisibility('private')}
                        />
                        <VisibilityOption
                            icon={<Users size={18} />}
                            title="フォロワー限定"
                            description="あなたがフォローしているユーザーのみ参加できます"
                            selected={visibility === 'followers'}
                            onClick={() => setVisibility('followers')}
                        />
                    </Stack>
                </Stack>

                <Button
                    variant="solid"
                    color="primary"
                    className="w-full gap-2 h-12"
                    onClick={handleCreate}
                    disabled={loading}
                >
                    {loading ? '作成中...' : (
                        <>
                            <Plus size={20} />
                            ルームを作成して開始
                        </>
                    )}
                </Button>
            </Stack>
        </Modal>
    );
}

function VisibilityOption({ icon, title, description, selected, onClick }: any) {
    return (
        <View
            onClick={onClick}
            className={cn(
                "p-3 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-3",
                selected
                    ? "border-brand-primary bg-brand-primary/5 shadow-sm"
                    : "border-surface-muted hover:border-surface-primary bg-surface-base"
            )}
        >
            <View className={cn("mt-0.5", selected ? "text-brand-primary" : "text-secondary")}>
                {icon}
            </View>
            <Stack gap="none">
                <Text weight="bold" color={selected ? "primary" : "default"}>{title}</Text>
                <Text variant="xs" color="secondary" className="leading-tight">{description}</Text>
            </Stack>
        </View>
    );
}
