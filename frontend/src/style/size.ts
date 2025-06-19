import clsx from 'clsx';

export type SizeStyle = {
  sizeKey: SizeKey;
  properties: SizeProperty[];
  full_width: boolean;
};

export type IconSizeStyle = {
  sizeKey: SizeKey;
  properties: IconSizeProperty[];
};

export enum SizeKey {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
}

export enum SizeProperty {
  Text = 'text',
  Padding = 'padding',
  Margin = 'margin',
  Gap = 'gap',
}

export const AllSizeProperties = [
  SizeProperty.Text,
  SizeProperty.Padding,
  SizeProperty.Margin,
  SizeProperty.Gap,
];

export type SizeMap = Record<
  SizeKey,
  {
    [SizeProperty.Text]?: string;
    [SizeProperty.Padding]?: string;
    [SizeProperty.Margin]?: string;
    [SizeProperty.Gap]?: string;
  }
>;

export enum IconSizeProperty {
  Text = 'text',
  Padding = 'padding',
}

export const AllIconSizeProperties = [IconSizeProperty.Text, IconSizeProperty.Padding];

export type IconSize = Record<IconSizeProperty, string>;
export type IconSizeMap = Record<SizeKey, IconSize>;

export const getSizeClass = (map: SizeMap, style: SizeStyle): string => {
  const size = map[style.sizeKey];
  if (!size) return '';

  const classes: string[] = [];

  for (const prop of style.properties) {
    const sizeClass = size[prop];
    if (sizeClass != undefined) classes.push(sizeClass);
  }

  if (style.full_width) {
    classes.push('w-full');
  }

  return clsx(classes);
};

export const getIconSizeClass = (map: IconSizeMap, style: IconSizeStyle): string => {
  const iconSize = map[style.sizeKey];
  if (!iconSize) return '';

  const classes: string[] = [];

  for (const prop of style.properties) {
    const sizeClass = iconSize[prop];
    if (sizeClass != undefined) classes.push(sizeClass);
  }

  return clsx(classes);
};
