/**
 * デザインシステム全体で共有される「キー（枠組み）」の定義です。
 * 名前の不一致を防ぎ、IntelliSense による予測可能性を向上させます。
 */

/** ブランドカラーのキー */
export type BrandColorKey = 'primary' | 'secondary' | 'danger' | 'success' | 'heart' | 'warning' | 'info';

/** 表面（背景）色のキー */
export type SurfaceColorKey = 'transparent' | 'base' | 'muted' | 'card' | 'primary' | 'secondary' | 'danger' | 'success' | 'heart' | 'warning' | 'info';

/** テキスト色のキー（ブランドカラー + 基本色） */
export type TextColorKey = 'default' | 'primary' | 'secondary' | 'danger' | 'success' | 'muted' | 'white' | 'inherit' | 'warning' | 'info';

/** 余白（Padding, Gap など）のキー */
export type SpacingKey = 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** 角丸のキー */
export type RadiusKey = 'none' | 'sm' | 'md' | 'lg' | 'full';

/** 影のキー */
export type ShadowKey = 'none' | 'sm' | 'md' | 'lg';

/** フォントウェイトのキー */
export type FontWeightKey = 'light' | 'normal' | 'medium' | 'semibold' | 'bold';

/** テキスト配置のキー */
export type TextAlignKey = 'left' | 'center' | 'right';

/** Z-Index（重なり順）のキー */
export type ZIndexKey = 'hide' | 'auto' | 'base' | 'docked' | 'dropdown' | 'sticky' | 'banner' | 'overlay' | 'modal' | 'popover' | 'tooltip';

/** アニメーション（Transition）のキー */
export type AnimationKey = 'none' | 'fast' | 'normal' | 'slow';
