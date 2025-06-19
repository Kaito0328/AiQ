import React from "react";
import BaseLabel from "../../baseComponents/BaseLabel";
import { FaBook } from "react-icons/fa";
import { SizeKey } from "../../../style/size";
import { ColorKey } from "../../../style/colorStyle";
import { FontWeightKey } from "../../../style/fontWeight";
import DeleteButton from "../../LearningItem/common/Button/DeleteButton";

type Props = {
  name: string;
  onRemove: () => void;
};

const SelectedCollectionItem: React.FC<Props> = ({ name, onRemove }) => {
  return (
    <div className="flex items-center justify-between">
      <BaseLabel
        icon={<FaBook />}
        label={name}
        style={{
          color: { colorKey: ColorKey.Primary },
          size: { sizeKey: SizeKey.MD },
          fontWeightKey: FontWeightKey.Normal,
        }}
      />
        <DeleteButton
            onDelete={onRemove}
        />
    </div>
  );
};

export default SelectedCollectionItem;
