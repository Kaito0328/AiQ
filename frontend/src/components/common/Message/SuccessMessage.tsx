import React from "react";
import BaseLabel from "../../baseComponents/BaseLabel";
import { CoreColorKey, ColorPropertyKey } from "../../../style/colorStyle";
import { SizeKey } from "../../../style/size";

interface Props {
  successMessage?: string;
}

const SuccessMessage: React.FC<Props> = ({ successMessage }) => {
  if (!successMessage) return null;

  return (
    <BaseLabel
    label={successMessage}
    style={{
        color: {
        colorKey: CoreColorKey.Success,
        properties: [ColorPropertyKey.Label],
        },
        size: {
        sizeKey: SizeKey.SM,
        }
    }}
    />
  );
};

export default SuccessMessage;
