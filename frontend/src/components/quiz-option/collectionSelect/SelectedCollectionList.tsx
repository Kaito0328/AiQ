import React from "react";
import BaseCard from "../../containerComponents/BaseCard";
import SelectedCollectionItem from "./SelectedCollectionItem";
import { SizeKey } from "../../../style/size";
import { RoundKey } from "../../../style/rounded";
import { CoreColorKey } from "../../../style/colorStyle";
import { Collection } from "../../../types/collection";

type Props = {
  selectedCollections: Collection[];
  onRemove: (collection: Collection) => void;
};

const SelectedCollectionList: React.FC<Props> = ({ selectedCollections, onRemove }) => {
  return (
    <BaseCard
      style={{
        color: { colorKey: CoreColorKey.Base },
        size: { sizeKey: SizeKey.LG },
        roundKey: RoundKey.Lg,
      }}
    >
      {selectedCollections.map((collection) => (
        <SelectedCollectionItem
          key={collection.id}
          name={collection.name}
          onRemove={() => onRemove(collection)}
        />
      ))}
    </BaseCard>
  );
};

export default SelectedCollectionList;
