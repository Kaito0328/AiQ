"use client";

import React, { useState } from 'react';
import { Modal } from '@/src/design/baseComponents/Modal';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Input } from '@/src/design/baseComponents/Input';
import { View } from '@/src/design/primitives/View';
import { Flex } from '@/src/design/primitives/Flex';
import { FileUp, AlertCircle, CheckCircle, Download } from 'lucide-react';
import { uploadCsv } from '../api';
import { useToast } from '@/src/shared/contexts/ToastContext';
import { cn } from '@/src/shared/utils/cn';

interface CsvImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    collectionId: string;
    onSuccess: () => void;
}

export function CsvImportModal({ isOpen, onClose, collectionId, onSuccess }: CsvImportModalProps) {
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'text/csv' || selectedFile?.name.endsWith('.csv')) {
            setFile(selectedFile);
        } else {
            showToast({ message: 'CSVファイルを選択してください', variant: 'warning' });
            setFile(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setLoading(true);
        try {
            await uploadCsv(collectionId, file);
            showToast({ message: 'CSVインポートが完了しました', variant: 'success' });
            onSuccess();
            onClose();
        } catch (err) {
            console.error(err);
            showToast({ message: 'インポートに失敗しました。ファイル形式を確認してください。', variant: 'danger' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="CSVインポート"
            size="md"
        >
            <Stack gap="xl">
                <View className="bg-brand-primary/5 p-4 rounded-lg border border-brand-primary/10">
                    <Stack gap="sm">
                        <Flex gap="sm" align="center" className="text-brand-primary">
                            <AlertCircle size={18} />
                            <Text weight="bold">インポートのヒント</Text>
                        </Flex>
                        <Stack gap="xs">
                            <Text variant="detail" color="secondary">
                                CSVのヘッダーには「問題文」「正解」「解説」を含めてください。
                            </Text>
                            <Text variant="detail" color="secondary">
                                (または英語で: question, answer, description)
                            </Text>
                        </Stack>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-fit gap-1 text-brand-primary p-0 h-auto hover:bg-transparent"
                            onClick={() => {
                                const csvContent = "問題文,正解,解説\n例: 日本の首都は？,東京,日本の政治・経済の中心地です。";
                                const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8' });
                                const url = URL.createObjectURL(blob);
                                const link = document.createElement('a');
                                link.href = url;
                                link.setAttribute('download', 'template.csv');
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                        >
                            <Download size={14} />
                            テンプレートをダウンロード
                        </Button>
                    </Stack>
                </View>

                <Stack gap="sm">
                    <Text weight="bold" variant="xs">CSVファイルを選択</Text>
                    <View
                        className={cn(
                            "relative border-2 border-dashed rounded-xl p-8 transition-all hover:bg-gray-50 flex flex-col items-center justify-center gap-4 cursor-pointer",
                            file ? "border-brand-primary bg-brand-primary/5" : "border-gray-200"
                        )}
                        onClick={() => document.getElementById('csv-upload-input')?.click()}
                    >
                        <input
                            id="csv-upload-input"
                            type="file"
                            accept=".csv"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        {file ? (
                            <>
                                <CheckCircle size={48} className="text-brand-primary" />
                                <Text weight="bold">{file.name}</Text>
                                <Text variant="xs" color="secondary">クリックしてファイルを選択し直す</Text>
                            </>
                        ) : (
                            <>
                                <FileUp size={48} className="text-gray-300" />
                                <Stack gap="xs" align="center">
                                    <Text weight="bold">クリックしてファイルを選択</Text>
                                    <Text variant="xs" color="secondary">またはファイルをドラッグ＆ドロップ</Text>
                                </Stack>
                            </>
                        )}
                    </View>
                </Stack>

                <Flex justify="end" gap="sm">
                    <Button variant="ghost" onClick={onClose} disabled={loading}>
                        キャンセル
                    </Button>
                    <Button
                        variant="solid"
                        onClick={handleUpload}
                        disabled={!file || loading}
                        loading={loading}
                    >
                        インポートを開始
                    </Button>
                </Flex>
            </Stack>
        </Modal>
    );
}
