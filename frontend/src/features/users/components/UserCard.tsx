"use client";

import React from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { View } from '@/src/design/primitives/View';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Badge } from '@/src/design/baseComponents/Badge';
import { User } from '@/src/entities/user';
import { UserCircle, Users } from 'lucide-react';
import Link from 'next/link';

interface UserCardProps {
    user: User;
    onClick?: (user: User) => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
    const content = (
        <Card border="base" className="transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer group">
            <Flex gap="md" align="center">
                <View className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden border border-brand-primary/20 shrink-0">
                    {user.iconUrl ? (
                        <img src={user.iconUrl} alt={user.displayName || user.username} className="w-full h-full object-cover" />
                    ) : (
                        <UserCircle size={24} className="text-brand-primary" />
                    )}
                </View>
                <Stack gap="xs" className="flex-1 min-w-0">
                    <Flex gap="sm" align="center">
                        <Text weight="bold" className="truncate group-hover:text-brand-primary transition-colors">{user.displayName || user.username}</Text>
                        {user.isOfficial && (
                            <Badge variant="primary" className="shrink-0">Official</Badge>
                        )}
                    </Flex>
                    <Flex gap="lg" className="text-foreground/50">
                        <Flex gap="xs" align="center">
                            <Users size={14} />
                            <Text variant="xs">{user.followerCount} フォロワー</Text>
                        </Flex>
                        <Flex gap="xs" align="center">
                            <Text variant="xs">{user.followingCount} フォロー中</Text>
                        </Flex>
                    </Flex>
                </Stack>
            </Flex>
        </Card>
    );

    if (onClick) {
        return (
            <div onClick={() => onClick(user)} className="block">
                {content}
            </div>
        );
    }

    return (
        <Link href={`/users/${user.id}`} className="block">
            {content}
        </Link>
    );
}
