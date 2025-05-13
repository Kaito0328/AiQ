// colorMap.ts

export enum ThemeColor {
  Indigo = 'indigo',
  Emerald = 'emerald',
  Gray = 'gray',
  Red = 'red',
  White = 'white',
}

export type ThemeColorClass = {
  base: string;
  hover?: string;
  text?: string;
};

export const colorMap: Record<ThemeColor, ThemeColorClass> = {
  [ThemeColor.Indigo]: {
    base: 'bg-indigo-600',
    hover: 'hover:bg-indigo-700',
    text: 'text-white',
  },
  [ThemeColor.Emerald]: {
    base: 'bg-emerald-600',
    hover: 'hover:bg-emerald-700',
    text: 'text-white',
  },
  [ThemeColor.Gray]: {
    base: 'bg-gray-600',
    hover: 'hover:bg-gray-700',
    text: 'text-white',
  },
  [ThemeColor.Red]: {
    base: 'bg-red-600',
    hover: 'hover:bg-red-700',
    text: 'text-white',
  },
  [ThemeColor.White]: {
    base: 'bg-white',
    hover: 'hover:bg-purple-100',
    text: 'text-purple-600',
  },
};

export const collectionSetColor = colorMap[ThemeColor.Emerald];
export const collectionColor = colorMap[ThemeColor.Indigo];
export const questionColor = colorMap[ThemeColor.Red];
