import { ColorKey, ColorMap } from '../style/colorStyle';

// 共通のベースマップ
export const defaultColorMap: ColorMap = {
  [ColorKey.Base]: {
    bg: { default: 'bg-white', hover: 'hover:bg-gray-100' },
    label: { default: 'text-gray-900' },
    border: { default: 'border-gray-300' },
    ring: { focus: 'ring-gray-200' },
  },
  [ColorKey.Primary]: {
    bg: {
      default: 'bg-sky-500',
      hover: 'hover:bg-sky-700',
      active: 'bg-sky-100',
      loading: 'bg-sky-300',
    },
    label: { default: 'text-white' },
    border: {
      default: 'border-sky-500',
      hover: 'border-sky-600',
      active: 'border-sky-700',
    },
    ring: { focus: 'focus:ring-sky-300 focus:ring-2' },
  },
  [ColorKey.Secondary]: {
    bg: {
      default: 'bg-gray-100',
      hover: 'hover:bg-gray-200',
      active: 'bg-gray-300',
    },
    label: { default: 'text-gray-800' },
    border: { default: 'border-gray-300' },
    ring: { focus: 'ring-gray-300' },
  },
  [ColorKey.Danger]: {
    bg: {
      default: 'bg-red-500',
      hover: 'hover:bg-red-600',
      active: 'bg-red-700',
      loading: 'bg-red-300',
    },
    label: { default: 'text-white' },
    border: {
      default: 'border-red-500',
      hover: 'border-red-600',
      active: 'border-red-700',
    },
    ring: { focus: 'ring-red-300' },
  },
  [ColorKey.Success]: {
    bg: {
      default: 'bg-emerald-500',
      hover: 'hover:bg-emerald-600',
      active: 'bg-emerald-700',
      loading: 'bg-emerald-300',
    },
    label: { default: 'text-white' },
    border: {
      default: 'border-emerald-500',
      hover: 'border-emerald-600',
      active: 'border-emerald-700',
    },
    ring: { focus: 'ring-emerald-300' },
  },
};

// 1. Text（表示専用テキスト、装飾用）
export const textColorMap: ColorMap = {
  [ColorKey.Base]: {
    label: { default: 'text-gray-800' },
  },
  [ColorKey.Primary]: {
    label: { default: 'text-sky-600', hover: 'hover:text-sky-700' },
  },
  [ColorKey.Secondary]: {
    label: { default: 'text-gray-400', hover: 'hover:text-gray-700' },
  },
  [ColorKey.Danger]: {
    label: { default: 'text-red-600', hover: 'hover:text-red-700' },
  },
  [ColorKey.Success]: {
    label: { default: 'text-emerald-600', hover: 'hover:text-emerald-700' },
  },
};

export const labelTextColorMap: ColorMap = {
  ...defaultColorMap,
  [ColorKey.Primary]: {
    label: { default: 'text-sky-600', hover: 'hover:text-sky-700' },
    bg: { hover: 'hover:bg-sky-100' },
  },
  [ColorKey.Secondary]: {
    label: { default: 'text-gray-600', hover: 'hover:text-gray-700' },
    bg: { hover: 'hover:bg-gray-100' },
  },
  [ColorKey.Danger]: {
    label: { default: 'text-red-600', hover: 'hover:text-red-700' },
    bg: { hover: 'hover:bg-red-100' },
  },
  [ColorKey.Success]: {
    label: { default: 'text-emerald-600', hover: 'hover:text-emerald-700' },
    bg: { hover: 'hover:bg-emerald-100' },
  },
};

export const labelBgColorMap: ColorMap = {
  ...defaultColorMap,

  [ColorKey.Primary]: {
    bg: { default: 'bg-sky-500', hover: 'hover:bg-sky-600' }, // 少し濃く
    label: { default: 'text-white' },
  },
  [ColorKey.Secondary]: {
    bg: { default: 'bg-gray-500', hover: 'hover:bg-gray-600' }, // さらに濃く
    label: { default: 'text-white' },
  },
  [ColorKey.Danger]: {
    bg: { default: 'bg-red-500', hover: 'hover:bg-red-600' },
    label: { default: 'text-white' },
  },
  [ColorKey.Success]: {
    bg: { default: 'bg-emerald-500', hover: 'hover:bg-emerald-600' },
    label: { default: 'text-white' },
  },
};

// 4. Input（TextInputなど）
export const inputColorMap: ColorMap = {
  ...defaultColorMap,
  [ColorKey.Base]: {
    bg: { default: 'bg-white', hover: 'hover:bg-gray-50' },
    label: { default: 'text-gray-900' },
    border: {
      default: 'border-gray-300',
      focus: 'border-sky-500',
    },
    ring: { focus: 'ring-sky-300' },
  },
  [ColorKey.Danger]: {
    border: { default: 'border-red-500' },
    ring: { focus: 'ring-red-300' },
  },
};

// 5. Card（ボックス・囲い）
export const cardColorMap: ColorMap = {
  ...defaultColorMap,
  [ColorKey.Base]: {
    bg: { default: 'bg-white' },
    border: { default: 'border-gray-200' },
  },
  [ColorKey.Primary]: {
    bg: { default: 'bg-sky-300', hover: 'hover:bg-sky-500' },
    border: { default: 'border-sky-400' },
  },
  [ColorKey.Secondary]: {
    bg: { default: 'bg-gray-50' },
    border: { default: 'border-gray-600' },
  },
  [ColorKey.Success]: {
    bg: { default: 'bg-emerald-50' },
  },
  [ColorKey.Danger]: {
    bg: { default: 'bg-red-50' },
  },
};

// 6. Page（背景・ページ全体）
export const pageColorMap: ColorMap = {
  ...defaultColorMap,
  [ColorKey.Base]: {
    bg: { default: 'bg-gradient-to-bl from-sky-50 to-sky-100' },
  },
  [ColorKey.Danger]: {
    bg: { default: 'bg-gradient-to-bl from-red-50 to-red-100' },
  },
  [ColorKey.Success]: {
    bg: { default: 'bg-gradient-to-bl from-emerald-50 to-emerald-100' },
  },
};

export const headerColorMap: ColorMap = {
  [ColorKey.Base]: {
    bg: { default: 'bg-gray-800', hover: 'hover:bg-gray-700' },
    label: { default: 'text-white' },
  },
  [ColorKey.Primary]: {
    bg: { default: 'bg-blue-600', hover: 'hover:bg-blue-700' },
    label: { default: 'text-white' },
  },
  [ColorKey.Secondary]: {
    bg: { default: 'bg-gray-600', hover: 'hover:bg-gray-700' },
    label: { default: 'text-white' },
  },
  [ColorKey.Danger]: {
    bg: { default: 'bg-red-600', hover: 'hover:bg-red-700' },
    label: { default: 'text-white' },
  },
  [ColorKey.Success]: {
    bg: { default: 'bg-emerald-600', hover: 'hover:bg-emerald-700' },
    label: { default: 'text-white' },
  },
};

export const sideMenuColorMap: ColorMap = {
  [ColorKey.Base]: {
    bg: { default: 'bg-gray-900', hover: 'hover:bg-gray-800' },
    label: { default: 'text-white' },
  },
  [ColorKey.Primary]: {
    bg: { default: 'bg-blue-700', hover: 'hover:bg-blue-800' },
    label: { default: 'text-blue-300', hover: 'hover:text-blue-400' },
  },
  [ColorKey.Secondary]: {
    bg: { default: 'bg-gray-700', hover: 'hover:bg-gray-800' },
    label: { default: 'text-gray-300', hover: 'hover:text-gray-400' },
  },
  [ColorKey.Danger]: {
    bg: { default: 'bg-red-700', hover: 'hover:bg-red-800' },
    label: { default: 'text-red-300', hover: 'hover:text-red-400' },
  },
  [ColorKey.Success]: {
    bg: { default: 'bg-emerald-700', hover: 'hover:bg-emerald-800' },
    label: { default: 'text-white' },
  },
};
