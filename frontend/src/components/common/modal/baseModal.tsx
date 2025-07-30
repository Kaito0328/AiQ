// components/common/modal/BaseModal.tsx
import React, { PropsWithChildren } from "react";
import BaseButton from "../button/BaseButton";
import { CoreColorKey } from "../../../style/colorStyle";
import BaseCard from "../../containerComponents/BaseCard";
import BaseLabel from "../../baseComponents/BaseLabel";
import { SizeKey } from "../../../style/size";
import { FontWeightKey } from "../../../style/fontWeight";
import LoadingButton from "../button/LoadingButton";

interface BaseModalProps {
  title?: string;
  onClose: () => void;
  onConfirm: () => void;
    loading?: boolean;
  confirmButtonText?: string;
  loadingConfirmButtonText?: string;
}

const BaseModal: React.FC<PropsWithChildren<BaseModalProps>> = ({
  title,
  onClose,
  onConfirm,
  loading = false,
  confirmButtonText = "決定",
  loadingConfirmButtonText = "ローディング...",
  children,
}) => {
  return (
    <>
    <div
        className="fixed inset-0 bg-black opacity-60 backdrop-blur-sm z-40"
        onClick={onClose}
    />

    <div className=" inset-0 flex justify-center items-center fixed z-50">
        <div className="w-[90%] max-w-[600px]">
          <BaseCard
            style={{
                size: {sizeKey: SizeKey.XL}
            }}
          >
        <div>
                    {title && (
                    <BaseLabel
                        label={title}
                        style={{
                            size: {
                                sizeKey: SizeKey.XL
                            },
                            fontWeightKey: FontWeightKey.Bold
                        }}
                        center={true}
                        
                    />
                    )}
                    {children}
                    <div className="flex  flex-col  items-center justify-center mt-4">
                        <div className="w-[30%] space-y-3">
                            <LoadingButton
                                loading={loading}
                                loadingText={loadingConfirmButtonText}
                                onClick={onConfirm}
                                style={{
                                    colorKey: loading? CoreColorKey.Secondary : CoreColorKey.Success,
                                    size: {full_width: true}
                                }}
                                bg_color={true}
                                label={confirmButtonText}
                            />
                            <BaseButton
                                onClick={onClose}
                                style={{
                                    color: {colorKey: CoreColorKey.Secondary},
                                    size: {full_width: true}
                                }}
                                bg_color={true}
                                label="閉じる"
                            />

                        </div>
                        
                    </div>
                </div>
          </BaseCard>
        </div>
      </div>
    </>
        
  );
};

export default BaseModal;
