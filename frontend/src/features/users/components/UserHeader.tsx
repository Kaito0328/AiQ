"use client"
import { logger } from '@/src/shared/utils/logger';

import React, { useState, useEffect } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Grid } from '@/src/design/primitives/Grid';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { Badge } from '@/src/design/baseComponents/Badge';
import { UserProfile } from '@/src/entities/user';
import { useAuth } from '@/src/shared/auth/useAuth';
import { followUser, unfollowUser } from '@/src/features/follow/api';
import { Icon, IconName } from '@/src/design/baseComponents/Icon';
import { useRouter } from 'next/navigation';

interface StatProps {
    label: string;
    value: number;
    iconName: IconName;
    className?: string;
}

function Stat({ label, value, iconName, className }: StatProps) {
    return (
        <Stack gap="xs" align="center" className={className}>
            <Flex gap="xs" align="center" className="text-foreground/60">
                <Icon name={iconName} size={18} />
                <Text variant="xs" color="muted">{label}</Text>
            </Flex>
            <Text weight="bold" variant="detail">{value}</Text>
        </Stack>
    );
}

interface UserHeaderProps {
    profile: UserProfile;
}

export function UserHeader({ profile }: UserHeaderProps) {
    const { user: currentUser, isAuthenticated } = useAuth();
    const router = useRouter();
    const isSelf = currentUser?.id === profile.id;

    const [isFollowing, setIsFollowing] = useState(profile.isFollowing || false);
    const [followerCount, setFollowerCount] = useState(profile.followerCount || 0);
    const [followLoading, setFollowLoading] = useState(false);

    useEffect(() => {
        setIsFollowing(profile.isFollowing || false);
        setFollowerCount(profile.followerCount || 0);
    }, [profile.isFollowing, profile.followerCount]);

    const handleFollowToggle = async () => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        setFollowLoading(true);
        try {
            if (isFollowing) {
                await unfollowUser(profile.id);
                setIsFollowing(false);
                setFollowerCount(prev => Math.max(0, prev - 1));
            } else {
                await followUser(profile.id);
                setIsFollowing(true);
                setFollowerCount(prev => prev + 1);
            }
        } catch (err) {
            logger.error('フォロー操作に失敗しました', err);
        } finally {
            setFollowLoading(false);
        }
    };

    return (
        <Card className="w-full" bg="base">
            <Stack gap="xl">
                <Flex justify="between" align="start" className="flex-wrap gap-6">
                    <Flex gap="lg" align="center">
                        <View className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden border-2 border-brand-primary/20 shrink-0">
                            {profile.iconUrl ? (
                                <img src={profile.iconUrl} alt={profile.displayName || profile.username} className="w-full h-full object-cover" />
                            ) : (
                                <Icon name="user" size={40} className="text-brand-primary" />
                            )}
                        </View>
                        <Stack gap="xs">
                            <Text variant="h2">{profile.displayName || profile.username}</Text>
                            {profile.displayName && (
                                <Text variant="xs" color="secondary">@{profile.username}</Text>
                            )}
                            {profile.isOfficial && (
                                <Badge variant="primary" className="w-fit">
                                    Official
                                </Badge>
                            )}
                            {profile.bio && (
                                <Text variant="xs" color="secondary" className="mt-1">{profile.bio}</Text>
                            )}
                        </Stack>
                    </Flex>

                    <Flex gap="md">
                        {isSelf ? (
                            <Button variant="outline" onClick={() => router.push('/settings')} className="gap-1.5">
                                プロフィール設定
                            </Button>
                        ) : isAuthenticated ? (
                            <Button
                                variant={isFollowing ? "outline" : "solid"}
                                color={isFollowing ? undefined : "primary"}
                                onClick={handleFollowToggle}
                                disabled={followLoading}
                                className="gap-1.5"
                            >
                                {isFollowing ? (
                                    <>
                                        <Icon name="unfollow" size={16} />
                                        フォロー中
                                    </>
                                ) : (
                                    <>
                                        <Icon name="follow" size={16} />
                                        フォローする
                                    </>
                                )}
                            </Button>
                        ) : null}
                    </Flex>
                </Flex>

                <Grid cols={2} gap="md" className="border-t border-surface-muted pt-6 sm:grid-cols-4">
                    <Stat label="フォロワー" value={followerCount} iconName="users" />
                    <Stat label="フォロー中" value={profile.followingCount || 0} iconName="users" />
                    <Stat label="コレクション" value={profile.collectionCount || 0} iconName="collection" className="hidden sm:flex" />
                    <Stat label="セット" value={profile.setCount || 0} iconName="collectionSet" className="hidden sm:flex" />
                </Grid>
            </Stack>
        </Card>
    );
}
