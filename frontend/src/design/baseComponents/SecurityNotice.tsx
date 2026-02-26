import React from 'react';
import { View } from '../primitives/View';
import { Stack } from '../primitives/Stack';
import { Text } from './Text';

/**
 * セキュリティに関する注意書きを表示するコンポーネントです。
 * 旧環境 (frontend-old) の内容をデザインシステムに適合させたものです。
 */
export function SecurityNotice() {
    return (
        <View
            bg="muted"
            padding="md"
            rounded="md"
            className="border border-surface-muted/50"
        >
            <Stack gap="sm">
                <Text variant="detail" weight="bold" color="secondary">
                    ※セキュリティに関するご注意
                </Text>
                <Stack gap="xs" as="ul" className="list-disc pl-5">
                    <Text as="li" variant="xs" color="muted">
                        このアプリは大学生が個人の学習目的で制作したものであり、商用サービスではありません。
                    </Text>
                    <Text as="li" variant="xs" color="muted">
                        パスワードはハッシュ化して保存していますが、万全なセキュリティを保証するものではありません。
                    </Text>
                    <Text as="li" variant="xs" color="muted">
                        他のサービスと同じパスワードの使い回しは
                        <Text as="span" weight="bold" color="danger" className="mx-1">絶対にお控えください</Text>。
                    </Text>
                    <Text as="li" variant="xs" color="muted">
                        アカウント名やクイズ内容に個人情報を含めないようご注意ください。
                    </Text>
                    <Text as="li" variant="xs" color="muted">
                        このサービスはクイズアプリであり、金銭的な課金要素や重要情報は一切含まれません。
                    </Text>
                </Stack>
            </Stack>
        </View>
    );
}
