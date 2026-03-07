"use client"
import { logger } from '@/src/shared/utils/logger';

import React from 'react';
import * as Icons from 'lucide-react';
import { LucideProps } from 'lucide-react';
import { cn } from '@/src/shared/utils/cn';

/**
 * アプリケーション内で使用するアイコンの定義。
 * 意味的な名前（battle, quiz等）を Lucide アイコンにマッピングします。
 */
export const iconMap = {
    // Main Concepts
    battle: Icons.Swords,
    casualQuiz: Icons.Play,
    rankingQuiz: Icons.Trophy,
    collection: Icons.BookOpen,
    collectionSet: Icons.Layers,
    user: Icons.User,
    users: Icons.Users,
    timeline: Icons.Rss,

    // Actions & Navigation
    plus: Icons.Plus,
    x: Icons.X,
    check: Icons.Check,
    copy: Icons.Copy,
    search: Icons.Search,
    settings: Icons.Settings,
    play: Icons.PlayCircle,
    back: Icons.ArrowLeft,
    forward: Icons.ArrowRight,
    edit: Icons.Edit2,
    delete: Icons.Trash2,
    import: Icons.Download,
    export: Icons.Upload,
    share: Icons.Share2,
    filter: Icons.Filter,

    // Status
    correct: Icons.CheckCircle2,
    incorrect: Icons.XCircle,
    info: Icons.Info,
    warning: Icons.AlertTriangle,
    error: Icons.AlertCircle,
    loading: Icons.Loader2,
    host: Icons.Shield,
    globe: Icons.Globe,
    lock: Icons.Lock,

    // Social
    follow: Icons.UserPlus,
    unfollow: Icons.UserMinus,
    heart: Icons.Heart,
} as const;

export type IconName = keyof typeof iconMap;

interface IconProps extends LucideProps {
    name: IconName;
    className?: string;
    size?: number | string;
}

/**
 * 共通アイコンコンポーネント。
 */
export const Icon = React.forwardRef<SVGSVGElement, IconProps>(
    ({ name, className, size = 18, ...props }, ref) => {
        const LucideIcon = iconMap[name];

        if (!LucideIcon) {
            logger.warn(`Icon "${name}" not found in iconMap`);
            return null;
        }

        return (
            <LucideIcon
                ref={ref}
                size={size}
                className={cn(name === 'loading' && 'animate-spin', className)}
                {...props}
            />
        );
    }
);

Icon.displayName = 'Icon';
