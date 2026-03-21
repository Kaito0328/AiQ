"use client";

import React from "react";
import { View } from "@/src/design/primitives/View";
import { Stack } from "@/src/design/primitives/Stack";
import { Flex } from "@/src/design/primitives/Flex";
import { Text } from "@/src/design/baseComponents/Text";
import { Button } from "@/src/design/baseComponents/Button";
import { cn } from "@/src/shared/utils/cn";
import {
  X,
  User,
  LogOut,
  Heart,
  Settings,
  MessageSquare,
  History,
  LogIn,
  FileText,
  Cloud,
} from "lucide-react";
import { useSafeRouter } from "@/src/shared/hooks/useSafeRouter";
import { useAuth } from "@/src/shared/auth/useAuth";
import { useNetworkStatus } from "@/src/shared/contexts/NetworkStatusContext";
import {
  hasVisitedPath,
  hasVisitedUserFavorites,
} from "@/src/shared/api/routeVisit";
import { hasPendingEditRequestsCache } from "@/src/shared/api/editRequestCache";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const router = useSafeRouter();
  const { user, logout, isAuthenticated } = useAuth();
  const { isOnline } = useNetworkStatus();
  const [canOpenFavoritesOffline, setCanOpenFavoritesOffline] =
    React.useState(false);
  const [canOpenEditRequestsOffline, setCanOpenEditRequestsOffline] =
    React.useState(false);
  const [canOpenSettingsOffline, setCanOpenSettingsOffline] =
    React.useState(false);
  const [canOpenSyncOffline, setCanOpenSyncOffline] = React.useState(false);
  const [canOpenResumeOffline, setCanOpenResumeOffline] = React.useState(false);
  const [canOpenCreditsOffline, setCanOpenCreditsOffline] =
    React.useState(false);

  React.useEffect(() => {
    let cancelled = false;

    const hydrateOfflineAccess = async () => {
      if (!user?.id) {
        if (!cancelled) {
          setCanOpenFavoritesOffline(false);
          setCanOpenEditRequestsOffline(hasPendingEditRequestsCache());
        }
        return;
      }

      const [favoritesVisited, editRequestsVisited] = await Promise.all([
        hasVisitedUserFavorites(user.id),
        hasVisitedPath("/edit-requests"),
      ]);

      const [settingsVisited, syncVisited, resumeVisited, creditsVisited] =
        await Promise.all([
          hasVisitedPath("/settings"),
          hasVisitedPath("/settings/sync"),
          hasVisitedPath("/quiz/resume"),
          hasVisitedPath("/credits"),
        ]);

      if (!cancelled) {
        setCanOpenFavoritesOffline(favoritesVisited);
        setCanOpenEditRequestsOffline(
          editRequestsVisited || hasPendingEditRequestsCache(),
        );
        setCanOpenSettingsOffline(settingsVisited);
        setCanOpenSyncOffline(syncVisited);
        setCanOpenResumeOffline(resumeVisited);
        setCanOpenCreditsOffline(creditsVisited);
      }
    };

    void hydrateOfflineAccess();
    return () => {
      cancelled = true;
    };
  }, [user?.id, isOpen]);

  const handleNavigate = (path: string) => {
    onClose();

    if (!isOnline && typeof window !== "undefined") {
      window.location.assign(new URL(path, window.location.origin).toString());
      return;
    }

    router.push(path);
  };

  const handleLogout = () => {
    logout();
    onClose();
    router.push("/");
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-[100] transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={onClose}
      />

      {/* Drawer - slides from left */}
      <div
        className={cn(
          "fixed top-0 left-0 h-full w-[280px] bg-surface-card border-r border-surface-muted/50 z-[101] shadow-2xl transition-all duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <View className="h-full p-6 bg-transparent">
          <Stack gap="xl" className="h-full">
            <Flex justify="between" align="center">
              <Text variant="detail" color="secondary" weight="bold">
                AiQ MENU
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="p-1 h-auto hover:bg-surface-muted transition-colors rounded-full"
              >
                <X size={20} className="text-foreground/60" />
              </Button>
            </Flex>

            {isAuthenticated ? (
              <Stack gap="xl" className="flex-1">
                {/* Profile Section */}
                <Stack gap="md">
                  <Flex gap="md" align="center">
                    <View className="w-16 h-16 rounded-full bg-brand-primary/10 flex items-center justify-center overflow-hidden border-2 border-brand-primary/20 shrink-0">
                      {user?.iconUrl ? (
                        <View
                          as="img"
                          src={user.iconUrl}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={32} className="text-brand-primary" />
                      )}
                    </View>
                    <Stack gap="none" className="min-w-0">
                      <Text variant="h3" weight="bold" className="truncate">
                        {user?.displayName || user?.username}
                      </Text>
                      <Text variant="xs" color="secondary" className="truncate">
                        @{user?.username}
                      </Text>
                    </Stack>
                  </Flex>

                  <View className="h-px bg-surface-muted w-full" />
                </Stack>

                {/* Links Section */}
                <Stack gap="xs">
                  <MenuLink
                    icon={<User size={20} />}
                    label="プロフィール"
                    onClick={() => handleNavigate(`/users/${user?.id}`)}
                    disabled={!user?.id}
                  />
                  <MenuLink
                    icon={<Heart size={20} />}
                    label="お気に入り"
                    onClick={() =>
                      handleNavigate(`/users/${user?.id}/favorites`)
                    }
                    disabled={
                      !user?.id || (!isOnline && !canOpenFavoritesOffline)
                    }
                  />
                  <MenuLink
                    icon={<MessageSquare size={20} />}
                    label="修正依頼の管理"
                    onClick={() => handleNavigate("/edit-requests")}
                    disabled={!isOnline && !canOpenEditRequestsOffline}
                  />
                  <MenuLink
                    icon={<History size={20} />}
                    label="中断したクイズ"
                    onClick={() => handleNavigate("/quiz/resume")}
                    disabled={!isOnline && !canOpenResumeOffline}
                  />
                  <MenuLink
                    icon={<Cloud size={20} />}
                    label="同期ステータス"
                    onClick={() => handleNavigate("/settings/sync")}
                    disabled={!isOnline && !canOpenSyncOffline}
                  />
                  <MenuLink
                    icon={<Settings size={20} />}
                    label="設定"
                    onClick={() => handleNavigate("/settings")}
                    disabled={!isOnline && !canOpenSettingsOffline}
                  />
                  <MenuLink
                    icon={<FileText size={20} />}
                    label="クレジット"
                    onClick={() => handleNavigate("/credits")}
                    disabled={!isOnline && !canOpenCreditsOffline}
                  />
                </Stack>

                {/* Footer Section with Logout */}
                <View className="mt-auto pt-6 border-t border-surface-muted">
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-4 p-3 h-auto text-status-danger hover:bg-status-danger/10 group transition-all"
                    onClick={handleLogout}
                  >
                    <LogOut
                      size={20}
                      className="transition-transform group-hover:-translate-x-1"
                    />
                    <Text weight="bold">ログアウト</Text>
                  </Button>
                </View>
              </Stack>
            ) : (
              <Stack
                gap="xl"
                align="center"
                className="flex-1 justify-center py-12"
              >
                <View className="p-6 bg-brand-primary/5 rounded-full">
                  <LogIn size={48} className="text-brand-primary/40" />
                </View>
                <Stack gap="md" align="center">
                  <Text variant="detail" color="secondary" align="center">
                    全ての機能を利用するには
                    <br />
                    ログインが必要です
                  </Text>
                  <Button
                    variant="solid"
                    color="primary"
                    className="w-full px-12"
                    onClick={() => handleNavigate("/login")}
                  >
                    ログイン / 新規登録
                  </Button>
                </Stack>
              </Stack>
            )}
          </Stack>
        </View>
      </div>
    </>
  );
}

function MenuLink({
  icon,
  label,
  onClick,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      className={cn(
        "flex items-center gap-4 p-3 rounded-lg hover:bg-surface-muted transition-colors text-foreground w-full",
        disabled && "opacity-50 cursor-not-allowed",
      )}
      onClick={disabled ? undefined : onClick}
    >
      <View className={cn("text-brand-primary", disabled && "grayscale")}>
        {icon}
      </View>
      <Text weight="medium">{label}</Text>
    </button>
  );
}
