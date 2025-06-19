import React from "react";
import { generatePath } from "react-router-dom";
import EditDeleteButtons from "../../../common/Buttons/EditDeleteButtons";
import DescriptionToggleButton from "../../../common/Button/DescriptionToggleButton";
import { CollectionSet } from "../../../../../types/collectionSet";
import IdLabel from "../../../common/Text/IdText";
import Paths from "../../../../../routes/Paths";
import DescriptionText from "../../../common/Text/DescriptionText";
import LinkedNameText from "../../../common/Text/LinkedNameText";
import CollectionSetIcon from "../Icon/CollectionSetIcon";

interface Props {
  collectionSet: CollectionSet;
  isDescriptionVisible: boolean;
  userId: number;
  isOwner: boolean;
  onDescriptionToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const BaseCard: React.FC<Props> = ({
  collectionSet,
  isDescriptionVisible,
  userId,
  isOwner,
  onDescriptionToggle,
  onEdit,
  onDelete
}) => {
  const url = generatePath(Paths.COLLECTION_PAGE, {userId, collectionSetId: collectionSet.id});

  return (
    <div className="p-4 shadow-md rounded-xl hover:shadow-lg transition-all duration-200 w-full max-w-3xl mx-auto bg-white space-y-4">
      {/* 上部：名前・アイコン・ボタン群 */}
      <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
        {/* 左：名前・トグル・Open/Favorite */}
        <div className="flex  flex-wrap items-center justify-between min-w-0 w-full">
          <div className="flex gap-2 items-center">
            <CollectionSetIcon/>
            <LinkedNameText name={collectionSet.name}  url={url}/>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-4 ml-auto">
            <div className="flex flex-col items-end gap-1 text-sm sm:text-base whitespace-nowrap">
              {isOwner && (
                <EditDeleteButtons
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )}
            </div>
          </div>
        </div>
      </div>


      <div className="mt-2 mb-2">
        <DescriptionToggleButton
          isVisible={isDescriptionVisible}
          onToggle={onDescriptionToggle}
        />
      </div>

      

      {/* 下部：説明文（全幅） */}
      {isDescriptionVisible && (
        <div className="border-t pt-4 text-gray-700 text-sm sm:text-base whitespace-pre-wrap">
          <DescriptionText description={collectionSet.descriptionText} />
        </div>
      )}
      <IdLabel id={collectionSet.id} />
    </div>
  );
};

export default BaseCard;
