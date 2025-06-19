import React from "react";
import CancelButton from "../../LearningItem/common/Button/CancelButton";
import LoadingButton from "../../common/button/LoadingButton";
import { ColorKey } from "../../../style/colorStyle";

type Props = {
  onCancel: () => void;
  onConfirm: () => void;
  loading: boolean;
};

const ModalActionButtons: React.FC<Props> = ({ onCancel, onConfirm, loading }) => {
  return (
    <div className="flex justify-center gap-3">
      {!loading && 
        <CancelButton
          onCancel={onCancel}
        />
      }
      <LoadingButton
        loading={loading}
        loadingText="問題を取得中"
        label="クイズを開始"
        onClick={onConfirm}
        bg_color={true}
        style={{
          colorKey: ColorKey.Primary,
        }}
      />
    </div>
  );
};

export default ModalActionButtons;
