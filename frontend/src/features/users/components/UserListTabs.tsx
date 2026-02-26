"use client";

import React, { useState, useEffect } from 'react';
import { Stack } from '@/src/design/primitives/Stack';
import { Grid } from '@/src/design/primitives/Grid';
import { View } from '@/src/design/primitives/View';
import { Text } from '@/src/design/baseComponents/Text';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { Tabs, TabItem } from '@/src/design/baseComponents/Tabs';
import { UserCard } from '@/src/features/users/components/UserCard';
import { User } from '@/src/entities/user';
import { getUsers } from '@/src/features/auth/api';
import { getFollowers, getFollowees } from '@/src/features/follow/api';
import { useAuth } from '@/src/shared/auth/useAuth';

interface UserListTabsProps {
    onUserClick?: (user: User) => void;
}

export function UserListTabs({ onUserClick }: UserListTabsProps) {
    const { user: currentUser, isAuthenticated } = useAuth();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [followers, setFollowers] = useState<User[]>([]);
    const [followees, setFollowees] = useState<User[]>([]);
    const [loadingAll, setLoadingAll] = useState(true);
    const [loadingFollowers, setLoadingFollowers] = useState(false);
    const [loadingFollowees, setLoadingFollowees] = useState(false);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const users = await getUsers();
                setAllUsers(users);
            } catch (err) {
                console.error('ユーザー一覧の取得に失敗しました', err);
            } finally {
                setLoadingAll(false);
            }
        };
        fetchAll();
    }, []);

    useEffect(() => {
        if (!isAuthenticated || !currentUser) return;

        const fetchFollowData = async () => {
            setLoadingFollowers(true);
            setLoadingFollowees(true);
            try {
                const [f1, f2] = await Promise.all([
                    getFollowers(currentUser.id),
                    getFollowees(currentUser.id),
                ]);
                setFollowers(f1);
                setFollowees(f2);
            } catch (err) {
                console.error('フォローデータの取得に失敗しました', err);
            } finally {
                setLoadingFollowers(false);
                setLoadingFollowees(false);
            }
        };
        fetchFollowData();
    }, [isAuthenticated, currentUser]);

    const renderUserList = (users: User[], loading: boolean, emptyMessage: string) => {
        if (loading) {
            return (
                <View className="flex justify-center py-12">
                    <Spinner size="lg" />
                </View>
            );
        }

        if (users.length === 0) {
            return (
                <View className="py-12 text-center">
                    <Text color="secondary">{emptyMessage}</Text>
                </View>
            );
        }

        return (
            <Grid cols={{ sm: 2, lg: 3 }} gap="md" className="p-1">
                {users.map(u => (
                    <UserCard key={u.id} user={u} onClick={onUserClick} />
                ))}
            </Grid>
        );
    };

    const items: TabItem[] = [
        {
            id: 'all',
            label: '全ユーザー',
            content: renderUserList(allUsers, loadingAll, 'ユーザーがいません'),
        },
    ];

    if (isAuthenticated) {
        items.push(
            {
                id: 'following',
                label: 'フォロー中',
                content: renderUserList(followees, loadingFollowees, 'フォローしているユーザーがいません'),
            },
            {
                id: 'followers',
                label: 'フォロワー',
                content: renderUserList(followers, loadingFollowers, 'フォロワーがいません'),
            }
        );
    }

    return (
        <Stack gap="md">
            <Tabs items={items} defaultTab="all" fitted />
        </Stack>
    );
}
