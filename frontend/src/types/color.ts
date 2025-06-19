export type ColorKey = CoreColorKey | IconColorKey | LabelColorKey;

export enum CoreColorKey {
  Base = 'base',
  Primary = 'primary',
  Secondary = 'secondary',
  Danger = 'danger', // 削除・警告など
  Success = 'success', // 保存・成功など
}

export enum IconColorKey {
  Heart = 'heart',
  Open = 'open',
  Closed = 'closed',
  Collection = 'collection',
  CollectionSet = 'collectionSet',
  Visible = 'visible',
  Hidden = 'hidden',
  Expand = 'expand',
  Collapse = 'collapse',
  Official = 'official',
  Self = 'self',
  Users = 'users',
  UnSaved = 'unsaved',
  Eye = 'eye',
}

export enum LabelColorKey {
  Primary = 'primaryLabel',
  Secondary = 'secondaryLabel',
  Danger = 'dangerLabel',
  Success = 'successLabel',
}

export enum PropertyKey {
  Bg = 'bg',
  Label = 'label',
  Border = 'border',
  Ring = 'ring',
}

// 状態（バリアント）キー
export enum VariantKey {
  Hover = 'hover',
  Active = 'active',
  Focus = 'focus',
  Loading = 'loading',
}

export enum TextColorKey {
  Strong = 'strong',
  Base = 'base',
  Weak = 'weak',
  Disabled = 'disabled',
  Link = 'link',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Info = 'info',
}

export enum SurfaceColorKey {
  Default = 'default',
  Surface = 'surface',
  Muted = 'muted',
  Success = 'success',
  Warning = 'warning',
  Error = 'error',
  Info = 'info',
}

export type VariantColor = {
  default?: string;
} & Partial<Record<VariantKey, string>>;

// ボタンなどインタラクティブ要素用のカラーセット
export type ColorSlot = Partial<Record<PropertyKey, VariantColor>>;

// テキスト用カラー分類
export type TextColor = Record<TextColorKey, string>;

// ページ背景・表層UI用カラー分類
export type SurfaceColor = Record<SurfaceColorKey, string>;

export type ThemePalette = {
  core: Record<CoreColorKey, ColorSlot>;
  label: Record<LabelColorKey, ColorSlot>;
  text: TextColor;
  surface: SurfaceColor;
  icon: Record<IconColorKey, ColorSlot>;
};
