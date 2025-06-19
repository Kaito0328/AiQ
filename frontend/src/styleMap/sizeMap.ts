import { SizeKey, SizeMap } from '../style/size';

export const defaultSizeStyleMap: SizeMap = {
  [SizeKey.SM]: {
    text: 'text-sm',
    padding: 'p-4',
  },
  [SizeKey.MD]: {
    text: 'text-lg',
    padding: 'p-6',
  },
  [SizeKey.LG]: {
    text: 'text-xl',
    padding: 'p-8',
  },
  [SizeKey.XL]: {
    text: 'text-2xl',
    padding: 'p-10',
  },
};

export const textSizeMap: SizeMap = {
  [SizeKey.SM]: {
    text: 'text-xs',
    padding: 'py-0.5 px-1',
  },
  [SizeKey.MD]: {
    text: 'text-sm',
    padding: 'py-1 px-1.5',
  },
  [SizeKey.LG]: {
    text: 'text-lg',
    padding: 'py-1 px-2',
  },
  [SizeKey.XL]: {
    text: 'text-xl',
    padding: 'py-1.5 px-3',
  },
};

export const labelSizeMap: SizeMap = {
  [SizeKey.SM]: {
    text: 'text-sm',
    padding: 'py-1.5 px-2.5',
  },
  [SizeKey.MD]: {
    text: 'text-md',
    padding: 'py-2.5 px-3.5',
  },
  [SizeKey.LG]: {
    text: 'text-xl',
    padding: 'py-3.5 px-5',
  },
  [SizeKey.XL]: {
    text: 'text-2xl',
    padding: 'py-5 px-6',
  },
};

export const sectionCardSizeMap: SizeMap = {
  [SizeKey.SM]: {
    text: 'text-sm',
    padding: 'p-4',
  },
  [SizeKey.MD]: {
    text: 'text-lg',
    padding: 'p-6',
  },
  [SizeKey.LG]: {
    text: 'text-xl',
    padding: 'p-8',
  },
  [SizeKey.XL]: {
    text: 'text-2xl',
    padding: 'p-10',
  },
};

export const cardSizeMap: SizeMap = {
  [SizeKey.SM]: {
    text: 'text-xs',
    padding: 'p-1',
  },
  [SizeKey.MD]: {
    text: 'text-sm',
    padding: 'p-2',
  },
  [SizeKey.LG]: {
    text: 'text-base',
    padding: 'p-3',
  },
  [SizeKey.XL]: {
    text: 'text-lg',
    padding: 'p-4',
  },
};

export const pageSizeMap: SizeMap = {
  [SizeKey.SM]: {
    padding: 'p-1',
  },
  [SizeKey.MD]: {
    padding: 'p-2',
  },
  [SizeKey.LG]: {
    padding: 'p-3',
  },
  [SizeKey.XL]: {
    padding: 'p-4',
  },
};
