"use client";

import React, { useState } from 'react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { TextArea } from '@/src/design/baseComponents/TextArea';
import { FormField } from '@/src/design/baseComponents/FormField';
import { Flex } from '@/src/design/primitives/Flex';
import { View } from '@/src/design/primitives/View';
import { Select } from '@/src/design/baseComponents/Select';
import { FileText, Loader2, CheckCircle, AlertCircle, FileUp } from 'lucide-react';
import { useAiGeneration } from '../hooks/useAiGeneration';
import { useToast } from '@/src/shared/contexts/ToastContext';

interface PdfGenerationModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: string;
    onSuccess: () => void;
}

export function PdfGenerationModal({ isOpen, onClose, collectionId, onSuccess }: PdfGenerationModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [prompt, setPrompt] = useState('この資料の内容から重要なポイントを抜き出して問題を作成してください。');
    const [count, setCount] = useState(5);
    const [explanationLanguage, setExplanationLanguage] = useState('');
    const { showToast } = useToast();
    const { generate, reset, status, message, generatedQuestions } = useAiGeneration(collectionId);

    const convertToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = reader.result as string;
                resolve(base64.split(',')[1]); // metadata部分は削除
            };
            reader.onerror = error => reject(error);
        });
    };

    const handleGenerate = async () => {
        if (!file) {
            showToast({ message: 'PDFファイルを選択してください', variant: 'warning' });
            return;
        }

        try {
            const pdfBase64 = await convertToBase64(file);
            generate({
                prompt,
                count,
                pdfData: pdfBase64,
                explanationLanguage: explanationLanguage || undefined
            });
        } catch (err) {
            console.error(err);
            showToast({ message: 'ファイルの読み込みに失敗しました', variant: 'danger' });
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else {
            showToast({ message: 'PDFファイルを選択してください', variant: 'warning' });
            setFile(null);
        }
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
            title="PDFから問題生成"
            size="md"
            footer={status === 'idle' ? (
                <Flex justify="end" gap="sm" className="w-full">
                    <Button variant="ghost" onClick={onClose}>
                        キャンセル
                    </Button>
                    <Button variant="solid" color="primary" onClick={handleGenerate} disabled={!file} className="gap-2">
                        <FileText size={18} />
                        生成を開始
                    </Button>
                </Flex>
            ) : undefined}
        >
            <Stack gap="xl">
                {status === 'idle' ? (
                    <>
                        <Stack gap="sm">
                            <Text weight="bold" variant="xs">PDFファイルを選択</Text>
                            <View
                                className={cn(
                                    "relative border-2 border-dashed rounded-xl p-8 transition-all hover:bg-surface-muted/50 flex flex-col items-center justify-center gap-4 cursor-pointer",
                                    file ? "border-brand-primary bg-brand-primary/5" : "border-surface-muted/50"
                                )}
                                onClick={() => document.getElementById('pdf-upload-input')?.click()}
                            >
                                <input
                                    id="pdf-upload-input"
                                    type="file"
                                    accept=".pdf"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                                {file ? (
                                    <>
                                        <FileText size={48} className="text-brand-primary" />
                                        <Text weight="bold">{file.name}</Text>
                                        <Text variant="xs" color="secondary">クリックしてファイルを選択し直す</Text>
                                    </>
                                ) : (
                                    <>
                                        <FileUp size={48} className="text-secondary opacity-30" />
                                        <Stack gap="xs" align="center">
                                            <Text weight="bold">クリックしてPDFをアップロード</Text>
                                            <Text variant="xs" color="secondary">最大 10MB まで</Text>
                                        </Stack>
                                    </>
                                )}
                            </View>
                        </Stack>

                        <FormField label="AIへの追加指示 (任意)">
                            <TextArea
                                placeholder="例: 専門用語の解説を含めて / 重要な数値に関する問題を中心に作成して"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                rows={3}
                            />
                        </FormField>

                        <FormField label="問題数 (1〜10)">
                            <Input
                                type="number"
                                min={1}
                                max={10}
                                value={count}
                                onChange={(e) => setCount(parseInt(e.target.value) || 5)}
                            />
                        </FormField>

                        <FormField label="解説の言語">
                            <Select
                                value={explanationLanguage}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setExplanationLanguage(e.target.value)}
                            >
                                <option value="">自動（推測）</option>
                                <option value="日本語">日本語</option>
                                <option value="英語">英語</option>
                            </Select>
                        </FormField>

                    </>
                ) : (
                    <View className="py-8">
                        <Stack gap="lg" align="center">
                            {status === 'processing' || status === 'saving' ? (
                                <>
                                    <Loader2 size={48} className="text-brand-primary animate-spin" />
                                    <Stack gap="xs" align="center">
                                        <Text weight="bold" variant="body">{message}</Text>
                                        <Text variant="xs" color="secondary">PDFの解析と生成には時間がかかる場合があります...</Text>
                                    </Stack>
                                </>
                            ) : status === 'completed' ? (
                                <>
                                    <CheckCircle size={48} className="text-green-500" />
                                    <Stack gap="xs" align="center">
                                        <Text weight="bold" variant="body">生成が完了しました！</Text>
                                        <Text variant="xs" color="secondary">{generatedQuestions.length}問の問題を追加しました。</Text>
                                    </Stack>
                                    <Button variant="solid" onClick={handleClose} className="w-full mt-4">
                                        閉じる
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <AlertCircle size={48} className="text-red-500" />
                                    <Stack gap="xs" align="center">
                                        <Text weight="bold" variant="body">エラーが発生しました</Text>
                                        <Text variant="xs" color="secondary">{message}</Text>
                                    </Stack>
                                    <Button variant="outline" onClick={reset} className="w-full mt-4">
                                        やり直す
                                    </Button>
                                </>
                            )}
                        </Stack>
                    </View>
                )}
            </Stack>
        </Modal>
    );
}

// Helper for cn
function cn(...classes: (string | boolean | undefined)[]) {
    return classes.filter(Boolean).join(' ');
}
