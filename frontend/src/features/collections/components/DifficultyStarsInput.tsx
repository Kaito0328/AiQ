"use client";

import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/src/shared/utils/cn";
import { Flex } from "@/src/design/primitives/Flex";

interface DifficultyStarsInputProps {
  value: number;
  onChange: (value: number) => void;
  size?: number;
}

export function DifficultyStarsInput({
  value,
  onChange,
  size = 20,
}: DifficultyStarsInputProps) {
  const normalized = Math.max(1, Math.min(5, value));

  return (
    <Flex gap="xs" align="center" className="flex-nowrap">
      {Array.from({ length: 5 }).map((_, index) => {
        const starLevel = index + 1;
        const filled = starLevel <= normalized;

        return (
          <button
            key={starLevel}
            type="button"
            onClick={() => onChange(starLevel)}
            className="p-0.5 transition-transform active:scale-90"
            title={`難易度 ${starLevel}/5`}
            aria-label={`難易度 ${starLevel}`}
          >
            <Star
              size={size}
              className={cn(
                "transition-colors",
                filled
                  ? "text-amber-400 fill-amber-400"
                  : "text-slate-300 dark:text-slate-600",
              )}
            />
          </button>
        );
      })}
    </Flex>
  );
}
