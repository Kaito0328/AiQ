import clsx from 'clsx';
import { RoundKey, RoundMap } from './rounded';
import { getSizeClass, SizeMap, SizeStyle } from './size';
import { getColorClass, ColorStyle, ColorMap } from './colorStyle';
import { getShadowClasses, ShadowMap, ShadowStyle } from './shadow';
import { FontWeightKey, FontWeightMap } from './fontWeight';
import { defaultColorMap } from '../styleMap/colorMap';
import { defaultSizeStyleMap } from '../styleMap/sizeMap';
import { defaultRoundMap } from '../styleMap/roundMap';
import { defaultShadowMap } from '../styleMap/shadowMap';
import { defaultFontWeightMap } from '../styleMap/fontWeightMap';

export type ComponentStyle = {
  color: ColorStyle;
  size: SizeStyle;
  roundKey?: RoundKey;
  shadow?: ShadowStyle;
  fontWeightKey?: FontWeightKey;
};

export type PartialComponentStyle = {
  color?: Partial<ColorStyle>;
  size?: Partial<SizeStyle>;
  roundKey?: RoundKey;
  shadow?: Partial<ShadowStyle>;
  fontWeightKey?: FontWeightKey;
};

export type StyleMaps = {
  colorMap: ColorMap;
  sizeMap: SizeMap;
  roundMap: RoundMap;
  shadowMap: ShadowMap;
  fontWeightMap: FontWeightMap;
};

const defaultMaps: StyleMaps = {
  colorMap: defaultColorMap,
  sizeMap: defaultSizeStyleMap,
  roundMap: defaultRoundMap,
  shadowMap: defaultShadowMap,
  fontWeightMap: defaultFontWeightMap,
};

export const mergeStyle = (
  defaultStyle: ComponentStyle,
  style?: PartialComponentStyle,
): ComponentStyle => {
  return {
    color: style?.color
      ? {
          colorKey: style.color.colorKey ?? defaultStyle.color.colorKey,
          properties: style.color.properties ?? defaultStyle.color.properties,
          variants: style.color.variants ?? defaultStyle.color.variants,
        }
      : defaultStyle.color,

    size: style?.size
      ? {
          sizeKey: style.size.sizeKey ?? defaultStyle.size.sizeKey,
          properties: style.size.properties ?? defaultStyle.size.properties,
          full_width: style.size.full_width ?? defaultStyle.size.full_width,
        }
      : defaultStyle.size,

    roundKey: style?.roundKey ?? defaultStyle.roundKey,

    shadow: style?.shadow
      ? defaultStyle.shadow && {
          shadowKey: style.shadow.shadowKey ?? defaultStyle.shadow?.shadowKey,
          variants: style.shadow.variants ?? defaultStyle.shadow?.variants,
        }
      : defaultStyle.shadow,

    fontWeightKey: style?.fontWeightKey ?? defaultStyle.fontWeightKey,
  };
};

export const getClassByStyle = (
  maps: Partial<StyleMaps>,
  defaultStyle: ComponentStyle,
  style?: PartialComponentStyle,
): string => {
  const classes: string[] = [];
  const mergedStyle = mergeStyle(defaultStyle, style);
  const colorClass = getColorClass(maps.colorMap ?? defaultMaps.colorMap, mergedStyle.color);
  if (colorClass) classes.push(colorClass);
  const sizeClass = getSizeClass(maps.sizeMap ?? defaultMaps.sizeMap, mergedStyle.size);
  if (sizeClass) classes.push(sizeClass);
  const roundClass = mergedStyle.roundKey
    ? (maps.roundMap ?? defaultMaps.roundMap)[mergedStyle.roundKey]
    : '';
  if (roundClass) classes.push(roundClass);
  const shadowClass = mergedStyle.shadow
    ? getShadowClasses(maps.shadowMap ?? defaultMaps.shadowMap, mergedStyle.shadow)
    : '';
  if (shadowClass) classes.push(shadowClass);
  const fontWeightClass = mergedStyle.fontWeightKey
    ? (maps.fontWeightMap ?? defaultMaps.fontWeightMap)[mergedStyle.fontWeightKey]
    : '';
  if (fontWeightClass) classes.push(fontWeightClass);

  return clsx(classes);
};
