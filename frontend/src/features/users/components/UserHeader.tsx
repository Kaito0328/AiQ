"use client";

import React, { useState, useEffect } from 'react';
import { Card } from '@/src/design/baseComponents/Card';
import { Stack } from '@/src/design/primitives/Stack';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Button } from '@/src/design/baseComponents/Button';
import { UserProfile } from '@/src/entities/user';
import { useAuth } from '@/src/shared/auth/useAuth';
import { followUser, unfollowUser } from '@/src/features/follow/api';
import { UserCircle, Users, BookOpen, Layers, UserPlus, UserMinus } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface StatProps {
    label: string;
    value: number;
    icon: React.ReactNode;
}

function Stat({ label, value, icon }: StatProps) {
    return (
        <Stack gap="xs" align="center">
            <Flex gap="xs" align="center" className="text-foreground/60">
                {icon}
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
            console.error('フォロー操作に失敗しました', err);
        } finally {
            setFollowLoading(false);
        }
    };

    return (
        <Card className="w-full" bg="base">
            <Stack gap="xl">
                <Flex justify="between" align="start" className="flex-wrap gap-6">
                    <Flex gap="lg" align="center">
                        <UserCircle size={64} className="text-brand-muted" />
                        <Stack gap="xs">
                            <Text variant="h2">{profile.displayName || profile.username}</Text>
                            {profile.displayName && (
                                <Text variant="xs" color="secondary">@{profile.username}</Text>
                            )}
                            {profile.isOfficial && (
                                <Text variant="xs" color="primary" className="bg-brand-primary/10 px-2 py-0.5 rounded-full font-bold w-fit">
                                    Official
                                </Text>
                            )}
                            {profile.bio && (
                                <Text variant="xs" color="secondary" className="mt-1">{profile.bio}</Text>
                            )}
                        </Stack>
                    </Flex>

                    <Flex gap="md">
                        {isSelf ? (
                            <Button variant="outline" onClick={() => router.push('/settings/password')} className="gap-1.5">
                                設定
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
                                        <UserMinus size={16} />
                                        フォロー中
                                    </>
                                ) : (
                                    <>
                                        <UserPlus size={16} />
                                        フォローする
                                    </>
                                )}
                            </Button>
                        ) : null}
                    </Flex>
                </Flex>

                <Flex justify="around" className="border-t border-surface-muted pt-6 flex-wrap gap-y-4">
                    <Stat label="フォロワー" value={followerCount} icon={<Users size={18} />} />
                    <Stat label="フォロー中" value={profile.followingCount || 0} icon={<Users size={18} />} />
                    <Stat label="問題集" value={profile.collectionCount || 0} icon={<BookOpen size={18} />} />
                    <Stat label="まとめ枠" value={profile.setCount || 0} icon={<Layers size={18} />} />
                </Flex>
            </Stack>
        </Card>
    );
}
