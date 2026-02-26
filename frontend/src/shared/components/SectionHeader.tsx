"use client";

import React from 'react';
import { View } from '@/src/design/primitives/View';
import { Flex } from '@/src/design/primitives/Flex';
import { Stack } from '@/src/design/primitives/Stack';
import { Text } from '@/src/design/baseComponents/Text';
import { LucideIcon } from 'lucide-react';

interface SectionHeaderProps {
    icon: LucideIcon;
    title: string;
    description?: string;
}

export function SectionHeader({ icon: Icon, title, description }: SectionHeaderProps) {
    return (
        <Flex gap="sm" align="center">
            <View className="p-2 rounded-lg bg-brand-primary/10 text-brand-primary">
                <Icon size={20} />
            </View>
            <Stack gap="none">
                <Text weight="bold" variant="detail">{title}</Text>
                {description && (
                    <Text variant="xs" color="secondary">{description}</Text>
                )}
            </Stack>
        </Flex>
    );
}
