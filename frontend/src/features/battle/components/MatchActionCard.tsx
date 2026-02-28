"use client";

import React from "react";
import { Card } from "@/src/design/baseComponents/Card";
import { Stack } from "@/src/design/primitives/Stack";
import { View } from "@/src/design/primitives/View";
import { Text } from "@/src/design/baseComponents/Text";
import { BrandColorKey } from "@/src/design/tokens/keys";
import { cn } from "@/src/shared/utils/cn";

interface MatchActionCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    onClick: () => void;
    isLoading?: boolean;
}

export function MatchActionCard({
    title,
    description,
    icon,
    onClick,
    isLoading = false,
}: MatchActionCardProps) {
    return (
        <Card
            onClick={isLoading ? undefined : onClick}
            bg="base"
            border="primary"
            className={cn(
                "cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 h-full group",
                isLoading && "opacity-70 cursor-not-allowed pointer-events-none"
            )}
        >
            <Stack gap="md" align="center" className="py-8">
                <View
                    bg="muted"
                    className={cn(
                        "p-4 rounded-brand-full",
                        isLoading && "animate-pulse"
                    )}
                >
                    {icon}
                </View>
                <Stack gap="xs" align="center">
                    <Text variant="h3" weight="bold" className="transition-colors group-hover:text-brand-primary">
                        {isLoading ? "作成中..." : title}
                    </Text>
                    <Text variant="xs" color="secondary" align="center">
                        {isLoading ? "しばらくお待ちください" : description}
                    </Text>
                </Stack>
            </Stack>
        </Card>
    );
}
