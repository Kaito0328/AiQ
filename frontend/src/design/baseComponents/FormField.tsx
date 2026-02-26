import React from 'react';
import { Stack } from '../primitives/Stack';
import { Text } from './Text';
import { cn } from '@/src/shared/utils/cn';

export interface FormFieldProps {
    label?: string;
    description?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
    className?: string;
}

/**
 * ラベル、説明文、エラーメッセージと入力要素をセットにしたフォームフィールドコンポーネントです。
 */
export function FormField({
    label,
    description,
    error,
    required,
    children,
    className,
}: FormFieldProps) {
    return (
        <Stack gap="xs" className={cn('w-full', className)}>
            {label && (
                <Text variant="detail" weight="bold" className="flex items-center gap-1">
                    {label}
                    {required && <span className="text-brand-danger">*</span>}
                </Text>
            )}
            {description && (
                <Text variant="xs" color="muted">
                    {description}
                </Text>
            )}
            <div className="w-full">
                {children}
            </div>
            {error && (
                <Text variant="xs" className="text-brand-danger">
                    {error}
                </Text>
            )}
        </Stack>
    );
}
