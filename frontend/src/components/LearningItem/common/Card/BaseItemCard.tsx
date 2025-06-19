import React, { PropsWithChildren } from "react";
import ErrorMessageList from "../../../common/error/ErrorMessageList";
import { ErrorCode } from "../../../../types/error";
import UnsavedIcon from "../Icon/UnSavedIcon";
import { SizeKey } from "../../../../style/size";
import { RoundKey } from "../../../../style/rounded";
import BaseCard from "../../../containerComponents/BaseCard";
import { ShadowKey } from "../../../../style/shadow";
import { ColorKey } from "../../../../style/colorStyle";
interface Props {
  isSaved: boolean;
  errorMessages: ErrorCode[];
  colorKey?: ColorKey;
}

const BaseItemCard: React.FC<PropsWithChildren<Props>> = ({
    isSaved,
    errorMessages,
    colorKey = ColorKey.Base,
    children,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex items-center">
        {!isSaved && 
          <div className="mr-2">
            <UnsavedIcon />
          </div>
        }
        <BaseCard
          style={{
            color: {
              colorKey: colorKey
            },
            size: {
              sizeKey: SizeKey.MD
            },
            roundKey: RoundKey.Md,
            shadow: {
              shadowKey: ShadowKey.SM
            }
          }}
        >
          {children}
        </BaseCard>
      </div>

      <ErrorMessageList errorMessages={errorMessages} />
    </div>
  );
};

export default BaseItemCard;