import React, { useState } from "react";
import { CollectionInput } from "../../../../types/collection";
import EditCard from "../common/Card/EditCard";
import ErrorMessageList from "../../../common/error/ErrorMessageList";
import { ErrorCode, ErrorCodeType } from "../../../../types/error";
import NewBaseCard from "../common/Card/NewBaseCard";
import UnsavedIcon from "../../common/Icon/UnSavedIcon";
import { CollectionSetInput } from "../../../../types/collectionSet";

interface Props {
    collectionSet: CollectionSetInput,
    onDelete: () => void;
    AddPendingChanges: (input: CollectionInput) => void;
    errorMessages: ErrorCode[];
    isOwner: boolean;
}

const NewItemCard: React.FC<Props> = ({
    collectionSet,
    onDelete, 
    AddPendingChanges,
    errorMessages = [],
    isOwner,
}) => {
    const [isEdit, setIsEdit] = useState<boolean>(true);
      const [localErrors, setLocalErrors] = useState<ErrorCode[]>([]);

  const validationCheck = (input: CollectionInput): ErrorCode[] => {
    const errors: ErrorCode[] = [];

    if (!("name" in input) || input.name === "") {
      errors.push({code: ErrorCodeType.COLLECTIONSET_NAME_EMPTY, message: ""});
    }

    return errors;
  };

const onEditComplete = (input: CollectionInput) => {
    const errors = validationCheck(input);

    if (errors.length > 0) {
      setLocalErrors(errors);
      return;
    }

    setLocalErrors([]);
    AddPendingChanges(input);
    setIsEdit(false);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto">
      <div className="flex items-center">
        <UnsavedIcon />
        <div className="rounded-lg transition-all duration-200 w-full">
          {isEdit && isOwner ? (
            <EditCard
              collection={collectionSet}
              onEditComplete={(input) => onEditComplete(input)}
              onDelete={() => onDelete()}
            />
          ) : (
            <NewBaseCard
              collectionSet={collectionSet}
              onEdit={() => setIsEdit(true)}
              onDelete={() => onDelete()}
            />
          )}
        </div>
      </div>
      <ErrorMessageList errorMessages={[...errorMessages, ...localErrors]} />
    </div>
  );
};

export default NewItemCard;