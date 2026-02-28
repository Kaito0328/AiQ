import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { Button } from '@/src/design/baseComponents/Button';
import { useTheme } from '@/src/shared/contexts/ThemeContext';
import { Flex } from '@/src/design/primitives/Flex';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // 次のテーマを決定するためのサイクル
    const toggle = () => {
        if (theme === 'light') setTheme('dark');
        else setTheme('light');
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={toggle}
            className="p-2 h-auto hover:bg-surface-muted transition-colors rounded-lg flex items-center justify-center"
            aria-label="Toggle theme"
        >
            <Flex align="center" justify="center" className="relative w-6 h-6">
                {!mounted ? (
                    <div className="w-5 h-5 bg-surface-muted rounded-full animate-pulse" />
                ) : theme === 'light' ? (
                    <Sun size={20} className="text-amber-500 transition-all scale-100 rotate-0" />
                ) : (
                    <Moon size={20} className="text-indigo-400 transition-all scale-100 rotate-0" />
                )}
            </Flex>
        </Button>
    );
}
