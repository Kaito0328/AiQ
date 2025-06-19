import clsx from 'clsx';

export enum ColorKey {
  Base = 'base',
  Primary = 'primary',
  Secondary = 'secondary',
  Danger = 'danger',
  Success = 'success',
}

export enum ColorPropertyKey {
  Bg = 'bg',
  Label = 'label',
  Border = 'border',
  Ring = 'ring',
}

// 状態（バリアント）キー
export enum ColorVariantKey {
  Default = 'default',
  Hover = 'hover',
  Active = 'active',
  Focus = 'focus',
  Loading = 'loading',
}

export type ColorVariant = Partial<Record<ColorVariantKey, string>>;

// ボタンなどインタラクティブ要素用のカラーセット
export type ColorSlot = Partial<Record<ColorPropertyKey, ColorVariant>>;

export type ColorMap = Record<ColorKey, ColorSlot>;

export type ColorStyle = {
  colorKey: ColorKey;
  properties: ColorPropertyKey[];
  variants?: ColorVariantKey[];
};

export const getColorClass = (map: ColorMap, style: ColorStyle): string => {
  const slot = map[style.colorKey];
  if (!slot) return '';

  const allVariants: (ColorVariantKey | 'default')[] = style.variants
    ? ['default', ...style.variants]
    : ['default'];
  const classes: string[] = [];

  for (const prop of style.properties) {
    const variantColor = slot[prop];
    if (!variantColor) continue;

    for (const variant of allVariants) {
      const className = variantColor[variant];
      if (className) {
        classes.push(className);
      }
    }
  }

  // Property による追加クラス
  if (style.properties?.includes(ColorPropertyKey.Border)) {
    classes.push('border');
  }

  // Variant による追加クラス
  if (style.variants?.includes(ColorVariantKey.Focus)) {
    if (style.properties?.includes(ColorPropertyKey.Ring)) {
      classes.push('focus:ring');
    }
    classes.push('focus:outline-none');
  }

  return clsx(classes);
};
