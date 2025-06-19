import { ShadowKey, ShadowMap } from '../style/shadow';

export const defaultShadowMap: ShadowMap = {
  [ShadowKey.None]: {
    default: 'shadow-none',
  },
  [ShadowKey.SM]: {
    default: 'shadow-sm',
    hover: 'hover:shadow-md',
  },
  [ShadowKey.MD]: {
    default: 'shadow-md',
    hover: 'hover:shadow-lg',
  },
  [ShadowKey.LG]: {
    default: 'shadow-lg',
    hover: 'hover:shadow-xl',
  },
};
