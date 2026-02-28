"use client";

import React, { useState, useEffect } from 'react';
import { View } from '@/src/design/primitives/View';
import { Stack } from '@/src/design/primitives/Stack';
import { Grid } from '@/src/design/primitives/Grid';
import { Flex } from '@/src/design/primitives/Flex';
import { Text } from '@/src/design/baseComponents/Text';
import { Spinner } from '@/src/design/baseComponents/Spinner';
import { Tabs, TabItem } from '@/src/design/baseComponents/Tabs';
import { Input } from '@/src/design/baseComponents/Input';
import { Select } from '@/src/design/baseComponents/Select';
import { UserCard } from '@/src/features/users/components/UserCard';
import { User } from '@/src/entities/user';
import { getUsers } from '@/src/features/auth/api';
import { getFollowers, getFollowees } from '@/src/features/follow/api';
import { useAuth } from '@/src/shared/auth/useAuth';
import { Search, Filter } from 'lucide-react';

interface UserListTabsProps {
    onUserClick?: (user: User) => void;
}

export function UserListTabs({ onUserClick }: UserListTabsProps) {
    const { user: currentUser, isAuthenticated } = useAuth();
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [followers, setFollowers] = useState<User[]>([]);
    const [followees, setFollowees] = useState<User[]>([]);

    // Search and Sort states
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');

    const [loadingAll, setLoadingAll] = useState(true);
    const [loadingFollowers, setLoadingFollowers] = useState(false);
    const [loadingFollowees, setLoadingFollowees] = useState(false);

    // Initial fetch for all users with search/sort
    useEffect(() => {
        const fetchAll = async () => {
            setLoadingAll(true);
            try {
                const users = await getUsers({
                    q: searchQuery || undefined,
                    sort: sortBy === 'newest' ? 'created_at' : 'followers'
                });
                setAllUsers(users);
            } catch (err) {
                console.error('ユーザー一覧の取得に失敗しました', err);
            } finally {
                setLoadingAll(false);
            }
        };

        const timer = setTimeout(() => {
            fetchAll();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, sortBy]);

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
        <Stack gap="lg">
            <Flex gap="md" className="flex-col sm:flex-row">
                <View className="relative flex-1">
                    <View className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40 pointer-events-none">
                        <Search size={18} />
                    </View>
                    <Input
                        placeholder="ユーザーを検索..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </View>
                <View className="w-full sm:w-48">
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="newest">登録が新しい順</option>
                        <option value="followers">フォロワー数順</option>
                    </Select>
                </View>
            </Flex>

            <Tabs items={items} defaultTab="all" fitted />
        </Stack>
    );
}
