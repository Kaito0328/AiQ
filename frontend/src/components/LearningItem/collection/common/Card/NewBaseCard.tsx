import React from "react";
import {CollectionInput } from "../../../../../types/collection";
import OpenIcon from "../Icon/OpenIcon";
import EditDeleteButtons from "../../../common/Buttons/EditDeleteButtons";
import DescriptionText from "../../../common/Text/DescriptionText";
import LinkedNameText from "../../../common/Text/LinkedNameText";
import CollectionIcon from "../Icon/CollectionIcon";

interface Props {
  collection: CollectionInput;
  onEdit: () => void;
  onDelete: () => void;
}

const NewBaseCard: React.FC<Props> = ({
  collection,
  onEdit,
  onDelete
}) => {
  return (
    <div className="space-y-4">
      {/* 上部：名前・アイコン・ボタン群 */}
      <div className="flex flex-col gap-4">
        {/* 左：名前・トグル・Open/Favorite */}
        <div className="flex  flex-wrap items-center justify-between min-w-0 w-full">
          <div
            className="flex items-center gap-2"
          >
            <CollectionIcon />
            <LinkedNameText name={collection.name??""} />
          </div>

          <div className="mr-2 ml-auto">
            <OpenIcon open={collection.open ?? false} />
          </div>

            <div className="whitespace-nowrap ml-auto">
              <EditDeleteButtons
                onEdit={onEdit}
                onDelete={onDelete}
              />
            </div>
          </div>
      </div>

      <div className="border-t pt-4">
        <DescriptionText description={collection.descriptionText} />
      </div>
    </div>
  );
};

export default NewBaseCard;
