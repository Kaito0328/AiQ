export enum Round {
  Sm = 'sm',
  Md = 'md',
  Lg = 'Lg',
  Full = 'full',
}

export const roundedMap = {
  [Round.Sm]: 'rounded',
  [Round.Md]: 'rounded-md',
  [Round.Lg]: 'rounded-lg',
  [Round.Full]: 'rounded-full',
};
