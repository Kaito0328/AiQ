import clsx from 'clsx';

// 影の強さ
export enum ShadowKey {
  None = 'none',
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
}

// 今回は hover のみ対象
export enum ShadowVariantKey {
  Hover = 'hover',
}

// shadow クラス生成用オプション
export type ShadowStyle = {
  shadowKey: ShadowKey;
  variants?: ShadowVariantKey[];
};

export type ShadowVariant = {
  default: string;
} & Partial<Record<ShadowVariantKey, string>>;

export type ShadowMap = Record<ShadowKey, ShadowVariant>;

export const getShadowClasses = (map: ShadowMap, style: ShadowStyle): string => {
  const classes: string[] = [];

  const shadow = map[style.shadowKey];
  if (!shadow) return '';

  type AllVariantKeys = 'default' | ShadowVariantKey;
  const allVariants: AllVariantKeys[] = style.variants
    ? ['default', ...style.variants]
    : ['default'];

  for (const variant of allVariants) {
    const className = shadow[variant];
    if (className) {
      classes.push(className);
    }
  }

  return clsx(classes);
};
