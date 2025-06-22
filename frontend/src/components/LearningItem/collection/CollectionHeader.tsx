import React, { useState } from "react";
import { Collection, CollectionInput } from "../../../types/collection";
import { updateCollection } from "../../../api/CollectionAPI";
import ItemInLineTextInput from "../common/Input/ItemInLineTextInput";
import OpenButton from "./common/Button/OpenButton";
import OpenIcon from "./common/Icon/OpenIcon";
import EditDeleteButtons from "../common/Buttons/EditDeleteButtons";
import CancelButton from "../common/Button/CancelButton";
import SaveButton from "../common/Button/SaveButton";
import ErrorMessageList from "../../common/error/ErrorMessageList";
import { ErrorCode } from "../../../types/error";
import { extractErrorCode } from "../../../api/handleAPIError";
import { FontWeightKey } from "../../../style/fontWeight";
import BaseLabel from "../../baseComponents/BaseLabel";
import { SizeKey } from "../../../style/size";
import BaseCard from "../../containerComponents/BaseCard";
import { ShadowKey } from "../../../style/shadow";
import { CoreColorKey } from "../../../style/colorStyle";
import CollectionIcon from "./common/Icon/CollectionIcon";

interface Props {
  collection: Collection;
  isOwner: boolean;
}

const CollectionHeader: React.FC<Props> = ({ collection, isOwner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [input, setInput] = useState<CollectionInput>({
    name: collection.name,
    open: collection.open,
    descriptionText: collection.descriptionText
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorCode | undefined>();

  const handleEditComplete = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const res = await updateCollection(collection.id, {
        name: input.name,
        open: input.open
      });
      setInput({ ...input, name: res.name, open: res.open });
      setIsEditing(false);
    } catch (err: unknown) {
      console.error(err);
      setError(extractErrorCode(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setInput({
      name: collection.name,
      open: collection.open,
      descriptionText: collection.descriptionText
    });
    setError(undefined);
    setIsEditing(false);
  };

  const handleChange = (field: keyof CollectionInput, value: string | boolean) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <BaseCard
    style={{
      shadow: {
        shadowKey:ShadowKey.MD
      },
      size: {
        sizeKey: SizeKey.LG
      }
    }}
    >
      {isEditing ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-[200px] flex-1">
              <CollectionIcon/>
              <ItemInLineTextInput
                defaultValue={input.name}
                onInput={(value) => handleChange("name", value)}
                placeholder="コレクション名を入力"
              />
            </div>
            <div className="flex items-center gap-2 whitespace-wrap">
              <OpenButton
                open={input.open ?? false}
                onToggle={() => handleChange("open", !input.open)}
              />
            </div>
          </div>
          <div className="mt-2 justify-end flex">
            <CancelButton
              onCancel={handleCancel}
            />
            <SaveButton
              onSave={handleEditComplete}
              disabled={loading}
            />
          </div>
          <div className="mt-1">
            {error && <ErrorMessageList errorMessages={[error]} />}
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CollectionIcon />
            <BaseLabel
              label={collection.name}
              style={{
                fontWeightKey:FontWeightKey.Bold,
                size: {
                  sizeKey: SizeKey.LG
                },
                color: {
                  colorKey: CoreColorKey.Base
                }
              }}
            />
          </div>
          {isOwner && (
            <div className="flex items-center gap-2">
              <div className="mr-4 ml-auto">
                <OpenIcon open={collection.open} />
              </div>
              <EditDeleteButtons
                onEdit={() => setIsEditing(true)}
                onDelete={handleCancel}
              />
            </div>
          )}
        </div>
      )}
    </BaseCard>
  );
};

export default CollectionHeader;
