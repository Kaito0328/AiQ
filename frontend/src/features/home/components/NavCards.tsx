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
      className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 group"
      bg="base"
      border="base"
    >
      <View padding="xl">
        <Stack gap="md" align="center">
          <View bg="muted" padding="lg" rounded="full">
            <Text color="primary" span>
              <Icon name={iconName} size={32} />
            </Text>
          </View>
          <Text weight="bold" align="center" className="transition-colors group-hover:text-brand-primary">
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

  return (
    <Grid cols={{ sm: 1, md: 2, lg: 4 }} gap="md">
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
