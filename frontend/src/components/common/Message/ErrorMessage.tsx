import React from "react";
import BaseLabel from "../../baseComponents/BaseLabel";
import { CoreColorKey, ColorPropertyKey } from "../../../style/colorStyle";
import { SizeKey } from "../../../style/size";

interface Props {
  errorMessage?: string;
}

const ErrorMessage: React.FC<Props> = ({ errorMessage }) => {
  if (!errorMessage) return null;

  return (
    <BaseLabel
    label={errorMessage}
    style={{
        color: {
        colorKey: CoreColorKey.Danger,
        properties: [ColorPropertyKey.Label],
        },
        size: {
        sizeKey: SizeKey.SM,
        }
    }}
    />
  );
};

export default ErrorMessage;
