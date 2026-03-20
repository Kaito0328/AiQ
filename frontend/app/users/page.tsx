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

function UsersPageContent() {
  const searchParams = useSearchParams();
  const offlineUserId = searchParams.get("offlineUserId");

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
