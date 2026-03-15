import React, { useState } from 'react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { Select } from '@/src/design/baseComponents/Select';
import { Checkbox } from '@/src/design/baseComponents/Checkbox';
import { FormField } from '@/src/design/baseComponents/FormField';
import { Sparkles } from 'lucide-react';

interface AiSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (settings: {
        questionFormat: string;
        answerFormat: string;
        explanationLanguage: string;
        shouldCompleteDescription: boolean;
    }) => void;
    initialSettings: {
        questionFormat: string;
        answerFormat: string;
        explanationLanguage: string;
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
    const [explanationLanguage, setExplanationLanguage] = useState(initialSettings.explanationLanguage);
    const [shouldCompleteDescription, setShouldCompleteDescription] = useState(initialSettings.shouldCompleteDescription);

    const handleConfirm = () => {
        onConfirm({
            questionFormat,
            answerFormat,
            explanationLanguage,
            shouldCompleteDescription
        });
        onClose();
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="AI補完の設定"
            size="md"
            footer={
                <Flex justify="end" gap="sm" className="w-full">
                    <Button variant="ghost" onClick={onClose} className="px-6">
                        キャンセル
                    </Button>
                    <Button
                        variant="solid"
                        color="primary"
                        onClick={handleConfirm}
                        className="gap-2 px-6"
                    >
                        <Sparkles size={16} />
                        設定を適用して補完
                    </Button>
                </Flex>
            }
        >
            <Stack gap="xl">
                <Text variant="detail" color="secondary">
                    AIが空欄を補完する際の形式や条件を指定してください。
                </Text>

                <Stack gap="lg">
                    <FormField label="問題の形式">
                        <Input
                            value={questionFormat}
                            onChange={(e) => setQuestionFormat(e.target.value)}
                            placeholder="例: 日本語の短い単語、歴史上の出来事など"
                        />
                    </FormField>

                    <FormField label="解説の言語">
                        <Select
                            value={explanationLanguage}
                            onChange={(e) => setExplanationLanguage(e.target.value)}
                        >
                            <option value="">自動（推測）</option>
                            <option value="日本語">日本語</option>
                            <option value="英語">英語</option>
                        </Select>
                    </FormField>

                    <View as="label" padding="md" rounded="lg" border="base" className="bg-surface-muted/30 cursor-pointer group block">
                        <Flex align="center" gap="sm">
                            <Checkbox
                                checked={shouldCompleteDescription}
                                onChange={(e) => setShouldCompleteDescription(e.target.checked)}
                            />
                            <Text variant="xs" weight="medium" className="cursor-pointer">
                                解説も自動生成する
                            </Text>
                        </Flex>
                    </View>
                </Stack>
            </Stack>
        </Modal>
    );
}
