"use client";

import React from "react";
import { Grid } from "@/src/design/primitives/Grid";
import { Card } from "@/src/design/baseComponents/Card";
import { Stack } from "@/src/design/primitives/Stack";
import { Text } from "@/src/design/baseComponents/Text";
import { View } from "@/src/design/primitives/View";
import { Book, User, Users, LayoutGrid, PlayCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { SectionHeader } from "@/src/shared/components/SectionHeader";
import { useAuth } from "@/src/shared/auth/useAuth";

interface NavCardProps {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  color?: "primary" | "secondary" | "accent";
}

function NavCard({ label, icon, onClick }: NavCardProps) {
  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 active:scale-95 group"
      bg="base"
      border="base"
    >
      <Stack gap="md" align="center" className="py-6">
        <View bg="muted" className="p-4 rounded-brand-full text-brand-primary">
          {icon}
        </View>
        <Text weight="bold" align="center" className="transition-colors group-hover:text-brand-primary">
          {label}
        </Text>
      </Stack>
    </Card>
  );
}

export function NavCards() {
  const router = useRouter();
  const { user } = useAuth();

  const handleNavigateToOfficial = () => {
    // バックエンドの仕様上、公式ユーザーのIDを取得してそのページへ
    // ここでは一旦 /users/official という仮のルーティングまたは
    // 直接 ID を取得するロジックを期待
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
        icon={<PlayCircle size={32} />}
        onClick={handleNavigateToQuizStart}
      />
      <NavCard
        label="公式の問題集"
        icon={<Book size={32} />}
        onClick={handleNavigateToOfficial}
      />
      {user && (
        <NavCard
          label="自分の問題集"
          icon={<User size={32} />}
          onClick={handleNavigateToMe}
        />
      )}
      <NavCard
        label="ユーザーリスト"
        icon={<Users size={32} />}
        onClick={handleNavigateToUsers}
      />
    </Grid>
  );
}
