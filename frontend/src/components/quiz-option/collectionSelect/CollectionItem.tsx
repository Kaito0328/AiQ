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
import { CoreColorKey } from "../../../style/colorStyle";

type Props = {
  collection: Collection;
  onSelectChange: () => void;
  selected: boolean;
  navigateCollectionPage: () => void;
};

const CollectionItem: React.FC<Props> = ({
  collection,
  onSelectChange,
  selected,
  navigateCollectionPage,
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
            <input
            type="checkbox"
            checked={selected}
            onClick={(onSelectChange)}

            className="mr-2"
            />
            <BaseLabel
                icon={<FaBook/>}
                label={collection.name}
                style={{
                  color: {
                    colorKey: CoreColorKey.Primary,
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
                    colorKey: CoreColorKey.Primary
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
