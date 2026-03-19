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
import { getOfficialUser } from "@/src/features/auth/api";
import { db } from "@/src/shared/db/db";

interface NavCardProps {
  label: string;
  iconName: React.ComponentProps<typeof Icon>["name"];
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
          <Text
            variant="xs"
            weight="bold"
            align="center"
            className="transition-colors group-hover:text-brand-primary leading-tight"
          >
            {label}
          </Text>
        </Stack>
      </View>
    </Card>
  );
}

export function NavCards() {
  const router = useSafeRouter();
  const { user } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [officialUserId, setOfficialUserId] = React.useState<string | null>(
    null,
  );

  React.useEffect(() => {
    let cancelled = false;

    const loadOfficialUserId = async () => {
      if (typeof window === "undefined") return;

      const cachedId = localStorage.getItem("aiq_official_user_id");
      if (cachedId) {
        setOfficialUserId(cachedId);
        return;
      }

      try {
        const profiles = await db.profiles.toArray();
        const official = profiles.find((p) => p.isOfficial);
        if (official) {
          if (!cancelled) setOfficialUserId(official.id);
          localStorage.setItem("aiq_official_user_id", official.id);
          return;
        }
      } catch {
        // Ignore local DB errors and try API when online.
      }

      if (!isOnline) return;

      try {
        const official = await getOfficialUser();
        if (cancelled) return;
        setOfficialUserId(official.id);
        localStorage.setItem("aiq_official_user_id", official.id);
      } catch {
        // Keep card functional by falling back to users list when lookup fails.
      }
    };

    loadOfficialUserId();
    return () => {
      cancelled = true;
    };
  }, [isOnline]);

  const handleNavigateToOfficial = () => {
    if (officialUserId) {
      router.push(`/users/${officialUserId}`);
      return;
    }
    router.push("/users");
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
    if (!isOnline) return;

    if (officialUserId) {
      router.prefetch(`/users/${officialUserId}`);
    }
    router.prefetch("/users");
    router.prefetch("/quiz/start");
    if (user) {
      router.prefetch(`/users/${user.id}`);
    }
  }, [router, user, isOnline, officialUserId]);

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
