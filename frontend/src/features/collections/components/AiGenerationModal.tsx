"use client";

import React, { useState } from 'react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { TextArea } from '@/src/design/baseComponents/TextArea';
import { Input } from '@/src/design/baseComponents/Input';
import { Range } from '@/src/design/baseComponents/Range';
import { Flex } from '@/src/design/primitives/Flex';
import { View } from '@/src/design/primitives/View';
import { Select } from '@/src/design/baseComponents/Select';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { FormField } from '@/src/design/baseComponents/FormField';
import { Sparkles, CheckCircle, AlertCircle, FileText, FileUp, X, Upload } from 'lucide-react';
import { useAiGeneration } from '../hooks/useAiGeneration';
import { useToast } from '@/src/shared/contexts/ToastContext';
import { cn } from '@/src/shared/utils/cn';

interface AiGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: string;
    onSuccess: () => void;
    initialPrompt?: string;
    initialCount?: number;
}

export function AiGenerationModal({ isOpen, onClose, collectionId, onSuccess, initialPrompt, initialCount }: AiGenerationModalProps) {
    const [prompt, setPrompt] = useState(initialPrompt || '');
    const [count, setCount] = useState(initialCount || 5);
    const [explanationLanguage, setExplanationLanguage] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);
    const [questionFormat, setQuestionFormat] = useState('');
    const [answerFormat, setAnswerFormat] = useState('');
    const [exampleQuestion, setExampleQuestion] = useState('');
    const [exampleAnswer, setExampleAnswer] = useState('');

    const { showToast } = useToast();
    const { generate, reset, status, message, generatedQuestions } = useAiGeneration(collectionId);

    React.useEffect(() => {
        if (isOpen) {
            if (initialPrompt !== undefined) setPrompt(initialPrompt);
            if (initialCount !== undefined) setCount(initialCount);
        }
    }, [isOpen, initialPrompt, initialCount]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setPdfFile(selectedFile);
            const reader = new FileReader();
            reader.readAsDataURL(selectedFile);
            reader.onload = () => {
                const base64 = reader.result as string;
                setPdfBase64(base64.split(',')[1]);
            };
        } else if (selectedFile) {
            showToast({ message: 'PDFファイルを選択してください', variant: 'warning' });
        }
    };

    const handleGenerate = () => {
        if (!prompt.trim() && !pdfFile) {
            showToast({ message: 'トピック、指示、またはPDFを入力してください', variant: 'warning' });
            return;
        }
        generate({
            prompt,
            count,
            pdfData: pdfBase64 || undefined,
            questionFormat: questionFormat || undefined,
            answerFormat: answerFormat || undefined,
            exampleQuestion: exampleQuestion || undefined,
            exampleAnswer: exampleAnswer || undefined,
            explanationLanguage: explanationLanguage || undefined
        });
    };

    const handleClose = () => {
        reset();
        onClose();
        if (status === 'completed') {
            onSuccess();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="AIで問題作成"
            size="lg"
        >
            <Stack gap="xl">
                {status === 'idle' ? (
                    <>
                        <Stack gap="sm">
                            <Text weight="bold" variant="xs">トピック・指示</Text>
                            <TextArea
                                placeholder="例: 日本の地理についての中学生レベルの問題を作って / 以下の文章から問題を5問作成して：..."
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                            />
                        </Stack>

                        <Stack gap="md">
                            <Flex gap="lg" className="flex-col sm:flex-row">
                                <Stack gap="xs" className="flex-1">
                                    <Text variant="xs" weight="bold">PDFから生成 (任意)</Text>
                                    <View
                                        className={cn(
                                            "relative border-2 border-dashed rounded-xl p-4 transition-all hover:bg-surface-muted/50 flex flex-col items-center justify-center gap-2 cursor-pointer",
                                            pdfFile ? "border-brand-primary bg-brand-primary/5" : "border-surface-muted/50"
                                        )}
                                        onClick={() => document.getElementById('pdf-modal-upload')?.click()}
                                    >
                                        <input
                                            id="pdf-modal-upload"
                                            type="file"
                                            accept=".pdf"
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        {pdfFile ? (
                                            <Flex align="center" gap="sm">
                                                <FileText size={24} className="text-brand-primary" />
                                                <Text variant="xs" weight="bold" className="truncate max-w-[150px]">{pdfFile.name}</Text>
                                                <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setPdfFile(null); setPdfBase64(null); }} className="p-1 h-auto">
                                                    <X size={14} />
                                                </Button>
                                            </Flex>
                                        ) : (
                                            <Flex align="center" gap="sm">
                                                <Upload size={20} className="text-secondary" />
                                                <Text variant="xs">PDFをアップロード</Text>
                                            </Flex>
                                        )}
                                    </View>
                                </Stack>
                                <Stack gap="xs" className="flex-1">
                                    <Text weight="bold" variant="xs">問題数 (1〜50)</Text>
                                    <Flex gap="md" align="center" className="h-10">
                                        <Range
                                            min={1}
                                            max={50}
                                            value={count}
                                            onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                                            className="flex-1"
                                        />
                                        <Input
                                            type="number"
                                            min={1}
                                            max={50}
                                            value={count}
                                            onChange={(e) => setCount(Math.max(1, Math.min(50, parseInt(e.target.value) || 1)))}
                                            className="w-16 h-9 text-center text-sm border-brand-primary/10 bg-surface-card"
                                        />
                                    </Flex>
                                </Stack>
                            </Flex>

                            <Flex gap="lg" className="flex-col sm:flex-row">
                                <View className="flex-1">
                                    <FormField label="問題の形式">
                                        <Input
                                            placeholder="例：日本語、記述式、4択..."
                                            value={questionFormat}
                                            onChange={(e) => setQuestionFormat(e.target.value)}
                                            className="h-10 text-sm"
                                        />
                                    </FormField>
                                </View>
                                <View className="flex-1">
                                    <FormField label="回答の形式">
                                        <Input
                                            placeholder="例：英単語、一言で、A/B..."
                                            value={answerFormat}
                                            onChange={(e) => setAnswerFormat(e.target.value)}
                                            className="h-10 text-sm"
                                        />
                                    </FormField>
                                </View>
                            </Flex>

                            <Flex gap="lg" className="flex-col sm:flex-row">
                                <View className="flex-1">
                                    <FormField label="問題の例">
                                        <Input
                                            placeholder="例：The capital of Japan is..."
                                            value={exampleQuestion}
                                            onChange={(e) => setExampleQuestion(e.target.value)}
                                            className="h-10 text-sm"
                                        />
                                    </FormField>
                                </View>
                                <View className="flex-1">
                                    <FormField label="解答の例">
                                        <Input
                                            placeholder="例：Tokyo"
                                            value={exampleAnswer}
                                            onChange={(e) => setExampleAnswer(e.target.value)}
                                            className="h-10 text-sm"
                                        />
                                    </FormField>
                                </View>
                            </Flex>

                            <Stack gap="xs">
                                <Text weight="bold" variant="xs">解説の言語</Text>
                                <Select
                                    value={explanationLanguage}
                                    onChange={(e) => setExplanationLanguage(e.target.value)}
                                    className="h-10"
                                >
                                    <option value="">自動（推測）</option>
                                    <option value="日本語">日本語</option>
                                    <option value="英語">英語</option>
                                </Select>
                            </Stack>
                        </Stack>

                        <Flex justify="end" gap="sm">
                            <Button variant="ghost" onClick={onClose}>
                                キャンセル
                            </Button>
                            <Button variant="solid" onClick={handleGenerate}>
                                <Flex as="span" gap="xs" align="center">
                                    <Sparkles size={18} />
                                    生成を開始
                                </Flex>
                            </Button>
                        </Flex>
                    </>
                ) : (
                    <View padding="xl">
                        <Stack gap="lg" align="center" className="w-full">
                            {status === 'processing' || status === 'saving' ? (
                                <>
                                    <Spinner size="xl" variant="primary" />
                                    <Stack gap="xs" align="center">
                                        <Text weight="bold" variant="body">{message}</Text>
                                        <Text variant="xs" color="secondary">これには数十秒かかる場合があります...</Text>
                                    </Stack>
                                </>
                            ) : status === 'completed' ? (
                                <>
                                    <Text color="success" span><CheckCircle size={48} /></Text>
                                    <Stack gap="md" className="w-full">
                                        <Stack gap="xs" align="center">
                                            <Text weight="bold" variant="body">生成が完了しました！</Text>
                                            <Text variant="xs" color="secondary">{generatedQuestions.length}問の問題を追加しました。</Text>
                                        </Stack>
                                        <Button variant="solid" onClick={handleClose} fullWidth>
                                            閉じる
                                        </Button>
                                    </Stack>
                                </>
                            ) : (
                                <>
                                    <Text color="danger" span><AlertCircle size={48} /></Text>
                                    <Stack gap="md" className="w-full">
                                        <Stack gap="xs" align="center">
                                            <Text weight="bold" variant="body">エラーが発生しました</Text>
                                            <Text variant="xs" color="secondary">{message}</Text>
                                        </Stack>
                                        <Button variant="outline" onClick={reset} fullWidth>
                                            やり直す
                                        </Button>
                                    </Stack>
                                </>
                            )}
                        </Stack>
                    </View>
                )
                }
            </Stack >
        </Modal >
    );
}
