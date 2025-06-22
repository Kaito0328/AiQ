import React, { useState } from "react";
import { CollectionInput } from "../../../../types/collection";
import EditCard from "../common/Card/EditCard";
import { ErrorCode, ErrorCodeType } from "../../../../types/error";
import NewBaseCard from "../common/Card/NewBaseCard";
import BaseItemCard from "../../common/Card/BaseItemCard";
import { CoreColorKey } from "../../../../style/colorStyle";

interface Props {
    collection: CollectionInput,
    onDelete: () => void;
    AddPendingChanges: (input: CollectionInput) => void;
    errorMessages: ErrorCode[];
    isOwner: boolean;
}

const NewItemCard: React.FC<Props> = ({
    collection,
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
      errors.push({code: ErrorCodeType.COLLECTION_NAME_EMPTY, message: ""});
    }
    if (!("open" in input)) {
      errors.push({code: ErrorCodeType.COLLECTION_OPEN_EMPTY, message: ""}); // 明確なエラーコードがない場合
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
      <BaseItemCard
        isSaved={false}
        errorMessages={[...errorMessages, ...localErrors]}
        colorKey={CoreColorKey.Secondary}
      >
          {isEdit && isOwner ? (
            <EditCard
              collection={collection}
              onEditComplete={(input) => onEditComplete(input)}
              onDelete={() => onDelete()}
            />
          ) : (
            <NewBaseCard
              collection={collection}
              onEdit={() => setIsEdit(true)}
              onDelete={() => onDelete()}
            />
          )}
      </BaseItemCard>
  );
};

export default NewItemCard;