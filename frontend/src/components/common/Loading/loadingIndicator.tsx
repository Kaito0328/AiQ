// components/common/LoadingIndicator.tsx
import React from "react";
import { FaSpinner } from "react-icons/fa";
import BaseLabel from "../..//baseComponents/BaseLabel";
import { ColorKey } from "../../../style/colorStyle";
import { SizeKey } from "../../../style/size";

interface LoadingIndicatorProps {
  text?: string;
  colorKey?: ColorKey;
  sizeKey?: SizeKey;
}

const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  text = "読み込み中…",
  colorKey = ColorKey.Primary,
  sizeKey = SizeKey.LG,
}) => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-8">
      <div className="animate-spin">
        <BaseLabel
            icon={<FaSpinner/>}
            style={{
                color: {
                    colorKey: colorKey
                },
                size: {
                    sizeKey: sizeKey
                }
            }}
        />
      </div>

      <BaseLabel
        label={text}
        style={{
          color: { colorKey },
          size: { sizeKey },
        }}
      />
    </div>
  );
};

export default LoadingIndicator;
