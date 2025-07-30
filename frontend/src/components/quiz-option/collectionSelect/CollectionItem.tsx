import React from "react";
import { Collection } from "../../../types/collection";
import {
  FaBook,
} from "react-icons/fa";
import { IoArrowRedoSharp } from "react-icons/io5";
import BaseCard from "../../containerComponents/BaseCard";
import { SizeKey } from "../../../style/size";
import BaseLabel from "../../baseComponents/BaseLabel";
import BaseButton from "../../common/button/BaseButton";
import { RoundKey } from "../../../style/rounded";
import { ColorKey } from "../../../style/colorStyle";
import BaseCheckboxInput from "../../baseComponents/BaseCheckboxInput";

type Props = {
  collection: Collection;
  onSelectChange: () => void;
  selected: boolean;
  navigateCollectionPage: () => void;
  colorKey: ColorKey;
};

const CollectionItem: React.FC<Props> = ({
  collection,
  onSelectChange,
  selected,
  navigateCollectionPage,
  colorKey,
}) => {
  return (
    <BaseCard
      style={{
        size: {
          sizeKey: SizeKey.LG
        }
      }}
    >
        <label className="flex">
          <BaseCheckboxInput
            checked={selected}
            onChange={onSelectChange}
          />
            <BaseLabel
                icon={<FaBook/>}
                label={collection.name}
                style={{
                  color: {
                    colorKey: colorKey,
                  }
                }}
            />
            <div className="ml-auto">
                <BaseButton
                icon={<IoArrowRedoSharp />}
                title="コレクションページへ"
               onClick={navigateCollectionPage}  
                style={{
                  roundKey: RoundKey.Full,
                  color: {
                    colorKey: colorKey
                  },
                  size: {
                    sizeKey: SizeKey.MD
                  },
                }}
                />
            </div>
        </label>
    </BaseCard>
  );
};

export default CollectionItem;
