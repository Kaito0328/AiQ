"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { View } from '@/src/design/primitives/View';
import { Range } from '@/src/design/baseComponents/Range';
import {
    Sparkles,
    Settings,
    Loader2,
    CheckCircle,
    AlertCircle,
    FileText,
    X,
    ChevronDown,
    ChevronUp,
    Upload
} from 'lucide-react';
import { useAiGeneration } from '../hooks/useAiGeneration';
import { useToast } from '@/src/shared/contexts/ToastContext';
import { cn } from '@/src/shared/utils/cn';

interface AiQuickBarProps {
    collectionId: string;
    onSuccess: () => void;
}

export function AiQuickBar({ collectionId, onSuccess }: AiQuickBarProps) {
    const [prompt, setPrompt] = useState('');
    const [count, setCount] = useState(5);
    const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
    const [questionFormat, setQuestionFormat] = useState('');
    const [answerFormat, setAnswerFormat] = useState('');
    const [exampleQuestion, setExampleQuestion] = useState('');
    const [exampleAnswer, setExampleAnswer] = useState('');
    const [pdfFile, setPdfFile] = useState<File | null>(null);
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);

    const { showToast } = useToast();
    const { generate, status, message, reset } = useAiGeneration(collectionId);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = useCallback((file: File) => {
        if (file.type !== 'application/pdf') {
            showToast({ message: 'PDFファイルのみアップロード可能です', variant: 'danger' });
            return;
        }
        setPdfFile(file);
        const reader = new FileReader();
        reader.onload = (e) => {
            const base64 = e.target?.result?.toString().split(',')[1];
            setPdfBase64(base64 || null);
        };
        reader.readAsDataURL(file);
    }, [showToast]);

    const handleGenerate = () => {
        if (!prompt.trim() && !pdfFile) {
            showToast({ message: '指示を入力するか、PDFを添付してください', variant: 'warning' });
            return;
        }
        generate({
            prompt,
            count,
            pdf_data: pdfBase64 || undefined,
            question_format: questionFormat || undefined,
            answer_format: answerFormat || undefined,
            example_question: exampleQuestion || undefined,
            example_answer: exampleAnswer || undefined
        });
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileChange(file);
    }, [handleFileChange]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    React.useEffect(() => {
        if (status === 'completed') {
            showToast({ message: '問題を生成して追加しました！', variant: 'success' });
            setPrompt('');
            setPdfFile(null);
            setPdfBase64(null);
            onSuccess();
            const timer = setTimeout(() => reset(), 3000);
            return () => clearTimeout(timer);
        }
    }, [status, onSuccess, showToast, reset]);

    const isProcessing = status === 'processing' || status === 'saving';

    return (
        <Card
            className={cn(
                "border transition-all duration-200 shadow-sm overflow-hidden",
                isDragging ? "border-brand-primary bg-brand-primary/5 ring-2 ring-brand-primary/20" : "border-brand-primary/20"
            )}
            padding="md"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
        >
            <Stack gap="md">
                <Flex gap="sm" align="start" className="flex-col sm:flex-row">
                    <Stack gap="sm" className="flex-1 w-full">
                        <View className="relative">
                            <Input
                                placeholder={isDragging ? "ここにPDFをドロップ" : "AIへの指示（例：中学レベルの英単語...）"}
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={isProcessing}
                                className="pr-10 h-11 text-sm sm:h-12 sm:text-base border-brand-primary/10 focus:border-brand-primary/30"
                            />
                            <View className="absolute right-3 top-1/2 -translate-y-1/2">
                                {isProcessing ? (
                                    <Loader2 size={18} className="text-brand-primary animate-spin" />
                                ) : (
                                    <Sparkles size={18} className={cn("text-brand-primary/30", prompt && "text-brand-primary animate-pulse")} />
                                )}
                            </View>
                        </View>

                        {pdfFile && (
                            <Flex align="center" gap="xs" className="bg-brand-primary/10 px-2 py-1 rounded-full w-fit max-w-full">
                                <FileText size={12} className="text-brand-primary shrink-0" />
                                <Text variant="xs" weight="medium" className="truncate text-brand-primary max-w-[150px] sm:max-w-[300px]">
                                    {pdfFile.name}
                                </Text>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => { setPdfFile(null); setPdfBase64(null); }}
                                    className="p-0 h-auto text-brand-primary hover:text-brand-danger"
                                >
                                    <X size={12} />
                                </Button>
                            </Flex>
                        )}
                    </Stack>

                    <Button
                        variant="solid"
                        color="primary"
                        onClick={handleGenerate}
                        disabled={isProcessing || (!prompt.trim() && !pdfFile)}
                        loading={isProcessing}
                        className="h-11 sm:h-12 px-6 sm:px-8 gap-2 w-full sm:w-auto shrink-0 shadow-lg shadow-brand-primary/20 font-bold"
                    >
                        {!isProcessing && <Sparkles size={18} />}
                        生成開始
                    </Button>
                </Flex>

                <View className="border-t border-brand-primary/5 pt-3">
                    <Flex justify="between" align="center" className="flex-wrap gap-y-4">
                        <Flex gap="md" align="center" className="flex-wrap">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
                                className={cn(
                                    "gap-1.5 h-8 px-2 rounded-lg transition-colors",
                                    isAdvancedOpen ? "bg-brand-primary/10 text-brand-primary" : "text-foreground/60 hover:text-brand-primary"
                                )}
                            >
                                <Settings size={14} />
                                <Text variant="xs" weight="bold">詳細設定・PDF</Text>
                                {isAdvancedOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                            </Button>

                            {/* Question Count (Desktop only) */}
                            <Flex gap="sm" align="center" className="hidden sm:flex ml-2 pl-4 border-l border-brand-primary/10">
                                <Text variant="xs" color="secondary" weight="medium" className="shrink-0">問題数:</Text>
                                <View className="w-32 md:w-40">
                                    <Range
                                        min={1}
                                        max={100}
                                        value={count}
                                        onChange={(e) => setCount(parseInt(e.target.value))}
                                        disabled={isProcessing}
                                        className="w-full"
                                    />
                                </View>
                                <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    value={count}
                                    onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                                    disabled={isProcessing}
                                    className="w-14 h-7 text-center text-xs px-1 border-brand-primary/10"
                                />
                            </Flex>

                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept="application/pdf"
                                onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                            />
                        </Flex>

                        {status !== 'idle' && (
                            <Flex gap="sm" align="center" className="bg-surface-muted/50 px-3 py-1 rounded-lg border border-brand-primary/5">
                                {status === 'error' ? (
                                    <>
                                        <AlertCircle size={14} className="text-brand-danger" />
                                        <Text variant="xs" color="danger" weight="medium">{message}</Text>
                                        <Button variant="ghost" size="sm" onClick={reset} className="text-brand-danger underline h-auto p-0 ml-1 text-xs">リセット</Button>
                                    </>
                                ) : status === 'completed' ? (
                                    <>
                                        <CheckCircle size={14} className="text-green-500" />
                                        <Text variant="xs" className="text-green-600 font-bold">完了しました</Text>
                                    </>
                                ) : (
                                    <>
                                        <Loader2 size={14} className="text-brand-primary animate-spin" />
                                        <Text variant="xs" color="secondary" weight="medium" className="animate-pulse">{message}</Text>
                                    </>
                                )}
                            </Flex>
                        )}
                    </Flex>

                    {isAdvancedOpen && (
                        <View className="mt-4 p-4 bg-surface-muted rounded-xl border border-brand-primary/10">
                            <Stack gap="md">
                                <Flex gap="lg" className="flex-col sm:flex-row">
                                    <Stack gap="xs" className="flex-1">
                                        <Flex justify="between">
                                            <Text variant="xs" weight="bold" color="secondary">PDFから問題を生成</Text>
                                            {pdfFile && <Text variant="xs" color="primary" weight="bold">添付済み</Text>}
                                        </Flex>
                                        <Button
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            className={cn(
                                                "w-full h-10 gap-2 border-dashed",
                                                pdfFile ? "border-brand-primary bg-brand-primary/5 text-brand-primary" : "border-gray-300 text-secondary"
                                            )}
                                        >
                                            <Upload size={16} />
                                            {pdfFile ? "別のPDFを選択" : "PDFをアップロード"}
                                        </Button>
                                    </Stack>

                                    <Stack gap="xs" className="flex-1">
                                        <Text variant="xs" weight="bold" color="secondary">生成する問題数</Text>
                                        <Flex gap="md" align="center" className="h-10">
                                            <Range
                                                min={1}
                                                max={100}
                                                value={count}
                                                onChange={(e) => setCount(parseInt(e.target.value))}
                                                disabled={isProcessing}
                                                className="flex-1"
                                            />
                                            <Input
                                                type="number"
                                                min={1}
                                                max={100}
                                                value={count}
                                                onChange={(e) => setCount(Math.max(1, Math.min(100, parseInt(e.target.value) || 1)))}
                                                disabled={isProcessing}
                                                className="w-16 h-9 text-center text-sm border-brand-primary/10"
                                            />
                                        </Flex>
                                    </Stack>
                                </Flex>

                                <Flex gap="lg" className="flex-col sm:flex-row">
                                    <Stack gap="xs" className="flex-1">
                                        <Text variant="xs" weight="bold" color="secondary">問題の形式</Text>
                                        <Input
                                            placeholder="例：日本語、記述式、4択..."
                                            value={questionFormat}
                                            onChange={(e) => setQuestionFormat(e.target.value)}
                                            disabled={isProcessing}
                                            className="h-10 text-sm"
                                        />
                                    </Stack>
                                    <Stack gap="xs" className="flex-1">
                                        <Text variant="xs" weight="bold" color="secondary">回答の形式</Text>
                                        <Input
                                            placeholder="例：英単語、一言で、A/B..."
                                            value={answerFormat}
                                            onChange={(e) => setAnswerFormat(e.target.value)}
                                            disabled={isProcessing}
                                            className="h-10 text-sm"
                                        />
                                    </Stack>
                                </Flex>

                                <Flex gap="lg" className="flex-col sm:flex-row">
                                    <Stack gap="xs" className="flex-1">
                                        <Text variant="xs" weight="bold" color="secondary">問題の例</Text>
                                        <Input
                                            placeholder="例：The capital of Japan is..."
                                            value={exampleQuestion}
                                            onChange={(e) => setExampleQuestion(e.target.value)}
                                            disabled={isProcessing}
                                            className="h-10 text-sm"
                                        />
                                    </Stack>
                                    <Stack gap="xs" className="flex-1">
                                        <Text variant="xs" weight="bold" color="secondary">解答の例</Text>
                                        <Input
                                            placeholder="例：Tokyo"
                                            value={exampleAnswer}
                                            onChange={(e) => setExampleAnswer(e.target.value)}
                                            disabled={isProcessing}
                                            className="h-10 text-sm"
                                        />
                                    </Stack>
                                </Flex>

                                <Text variant="xs" color="secondary" className="mt-1 opacity-60">
                                    ※「例」を入力すると、AIがそのスタイルに合わせた問題を生成しやすくなります。
                                </Text>
                            </Stack>
                        </View>
                    )}
                </View>
            </Stack>
        </Card>
    );
}
