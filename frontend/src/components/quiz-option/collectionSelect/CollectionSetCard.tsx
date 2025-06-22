import React, { useState } from "react";
import BaseCard from "../../containerComponents/BaseCard";
import BaseLabel from "../../baseComponents/BaseLabel";
import { SizeKey } from "../../../style/size";
import { CoreColorKey } from "../../../style/colorStyle";
import { RoundKey } from "../../../style/rounded";
import { FontWeightKey } from "../../../style/fontWeight";
import { Collection } from "../../../types/collection";
import CollectionItem from "./CollectionItem";
import { IoChevronDown, IoChevronForward } from "react-icons/io5"; // アイコン例として使用
import ToggleButton from "../../common/Toggle/ToggleButton";

type Props = {
  setName: string;
  collections: Collection[];
  selectedIds: Set<number>;
  onToggleCollection: (collectionId: number) => void;
  onToggleSet: () => void;
  allSelected: boolean;
};

const CollectionSetCard: React.FC<Props> = ({
  setName,
  collections,
  selectedIds,
  onToggleCollection,
  onToggleSet,
  allSelected,
}) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleToggleVisibility = () => {
    setIsVisible((prev) => !prev);
  };

  

  return (
    <BaseCard
      style={{
        color: { colorKey: CoreColorKey.Primary, variants: [] },
        size: { sizeKey: SizeKey.LG },
        roundKey: RoundKey.Lg,
      }}
    >
      <div className="mb-2 flex justify-between items-center">
        <label className="flex items-center">
          <input type="checkbox" checked={allSelected} onChange={onToggleSet} className="mr-2" />
          <BaseLabel
            label={setName}
            style={{
              color: { colorKey: CoreColorKey.Primary },
              size: { sizeKey: SizeKey.LG },
              fontWeightKey: FontWeightKey.Bold,
            }}
            bg_color={true}
          />
        </label>

        <ToggleButton
          isVisible={isVisible}
          label="コレクション"
          onToggle={handleToggleVisibility}
          iconVisible={<IoChevronForward />}
          iconHidden={<IoChevronDown />}
          bg_color={true}
        />
      </div>

      {isVisible && (
        <div className="space-y-2">
          {collections.map((collection) => (
            <CollectionItem
              key={collection.id}
              collection={collection}
              selected={selectedIds.has(collection.id)}
              onSelectChange={() => onToggleCollection(collection.id)}
              navigateCollectionPage={() => {}}
            />
          ))}
        </div>
      )}
    </BaseCard>
  );
};

export default CollectionSetCard;
