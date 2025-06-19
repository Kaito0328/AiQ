import React from "react";
import { handleAPIError } from "../../.../../../api/handleAPIError";
import { ErrorCode } from "../../../types/error";
import BaseLabel from "../../baseComponents/BaseLabel";
import { ColorKey, ColorPropertyKey } from "../../../style/colorStyle";
import { SizeKey } from "../../../style/size";

interface Props {
  errorMessages?: ErrorCode[];
}

const ErrorMessageList: React.FC<Props> = ({ errorMessages }) => {
  if (!errorMessages || errorMessages.length === 0) return null;

  return (
    <ul className="p-4 flex-column justify-center items-center space-y-1">
      {errorMessages.map((err, idx) => (
        <li key={idx} className="flex justify-center">
          <BaseLabel
            label={handleAPIError(err)}
            icon={<span>⚠️</span>}
            style={{
              color: {
                colorKey: ColorKey.Danger,
                properties: [ColorPropertyKey.Label],
              },
              size: {
                sizeKey: SizeKey.SM
              }
            }}
          />
        </li>
      ))}
    </ul>
  );
};

export default ErrorMessageList;
