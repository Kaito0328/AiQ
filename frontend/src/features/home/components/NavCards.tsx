"use client";

import React from "react";
import { Grid } from "@/src/design/primitives/Grid";
import { Card } from "@/src/design/baseComponents/Card";
import { Stack } from "@/src/design/primitives/Stack";
import { Text } from "@/src/design/baseComponents/Text";
import { View } from "@/src/design/primitives/View";
import { Icon } from "@/src/design/baseComponents/Icon";
import { useRouter } from "next/navigation";
import { useAuth } from "@/src/shared/auth/useAuth";

interface NavCardProps {
  label: string;
  iconName: React.ComponentProps<typeof Icon>['name'];
  onClick: () => void;
  color?: "primary" | "secondary" | "accent";
}

function NavCard({ label, iconName, onClick }: NavCardProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 group h-full"
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
          <Text variant="xs" weight="bold" align="center" className="transition-colors group-hover:text-brand-primary leading-tight">
            {label}
          </Text>
        </Stack>
      </View>
    </Card>
  );
}

export function NavCards() {
  const router = useRouter();
  const { user } = useAuth();

  const handleNavigateToOfficial = () => {
    router.push("/users/official");
  };

  const handleNavigateToMe = () => {
    if (user) {
      router.push(`/users/${user.id}`);
    } else {
      router.push("/login");
    }
  };

  const handleNavigateToUsers = () => {
    router.push("/users");
  };

  const handleNavigateToQuizStart = () => {
    router.push("/quiz/start");
  };

  // オフライン遷移のためにルートをプリフェッチ
  React.useEffect(() => {
    router.prefetch("/users/official");
    router.prefetch("/users");
    router.prefetch("/quiz/start");
    if (user) {
      router.prefetch(`/users/${user.id}`);
    }
  }, [router, user]);

  return (
    <Grid cols={{ base: 2, lg: 4 }} gap="md">
      <NavCard
        label="クイズを始める"
        iconName="play"
        onClick={handleNavigateToQuizStart}
      />
      <NavCard
        label="公式の問題集"
        iconName="collection"
        onClick={handleNavigateToOfficial}
      />
      {user && (
        <NavCard
          label="自分の問題集"
          iconName="user"
          onClick={handleNavigateToMe}
        />
      )}
      <NavCard
        label="ユーザーリスト"
        iconName="users"
        onClick={handleNavigateToUsers}
      />
    </Grid>
  );
}
