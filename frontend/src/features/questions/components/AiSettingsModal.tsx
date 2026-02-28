import React, { useState } from 'react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { Sparkles, X } from 'lucide-react';

interface AiSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (settings: {
        questionFormat: string;
        answerFormat: string;
        shouldCompleteDescription: boolean;
    }) => void;
    initialSettings: {
        questionFormat: string;
        answerFormat: string;
        shouldCompleteDescription: boolean;
    };
}

export function AiSettingsModal({
    isOpen,
    onClose,
    onConfirm,
    initialSettings
}: AiSettingsModalProps) {
    const [questionFormat, setQuestionFormat] = useState(initialSettings.questionFormat);
    const [answerFormat, setAnswerFormat] = useState(initialSettings.answerFormat);
    const [shouldCompleteDescription, setShouldCompleteDescription] = useState(initialSettings.shouldCompleteDescription);

    const handleConfirm = () => {
        onConfirm({
            questionFormat,
            answerFormat,
            shouldCompleteDescription
        });
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="AI補完の設定" size="md">
            <Stack gap="xl" className="p-1">
                <Text variant="detail" color="secondary">
                    AIが空欄を補完する際の形式や条件を指定してください。
                </Text>

                <Stack gap="lg">
                    <Stack gap="xs">
                        <Text variant="detail" weight="bold">問題の形式</Text>
                        <Input
                            value={questionFormat}
                            onChange={(e) => setQuestionFormat(e.target.value)}
                            placeholder="例: 日本語の短い単語、歴史上の出来事など"
                        />
                    </Stack>

                    <Stack gap="xs">
                        <Text variant="detail" weight="bold">解答の形式</Text>
                        <Input
                            value={answerFormat}
                            onChange={(e) => setAnswerFormat(e.target.value)}
                            placeholder="例: 英語、西暦、人物名など"
                        />
                    </Stack>

                    <Flex align="center" gap="sm" className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <input
                            type="checkbox"
                            id="modal-complete-desc"
                            checked={shouldCompleteDescription}
                            onChange={(e) => setShouldCompleteDescription(e.target.checked)}
                            className="w-5 h-5 accent-brand-primary cursor-pointer"
                        />
                        <label htmlFor="modal-complete-desc" className="text-sm font-medium text-foreground cursor-pointer">
                            解説も自動生成する
                        </label>
                    </Flex>
                </Stack>

                <Flex justify="end" gap="sm" className="mt-4">
                    <Button variant="ghost" onClick={onClose} className="px-6">
                        キャンセル
                    </Button>
                    <Button
                        variant="solid"
                        color="primary"
                        onClick={handleConfirm}
                        className="px-6 gap-2"
                    >
                        <Sparkles size={16} />
                        設定を適用して補完
                    </Button>
                </Flex>
            </Stack>
        </Modal>
    );
}
