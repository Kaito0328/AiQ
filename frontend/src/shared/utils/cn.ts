import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * クラス名を結合し、Tailwind CSS の競合を解決します。
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
