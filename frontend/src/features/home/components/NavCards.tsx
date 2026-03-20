"use client";

import React from "react";
import { Grid } from "@/src/design/primitives/Grid";
import { Card } from "@/src/design/baseComponents/Card";
import { Stack } from "@/src/design/primitives/Stack";
import { Text } from "@/src/design/baseComponents/Text";
import { View } from "@/src/design/primitives/View";
import { Icon } from "@/src/design/baseComponents/Icon";
import { useSafeRouter } from "@/src/shared/hooks/useSafeRouter";
import { useAuth } from "@/src/shared/auth/useAuth";
import { useNetworkStatus } from "@/src/shared/contexts/NetworkStatusContext";

interface NavCardProps {
  label: string;
  iconName: React.ComponentProps<typeof Icon>["name"];
  onClick: () => void;
  color?: "primary" | "secondary" | "accent";
  disabled?: boolean;
  helperText?: string;
}

function NavCard({
  label,
  iconName,
  onClick,
  disabled = false,
  helperText,
}: NavCardProps) {
  return (
    <Card
      onClick={disabled ? undefined : onClick}
      className={
        disabled
          ? "opacity-60 cursor-not-allowed group h-full"
          : "cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 group h-full"
      }
      bg="base"
      border="base"
    >
      <View padding="md">
        <Stack gap="sm" align="center">
          <View bg="muted" padding="md" rounded="full">
            <Text color="primary" span>
              <Icon name={iconName} size={24} />
            </Text>
          </View>
          <Text
            variant="xs"
            weight="bold"
            align="center"
            className="transition-colors group-hover:text-brand-primary leading-tight"
          >
            {label}
          </Text>
          {helperText && (
            <Text variant="xs" color="secondary" align="center">
              {helperText}
            </Text>
          )}
        </Stack>
      </View>
    </Card>
  );
}

export function NavCards() {
  const router = useSafeRouter();
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();

  const handleNavigateToMe = () => {
    if (!user) return;
    router.push(`/users/${user.id}`);
  };

  const handleNavigateToUsers = () => {
    router.push("/users");
  };

  const handleNavigateToQuizStart = () => {
    router.push("/quiz/start");
  };

  const handleNavigateToCollectionSearch = () => {
    router.push("/collections/search");
  };

  // オフライン遷移のためにルートをプリフェッチ
  React.useEffect(() => {
    if (!isOnline) return;

    router.prefetch("/users");
    router.prefetch("/quiz/start");
    router.prefetch("/collections/search");
    if (user) {
      router.prefetch(`/users/${user.id}`);
    }
  }, [router, user, isOnline]);

  return (
    <Grid cols={{ base: 2, lg: 4 }} gap="md">
      <NavCard
        label="クイズを始める"
        iconName="play"
        onClick={handleNavigateToQuizStart}
      />
      <NavCard
        label="自分の問題集"
        iconName="user"
        onClick={handleNavigateToMe}
        disabled={!user}
        helperText={!user ? "ログインすると使えます" : undefined}
      />
      <NavCard
        label="コレクション検索"
        iconName="search"
        onClick={handleNavigateToCollectionSearch}
      />
      <NavCard
        label="ユーザー検索"
        iconName="users"
        onClick={handleNavigateToUsers}
      />
    </Grid>
  );
}
