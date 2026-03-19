"use client";

import React from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { View } from '@/src/design/primitives/View';
import { Stack } from '@/src/design/primitives/Stack';


import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Badge } from '@/src/design/baseComponents/Badge';
import { User } from '@/src/entities/user';
import { UserCircle, Users, Library } from 'lucide-react';
import { OfflineLink } from '@/src/shared/components/Navigation/OfflineLink';

interface UserCardProps {
    user: User;
    onClick?: (user: User) => void;
}

export function UserCard({ user, onClick }: UserCardProps) {
    const content = (
        <Card border="base" padding="sm" className="transition-all hover:shadow-md hover:-translate-y-0.5 cursor-pointer group">
            <Flex gap="md" align="center" justify="between">
                <Flex gap="md" align="center" className="min-w-0 flex-1">
                    <View className="w-12 h-12 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden border border-brand-primary/20 shrink-0">
                        {user.iconUrl ? (
                            <img src={user.iconUrl} alt={user.displayName || user.username} className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle size={24} className="text-brand-primary" />
                        )}
                    </View>
                    <Stack gap="none" className="min-w-0 flex-1">
                        <Flex gap="xs" align="center">
                            <Text weight="bold" className="truncate group-hover:text-brand-primary transition-colors">
                                {user.displayName || user.username}
                            </Text>
                            {user.isOfficial && (
                                <Badge variant="primary" className="shrink-0 scale-75 origin-left">Official</Badge>
                            )}
                        </Flex>
                        <Text variant="xs" color="secondary" className="truncate">@{user.username}</Text>

                        {/* Follow relation */}
                        {(() => {
                            const relation = user.isFollowing && user.isFollowed
                                ? "相互フォロー"
                                : user.isFollowing
                                    ? "フォロー中"
                                    : user.isFollowed
                                        ? "フォローされています"
                                        : null;
                            if (!relation) return null;
                            return (
                                <Text variant="xs" color="primary" className="mt-0.5 text-[10px] opacity-80">
                                    {relation}
                                </Text>
                            );
                        })()}
                    </Stack>
                </Flex>

                {/* Stats on the right */}
                <Flex gap="sm" align="center" className="shrink-0 pl-2 opacity-60">
                    <Flex gap="xs" align="center">
                        <Users size={14} />
                        <Text variant="xs" weight="bold">{user.followerCount || 0}</Text>
                    </Flex>
                    <Flex gap="xs" align="center">
                        <Library size={14} />
                        <Text variant="xs" weight="bold">{user.collectionCount || 0}</Text>
                    </Flex>
                </Flex>
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
        <OfflineLink href={`/users/${user.id}`} className="block">
            {content}
        </OfflineLink>
    );
}
