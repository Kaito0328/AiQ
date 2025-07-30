import React from "react";
import {CollectionInput as CollectionSetInput } from "../../../../../types/collection";
import EditDeleteButtons from "../../../common/Buttons/EditDeleteButtons";
import DescriptionText from "../../../common/Text/DescriptionText";
import CollectionSetIcon from "../Icon/CollectionSetIcon";
import LinkedNameText from "../../../common/Text/LinkedNameText";

interface Props {
  collectionSet: CollectionSetInput;
  onEdit: () => void;
  onDelete: () => void;
}

const NewBaseCard: React.FC<Props> = ({
  collectionSet,
  onEdit,
  onDelete
}) => {
  return (
    <div className="p-4 shadow-md rounded-xl hover:shadow-lg transition-all duration-200 w-full max-w-3xl mx-auto bg-white space-y-4 bg-yellow-50/60">
      {/* 上部：名前・アイコン・ボタン群 */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        {/* 左：名前・トグル・Open/Favorite */}
        <div className="flex  flex-wrap items-center min-w-0 w-full">
          <div className="flex gap-2 items-center">
            <CollectionSetIcon/>
            <LinkedNameText name={collectionSet.name??""}/>
          </div>

          <div className="flex flex-col items-end gap-1 text-sm sm:text-base whitespace-nowrap ml-auto">
            <EditDeleteButtons
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        </div>
    </div>

    <div className="pt-4 text-gray-700 text-sm sm:text-base whitespace-pre-wrap">
      <DescriptionText description={collectionSet.descriptionText} />
    </div>
  </div>
  );
};

export default NewBaseCard;
