import React, { useState } from "react";
import BaseCard from "../common/Card/BaseCard";
import { CollectionInput } from "../../../../types/collection";
import EditCard from "../common/Card/EditCard";
import ErrorMessageList from "../../../common/error/ErrorMessageList";
import { ErrorCode } from "../../../../types/error";
import { CollectionSet } from "../../../../types/collectionSet";
import UnsavedIcon from "../../common/Icon/UnSavedIcon";

interface Props {
    collectionSet: CollectionSet,
    isDescriptionVisible: boolean,
    userId: number,
    onDescriptionToggle: () => void;
    onDelete: () => void;
    AddPendingChanges: (input: CollectionInput) => void;
    errorMessages: ErrorCode[];
    isOwner: boolean;
    isSaved: boolean;
}

const ItemCard: React.FC<Props> = ({
    collectionSet,
    isDescriptionVisible,
    userId,
    onDescriptionToggle,
    onDelete, 
    AddPendingChanges,
    errorMessages,
    isOwner,
    isSaved
}) => {
    const [isEdit, setIsEdit] = useState<boolean>(false);

    const updateEmptyCheck = (input: CollectionInput) => {
        if ("name" in input && input.name !== collectionSet.name) return false;
        if ("descriptionText" in input  && input.descriptionText !== collectionSet.descriptionText) return false;
        return true;
    }

    const onEditComplete = (input: CollectionInput) => {
        setIsEdit(false);
        if (updateEmptyCheck(input)) return;
        AddPendingChanges(input);

    }

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="flex items-center">
        {!isSaved && <UnsavedIcon />}
        <div className=" rounded-lg transition-all duration-200 w-full">
          {isEdit && isOwner ? (
            <EditCard
              collection={collectionSet}
              onEditComplete={onEditComplete}
              onDelete={onDelete}
            />
          ) : (
            <BaseCard
              collectionSet={collectionSet}
              isDescriptionVisible={isDescriptionVisible}
              userId={userId}
              isOwner={isOwner}
              onEdit={() => setIsEdit(true)}
              onDelete={onDelete}
              onDescriptionToggle={onDescriptionToggle}
            />
          )}

        </div>
      </div>

      <ErrorMessageList errorMessages={errorMessages} />
    </div>
  );
};

export default ItemCard;