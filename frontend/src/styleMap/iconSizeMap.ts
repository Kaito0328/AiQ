import { IconSizeMap, SizeKey } from '../style/size';

export const defaultIconSizeMap: IconSizeMap = {
  [SizeKey.SM]: { text: 'text-2xl', padding: 'p-1' },
  [SizeKey.MD]: { text: 'text-4xl', padding: 'p-1.5' },
  [SizeKey.LG]: { text: 'text-5xl', padding: 'p-2' },
  [SizeKey.XL]: { text: 'text-6xl', padding: 'p-3' },
};

export const labelIconSizeMap: IconSizeMap = {
  [SizeKey.SM]: { text: 'text-md', padding: 'p-0' },
  [SizeKey.MD]: { text: 'text-md', padding: 'p-1' },
  [SizeKey.LG]: { text: 'text-3xl', padding: 'p-2' },
  [SizeKey.XL]: { text: 'text-5xl', padding: 'p-3' },
};
