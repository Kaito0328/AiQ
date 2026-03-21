"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/src/design/primitives/Container";
import { Stack } from "@/src/design/primitives/Stack";
import { View } from "@/src/design/primitives/View";
import { Text } from "@/src/design/baseComponents/Text";
import { UserListTabs } from "@/src/features/users/components/UserListTabs";
import { Spinner } from "@/src/design/baseComponents/Spinner";
import { UserProfilePageContent } from "@/src/features/users/components/UserProfilePageContent";

function getOfflineUserIdFromHash(): string | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash.startsWith("#")) return null;
  const params = new URLSearchParams(hash.slice(1));
  return params.get("offlineUserId");
}

function UsersPageContent() {
  const searchParams = useSearchParams();
  const [offlineUserIdFromHash, setOfflineUserIdFromHash] = React.useState<
    string | null
  >(() => getOfflineUserIdFromHash());

  React.useEffect(() => {
    const syncFromHash = () => {
      setOfflineUserIdFromHash(getOfflineUserIdFromHash());
    };

    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const offlineUserId =
    offlineUserIdFromHash ?? searchParams.get("offlineUserId");

  if (offlineUserId) {
    return <UserProfilePageContent userId={offlineUserId} />;
  }

  return (
    <View className="min-h-screen bg-surface-muted pb-12">
      <Container className="pt-6">
        <Stack gap="xl">
          <Text variant="h1" weight="bold">
            ユーザー一覧
          </Text>
          <UserListTabs />
        </Stack>
      </Container>
    </View>
  );
}

export default function UsersPage() {
  return (
    <Suspense
      fallback={
        <View className="min-h-screen bg-surface-muted pb-12">
          <Container className="pt-6">
            <View className="py-16 flex justify-center">
              <Spinner size="lg" />
            </View>
          </Container>
        </View>
      }
    >
      <UsersPageContent />
    </Suspense>
  );
}
