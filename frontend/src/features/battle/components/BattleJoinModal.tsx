"use client";

import React, { useState } from 'react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { LogIn, Swords } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { View } from '@/src/design/primitives/View';

interface BattleJoinModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function BattleJoinModal({ isOpen, onClose }: BattleJoinModalProps) {
    const router = useRouter();
    const [roomId, setRoomId] = useState('');

    const handleJoin = () => {
        if (!roomId.trim()) return;
        // 入室時は参加用ページへ遷移。トークンがない場合はフロントエンドでエラー表示されるか、
        // 公開ルームならそのまま入れる想定（バックエンドの実装に依存）
        router.push(`/battle/${roomId.trim()}`);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="対戦に参加" size="sm">
            <Stack gap="lg" className="py-2">
                <Stack gap="sm">
                    <Text variant="xs" weight="bold">ルームIDを入力</Text>
                    <Input
                        placeholder="例: room-123..."
                        value={roomId}
                        onChange={(e) => setRoomId(e.target.value)}
                        autoFocus
                    />
                    <Text variant="xs" color="muted">招待されたルームのIDを入力してください。</Text>
                </Stack>
                <Button
                    variant="solid"
                    color="primary"
                    className="w-full gap-2"
                    onClick={handleJoin}
                    disabled={!roomId.trim()}
                >
                    <LogIn size={18} />
                    参加する
                </Button>

                <View className="border-t border-surface-muted pt-4">
                    <Button
                        variant="ghost"
                        color="secondary"
                        className="w-full gap-2 text-brand-primary hover:bg-brand-primary/10"
                        onClick={() => {
                            router.push('/battle/lobby');
                            onClose();
                        }}
                    >
                        <Swords size={18} />
                        公開ルームを探す
                    </Button>
                </View>
            </Stack>
        </Modal>
    );
}
