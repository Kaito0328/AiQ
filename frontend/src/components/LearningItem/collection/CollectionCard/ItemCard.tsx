import React, { useState } from "react";
import BaseCard from "../common/Card/BaseCard";
import { Collection, CollectionInput } from "../../../../types/collection";
import EditCard from "../common/Card/EditCard";
import { ErrorCode } from "../../../../types/error";
import BaseItemCard from "../../common/Card/BaseItemCard";

interface Props {
    collection: Collection,
    isDescriptionVisible: boolean,
    userId: number,
    isLogin: boolean,
    onFavoriteToggle: () => void;
    onDescriptionToggle: () => void;
    onDelete: () => void;
    AddPendingChanges: (input: CollectionInput) => void;
    errorMessages: ErrorCode[];
    isOwner: boolean;
    isSaved: boolean;
}

const ItemCard: React.FC<Props> = ({
    collection,
    isDescriptionVisible,
    userId,
    isLogin,
    onFavoriteToggle,
    onDescriptionToggle,
    onDelete, 
    AddPendingChanges,
    errorMessages,
    isOwner,
    isSaved
}) => {
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const updateEmptyCheck = (input: CollectionInput) => {
        if ("name" in input && input.name !== collection.name) return false;
        if ("open" in input  && input.open !== collection.open) return false;
        if ("description" in input  && input.description !== collection.descriptionText) return false;
        return true;
    }

    const onEditComplete = (input: CollectionInput) => {
        setIsEdit(false);
        if (updateEmptyCheck(input)) return;
        AddPendingChanges(input);

    }

  return (
    <BaseItemCard
      isSaved={isSaved}
      errorMessages={errorMessages}
    >
          {isEdit && isOwner ? (
            <EditCard
              collection={collection}
              onEditComplete={onEditComplete}
              onDelete={onDelete}
            />
          ) : (
            <BaseCard
              collection={collection}
              isDescriptionVisible={isDescriptionVisible}
              userId={userId}
              isOwner={isOwner}
              isLogined={isLogin}
              onFavoriteToggle={() => onFavoriteToggle()}
              onEdit={() => setIsEdit(true)}
              onDelete={onDelete}
              onDescriptionToggle={onDescriptionToggle}
            />
          )}
    </BaseItemCard>
  );
};

export default ItemCard;