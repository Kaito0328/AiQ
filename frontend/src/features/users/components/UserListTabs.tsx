"use client";
import { logger } from "@/src/shared/utils/logger";

import React, { useState, useEffect } from "react";
import { View } from "@/src/design/primitives/View";
import { Stack } from "@/src/design/primitives/Stack";
import { Flex } from "@/src/design/primitives/Flex";
import { Text } from "@/src/design/baseComponents/Text";
import { Spinner } from "@/src/design/baseComponents/Spinner";
import { Tabs, TabItem } from "@/src/design/baseComponents/Tabs";
import { Input } from "@/src/design/baseComponents/Input";
import { Select } from "@/src/design/baseComponents/Select";
import { Button } from "@/src/design/baseComponents/Button";
import { UserCard } from "@/src/features/users/components/UserCard";
import { Search, ArrowUpDown } from "lucide-react";
import { getUsers } from "@/src/features/auth/api";
import { getFollowers, getFollowees } from "@/src/features/follow/api";
import { useAuth } from "@/src/shared/auth/useAuth";
import { db } from "@/src/shared/db/db";
import { saveOfflineProfile } from "@/src/shared/api/offlineApi";
import { User } from "@/src/entities/user";
import { isOfflineError } from "@/src/shared/api/isOfflineError";

interface UserListTabsProps {
  onUserClick?: (user: User) => void;
}

export function UserListTabs({ onUserClick }: UserListTabsProps) {
  const { user: currentUser, isAuthenticated } = useAuth();
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [followers, setFollowers] = useState<User[]>([]);
  const [followees, setFollowees] = useState<User[]>([]);

  // Search and Sort states
  const [searchInput, setSearchInput] = useState("");
  const [appliedQuery, setAppliedQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  const [loadingAll, setLoadingAll] = useState(true);
  const [loadingFollowers, setLoadingFollowers] = useState(false);
  const [loadingFollowees, setLoadingFollowees] = useState(false);

  // Network-first fetch for all users with search/sort
  useEffect(() => {
    let cancelled = false;

    const fetchAll = async () => {
      setLoadingAll(true);
      try {
        const users = await getUsers({
          q: appliedQuery || undefined,
          sort: sortBy === "newest" ? "created_at" : "followers",
        });
        if (cancelled) return;
        setAllUsers(users);

        // オフラインで他ユーザープロフィールに入れるよう、一覧取得時に保存
        Promise.allSettled(users.map((u) => saveOfflineProfile(u)));
      } catch (err) {
        if (!cancelled) {
          try {
            let cached = await db.profiles.toArray();
            if (appliedQuery) {
              const q = appliedQuery.toLowerCase();
              cached = cached.filter(
                (u) =>
                  u.username.toLowerCase().includes(q) ||
                  (u.displayName && u.displayName.toLowerCase().includes(q)),
              );
            }
            setAllUsers(cached);
          } catch {
            // ignore cache read error on fallback
          }
        }

        if (!isOfflineError(err)) {
          logger.error("ユーザー一覧の取得に失敗しました", err);
        }
      } finally {
        if (!cancelled) setLoadingAll(false);
      }
    };

    void fetchAll();

    return () => {
      cancelled = true;
    };
  }, [appliedQuery, sortBy]);

  const handleSearch = () => {
    setAppliedQuery(searchInput.trim());
  };

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

        // フォロー一覧経由でもプロフィール詳細へ入れるようにキャッシュしておく
        Promise.allSettled([...f1, ...f2].map((u) => saveOfflineProfile(u)));
      } catch (err) {
        logger.error("フォローデータの取得に失敗しました", err);
      } finally {
        setLoadingFollowers(false);
        setLoadingFollowees(false);
      }
    };
    fetchFollowData();
  }, [isAuthenticated, currentUser]);

  const renderUserList = (
    users: User[],
    loading: boolean,
    emptyMessage: string,
  ) => {
    if (loading) {
      return (
        <View padding="xl">
          <Flex justify="center">
            <Spinner size="lg" />
          </Flex>
        </View>
      );
    }

    if (users.length === 0) {
      return (
        <View padding="xl">
          <Text align="center" color="secondary">
            {emptyMessage}
          </Text>
        </View>
      );
    }

    return (
      <Stack gap="sm" className="p-1">
        {users.map((u) => (
          <UserCard key={u.id} user={u} onClick={onUserClick} />
        ))}
      </Stack>
    );
  };

  const items: TabItem[] = [
    {
      id: "all",
      label: "全ユーザー",
      content: renderUserList(allUsers, loadingAll, "ユーザーがいません"),
    },
  ];

  if (isAuthenticated) {
    items.push(
      {
        id: "following",
        label: "フォロー中",
        content: renderUserList(
          followees,
          loadingFollowees,
          "フォローしているユーザーがいません",
        ),
      },
      {
        id: "followers",
        label: "フォロワー",
        content: renderUserList(
          followers,
          loadingFollowers,
          "フォロワーがいません",
        ),
      },
    );
  }

  return (
    <Stack gap="lg">
      <Stack gap="xs">
        <Flex gap="xs" align="center">
          <Input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="ユーザー名・表示名で検索"
            className="w-full !text-sm !py-2"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSearch();
              }
            }}
          />
          <Button
            onClick={handleSearch}
            className="h-10 w-10 min-w-10 p-0"
            color="primary"
            title="検索"
            aria-label="検索"
          >
            <Search size={16} />
          </Button>
        </Flex>

        <View className="overflow-x-auto -mx-1 px-1">
          <Flex gap="xs" align="center" className="min-w-max flex-nowrap py-0.5">
            <View className="text-secondary shrink-0">
              <ArrowUpDown size={16} />
            </View>
            <Select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="min-w-[148px] !text-sm !py-2"
            >
              <option value="newest">登録が新しい順</option>
              <option value="followers">フォロワー数順</option>
            </Select>
          </Flex>
        </View>
      </Stack>

      <Tabs items={items} defaultTab="all" fitted />
    </Stack>
  );
}
