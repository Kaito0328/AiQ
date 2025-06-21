import React from "react";
import clsx from "clsx";
import { ColorKey } from "../../style/colorStyle";
import { SizeKey } from "../../style/size";
import { RoundKey } from "../../style/rounded";

type ProgressBarStyle = {
  colorKey: ColorKey;
  sizeKey: SizeKey;
  roundKey: RoundKey;
};

const defaultStyle: ProgressBarStyle = {
  colorKey: ColorKey.Primary,
  sizeKey: SizeKey.MD,
  roundKey: RoundKey.Full,
};

const ProgressBarColorMap: Record<ColorKey, { track: string; bar: string }> = {
  [ColorKey.Base]: {
    track: "bg-gray-200",
    bar: "bg-gray-400",
  },
  [ColorKey.Primary]: {
    track: "bg-blue-100",
    bar: "bg-blue-500",
  },
  [ColorKey.Secondary]: {
    track: "bg-gray-300",
    bar: "bg-gray-600",
  },
  [ColorKey.Danger]: {
    track: "bg-red-100",
    bar: "bg-red-500",
  },
  [ColorKey.Success]: {
    track: "bg-green-100",
    bar: "bg-green-500",
  },
};

const ProgressBarHeightMap: Record<SizeKey, string> = {
  [SizeKey.SM]: "h-1.5",
  [SizeKey.MD]: "h-2",
  [SizeKey.LG]: "h-3",
  [SizeKey.XL]: "h-4",
};

const ProgressBarRoundMap: Record<RoundKey, string> = {
  [RoundKey.Sm]: "rounded-sm",
  [RoundKey.Md]: "rounded-md",
  [RoundKey.Lg]: "rounded-lg",
  [RoundKey.Full]: "rounded-full",
};

interface ProgressBarProps {
  value: number; // 0 ~ 100
  style?: Partial<ProgressBarStyle>;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ value, style }) => {
  const mergedStyle: ProgressBarStyle = {
    ...defaultStyle,
    ...style,
  };

  const { track, bar } = ProgressBarColorMap[mergedStyle.colorKey];
  const height = ProgressBarHeightMap[mergedStyle.sizeKey];
  const round = ProgressBarRoundMap[mergedStyle.roundKey];

  return (
    <div className={clsx("w-full", height, round, track, "overflow-hidden")}>
      <div
        className={clsx("h-full", bar, "transition-all duration-500")}
        style={{ width: `${value}%` }}
      />
    </div>
  );
};

export default ProgressBar;
