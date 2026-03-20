"use client";

import React, { useState, useEffect } from "react";
import { Container } from "@/src/design/primitives/Container";
import { Stack } from "@/src/design/primitives/Stack";
import { Flex } from "@/src/design/primitives/Flex";
import { Card } from "@/src/design/baseComponents/Card";
import { View } from "@/src/design/primitives/View";
import { Text } from "@/src/design/baseComponents/Text";
import { Button } from "@/src/design/baseComponents/Button";
import { db } from "@/src/shared/db/db";
import { Database, Trash2, RefreshCw, HardDrive } from "lucide-react";
import { useToast } from "@/src/shared/contexts/ToastContext";

export default function CacheManagementPage() {
  const { showToast } = useToast();
  const [stats, setStats] = useState({
    collections: 0,
    questions: 0,
    profiles: 0,
    pendingActions: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const [c, q, p, a] = await Promise.all([
        db.collections.count(),
        db.questions.count(),
        db.profiles.count(),
        db.pendingActions.count(),
      ]);
      setStats({
        collections: c,
        questions: q,
        profiles: p,
        pendingActions: a,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const clearTable = async (
    tableName: keyof typeof db &
      ("collections" | "questions" | "profiles" | "pendingActions"),
  ) => {
    if (!window.confirm(`${tableName} のキャッシュを削除しますか？`)) return;

    try {
      // @ts-ignore
      await db[tableName].clear();
      showToast({ message: `${tableName} を削除しました`, variant: "success" });
      fetchStats();
    } catch (err) {
      showToast({ message: "削除に失敗しました", variant: "danger" });
    }
  };

  const clearAll = async () => {
    if (
      !window.confirm(
        "すべてのキャッシュを削除しますか？未送信のアクションも削除されます。",
      )
    )
      return;

    try {
      await Promise.all([
        db.collections.clear(),
        db.questions.clear(),
        db.profiles.clear(),
        db.pendingActions.clear(),
      ]);
      showToast({
        message: "すべてのキャッシュを削除しました",
        variant: "success",
      });
      fetchStats();
    } catch (err) {
      showToast({ message: "削除に失敗しました", variant: "danger" });
    }
  };

  return (
    <View className="min-h-screen bg-surface-muted py-6 sm:py-12">
      <Container>
        <Stack gap="lg" className="max-w-2xl mx-auto">
          <Text variant="h2" weight="bold">
            キャッシュ管理
          </Text>

          <Text color="secondary" variant="detail">
            ブラウザに保存されているローカルデータの管理を行います。
            オフライン表示のために蓄積されたデータや、同期待ちのアクションを確認できます。
          </Text>

          <Card border="base">
            <Stack gap="xl">
              <Flex justify="between" align="center">
                <Flex gap="sm" align="center">
                  <Database className="text-brand-primary" size={24} />
                  <Text variant="h3" weight="bold">
                    ストレージ統計
                  </Text>
                </Flex>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchStats}
                  disabled={loading}
                >
                  <RefreshCw
                    size={16}
                    className={loading ? "animate-spin" : ""}
                  />
                </Button>
              </Flex>

              <Stack gap="md">
                <StatItem
                  label="コレクション"
                  count={stats.collections}
                  onClear={() => clearTable("collections")}
                  icon={<Database size={18} />}
                />
                <StatItem
                  label="問題"
                  count={stats.questions}
                  onClear={() => clearTable("questions")}
                  icon={<HardDrive size={18} />}
                />
                <StatItem
                  label="プロフィール"
                  count={stats.profiles}
                  onClear={() => clearTable("profiles")}
                  icon={<RefreshCw size={18} />}
                />
                <StatItem
                  label="未送信アクション"
                  count={stats.pendingActions}
                  onClear={() => clearTable("pendingActions")}
                  critical={stats.pendingActions > 0}
                  icon={<RefreshCw size={18} />}
                />
              </Stack>

              <View className="pt-4 border-t border-surface-muted">
                <Button
                  variant="outline"
                  color="danger"
                  className="w-full"
                  onClick={clearAll}
                >
                  <Trash2 size={18} className="mr-2" />
                  すべてのキャッシュをクリア
                </Button>
              </View>
            </Stack>
          </Card>

          <View className="bg-brand-primary/10 p-4 rounded-lg border border-brand-primary/20">
            <Text variant="xs" color="primary" weight="bold">
              Tips:
              開発中のテストでデータが不整合になった場合や、ストレージ容量を節約したい場合に実行してください。
            </Text>
          </View>
        </Stack>
      </Container>
    </View>
  );
}

function StatItem({
  label,
  count,
  onClear,
  icon,
  critical = false,
}: {
  label: string;
  count: number;
  onClear: () => void;
  icon: React.ReactNode;
  critical?: boolean;
}) {
  return (
    <Flex
      justify="between"
      align="center"
      className="p-3 bg-surface-muted rounded-lg border border-surface-muted"
    >
      <Flex gap="sm" align="center">
        <View className={critical ? "text-brand-danger" : "text-brand-primary"}>
          {icon}
        </View>
        <Stack gap="none">
          <Text weight="bold">{label}</Text>
          <Text variant="xs" color="secondary">
            {count} 件保存済み
          </Text>
        </Stack>
      </Flex>
      <Button variant="ghost" color="danger" size="sm" onClick={onClear}>
        削除
      </Button>
    </Flex>
  );
}
