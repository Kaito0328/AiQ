import { SizeKey, SizeMap } from '../style/size';

export const defaultSizeStyleMap: SizeMap = {
  [SizeKey.SM]: {
    text: 'text-xs sm:text-sm md:text-base',
    padding: 'p-2 sm:p-3 md:p-4',
  },
  [SizeKey.MD]: {
    text: 'text-base sm:text-lg md:text-xl',
    padding: 'p-4 sm:p-5 md:p-6',
  },
  [SizeKey.LG]: {
    text: 'text-lg sm:text-xl md:text-2xl',
    padding: 'p-6 sm:p-7 md:p-8',
  },
  [SizeKey.XL]: {
    text: 'text-xl sm:text-2xl md:text-3xl',
    padding: 'p-8 sm:p-9 md:p-10',
  },
};

export const textSizeMap: SizeMap = {
  [SizeKey.SM]: {
    text: 'text-xs sm:text-sm md:text-base',
    padding: 'py-0.5 px-1 sm:py-0.5 sm:px-1.5 md:py-1 md:px-2',
  },
  [SizeKey.MD]: {
    text: 'text-sm sm:text-base md:text-lg',
    padding: 'py-1 px-1.5 sm:py-1 sm:px-2 md:py-1.5 md:px-2.5',
  },
  [SizeKey.LG]: {
    text: 'text-base sm:text-lg md:text-xl',
    padding: 'py-1 px-2 sm:py-1.5 sm:px-2.5 md:py-2 md:px-3',
  },
  [SizeKey.XL]: {
    text: 'text-lg sm:text-xl md:text-2xl',
    padding: 'py-1.5 px-3 sm:py-2 sm:px-4 md:py-2.5 md:px-5',
  },
};

export const labelSizeMap: SizeMap = {
  [SizeKey.SM]: {
    text: 'text-xs sm:text-sm md:text-base',
    padding: 'p-1 sm:p-1.5 md:p-2',
  },
  [SizeKey.MD]: {
    text: 'text-sm sm:text-base md:text-lg',
    padding: 'p-2 sm:p-2.5 md:p-3',
  },
  [SizeKey.LG]: {
    text: 'text-base sm:text-lg md:text-xl',
    padding: 'p-3 sm:p-3.5 md:p-4',
  },
  [SizeKey.XL]: {
    text: 'text-3xl sm:text-4xl md:text-5xl',
    padding: 'p-4 sm:p-5 md:p-6',
  },
};

export const sectionCardSizeMap: SizeMap = {
  [SizeKey.SM]: {
    text: 'text-sm sm:text-base md:text-lg',
    padding: 'p-3 sm:p-4 md:p-5',
  },
  [SizeKey.MD]: {
    text: 'text-base sm:text-lg md:text-xl',
    padding: 'p-5 sm:p-6 md:p-7',
  },
  [SizeKey.LG]: {
    text: 'text-lg sm:text-xl md:text-2xl',
    padding: 'p-7 sm:p-8 md:p-9',
  },
  [SizeKey.XL]: {
    text: 'text-xl sm:text-2xl md:text-3xl',
    padding: 'p-9 sm:p-10 md:p-11',
  },
};

export const cardSizeMap: SizeMap = {
  [SizeKey.SM]: {
    text: 'text-xs sm:text-sm md:text-base',
    padding: 'p-1 sm:p-1.5 md:p-2',
  },
  [SizeKey.MD]: {
    text: 'text-sm sm:text-base md:text-lg',
    padding: 'p-2 sm:p-2.5 md:p-3',
  },
  [SizeKey.LG]: {
    text: 'text-base sm:text-lg md:text-xl',
    padding: 'p-3 sm:p-3.5 md:p-4',
  },
  [SizeKey.XL]: {
    text: 'text-lg sm:text-xl md:text-2xl',
    padding: 'p-4 sm:p-5 md:p-6',
  },
};

export const pageSizeMap: SizeMap = {
  [SizeKey.SM]: {
    padding: 'p-1 sm:p-2 md:p-3',
  },
  [SizeKey.MD]: {
    padding: 'p-2 sm:p-3 md:p-4',
  },
  [SizeKey.LG]: {
    padding: 'p-3 sm:p-4 md:p-5',
  },
  [SizeKey.XL]: {
    padding: 'p-4 sm:p-5 md:p-6',
  },
};

export const headerSizeMap: SizeMap = {
  [SizeKey.SM]: {
    text: 'text-sm sm:text-base md:text-lg',
    padding: 'p-2 sm:p-3 md:p-4',
  },
  [SizeKey.MD]: {
    text: 'text-base sm:text-lg md:text-xl',
    padding: 'p-4 sm:p-5 md:p-6',
  },
  [SizeKey.LG]: {
    text: 'text-lg sm:text-xl md:text-2xl',
    padding: 'p-6 sm:p-7 md:p-8',
  },
  [SizeKey.XL]: {
    text: 'text-xl sm:text-2xl md:text-3xl',
    padding: 'p-8 sm:p-9 md:p-10',
  },
};

export const sideMenuSizeMap: SizeMap = {
  [SizeKey.SM]: {
    text: 'text-sm sm:text-base md:text-lg',
    padding: 'p-3 sm:p-4 md:p-5',
  },
  [SizeKey.MD]: {
    text: 'text-base sm:text-lg md:text-xl',
    padding: 'p-4 sm:p-5 md:p-6',
  },
  [SizeKey.LG]: {
    text: 'text-lg sm:text-xl md:text-2xl',
    padding: 'p-5 sm:p-6 md:p-7',
  },
  [SizeKey.XL]: {
    text: 'text-xl sm:text-2xl md:text-3xl',
    padding: 'p-6 sm:p-7 md:p-8',
  },
};
