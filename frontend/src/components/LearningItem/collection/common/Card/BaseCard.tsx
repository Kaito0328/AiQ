import React from "react";
import { Collection } from "../../../../../types/collection";
import OpenIcon from "../Icon/OpenIcon";
import FavoriteButton from "../Button/FavoriteButton";
import EditDeleteButtons from "../../../common/Buttons/EditDeleteButtons";
import DescriptionToggleButton from "../../../common/Button/DescriptionToggleButton";
import IdLabel from "../../../common/Text/IdText";
import DescriptionText from "../../../common/Text/DescriptionText";
import LinkedNameText from "../../../common/Text/LinkedNameText";
import CollectionIcon from "../Icon/CollectionIcon";
import Paths from "../../../../../routes/Paths";
import { generatePath } from "react-router-dom";

interface Props {
  collection: Collection;
  isDescriptionVisible: boolean;
  userId: number;
  isOwner: boolean;
  isLogined: boolean;
  onFavoriteToggle: () => void;
  onDescriptionToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const BaseCard: React.FC<Props> = ({
  collection,
  isDescriptionVisible,
  userId,
  isOwner,
  isLogined,
  onFavoriteToggle,
  onDescriptionToggle,
  onEdit,
  onDelete
}) => {

    const url = generatePath(Paths.QUESTION_PAGE, {userId, collectionId: collection.id});

  return (
    <div>
      {/* 上部：名前・アイコン・ボタン群 */}
      <div className="flex flex-col gap-2">
        {/* 左：名前・トグル・Open/Favorite */}
        <div className="flex  flex-wrap items-center justify-between min-w-0 w-full">
          <div className="flex gap-2 items-center">
            <CollectionIcon/>
            <LinkedNameText name={collection.name}  url={url}/>
          </div>
          <div className="flex mr-2 ml-auto">
            {isOwner && <OpenIcon open={collection.open} />}
            {isLogined && (
              <FavoriteButton
                isFavorite={collection.favorite}
                onToggle={() => onFavoriteToggle()}
              />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 ml-auto">
              {isOwner && (
                <EditDeleteButtons
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              )}
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
          <DescriptionText description={collection.descriptionText} />
        </div>
      )}
      <IdLabel id={collection.id} />
    </div>
  );
};

export default BaseCard;
