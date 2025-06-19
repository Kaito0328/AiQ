import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CollectionSet } from "../../../types/collectionSet";
import { updateCollectionSet, deleteCollectionSet } from "../../../api/CollectionSetAPI";
import CollectionSetIcon from "./common/Icon/CollectionSetIcon";
import ItemInLineTextInput from "../common/Input/ItemInLineTextInput";
import EditDeleteButtons from "../common/Buttons/EditDeleteButtons";
import CancelButton from "../common/Button/CancelButton";
import SaveButton from "../common/Button/SaveButton";
import ErrorMessageList from "../../common/error/ErrorMessageList";
import { ErrorCode } from "../../../types/error";
import { extractErrorCode } from "../../../api/handleAPIError";

interface Props {
  collectionSet: CollectionSet;
  isOwner: boolean;
  onDelete?: (id: number) => void;
}

const CollectionSetHeader: React.FC<Props> = ({ collectionSet, isOwner, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(collectionSet.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorCode | undefined>();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    try {
      setLoading(true);
      setError(undefined);
      const res = await updateCollectionSet(collectionSet.id, { name });
      setName(res.name);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError(extractErrorCode(err));
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(collectionSet.name);
    setError(undefined);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    try {
      setLoading(true);
      await deleteCollectionSet(collectionSet.id);
      onDelete?.(collectionSet.id);
      navigate(-1);
    } catch (err) {
      console.error(err);
      setError(extractErrorCode(err));
    } finally {
      setLoading(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-4 transition-all">
      {isEditing && isOwner ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2 min-w-[200px] flex-1">
              <CollectionSetIcon />
              <ItemInLineTextInput
                defaultValue={name}
                onInput={setName}
                placeholder="コレクションセット名を入力"
              />
            </div>
          </div>
          <div className="mt-2 flex justify-end">
            <CancelButton onCancel={handleCancel} />
            <SaveButton onSave={handleSave} disabled={loading} />
          </div>
          <div className="mt-1">
            {error && <ErrorMessageList errorMessages={[error]} />}
          </div>
        </>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <CollectionSetIcon />
            <h2 className="text-2xl font-semibold text-gray-800 break-words">{name}</h2>
          </div>
          {isOwner && (
            <EditDeleteButtons
              onEdit={() => setIsEditing(true)}
              onDelete={() => setConfirmDelete(true)}
            />
          )}
        </div>
      )}

      {confirmDelete && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600 font-medium">本当に削除しますか？この操作は取り消せません。</p>
          <div className="flex space-x-3 mt-2">
            <button
              className="px-4 py-1.5 text-white bg-red-600 hover:bg-red-700 rounded-lg transition"
              onClick={handleDelete}
              disabled={loading}
            >
              はい、削除する
            </button>
            <button
              className="px-4 py-1.5 bg-gray-300 hover:bg-gray-400 rounded-lg transition"
              onClick={() => setConfirmDelete(false)}
              disabled={loading}
            >
              キャンセル
            </button>
          </div>
        </div>
      )}

      {!isEditing && error && (
        <div className="mt-2">
          <ErrorMessageList errorMessages={[error]} />
        </div>
      )}
    </div>
  );
};

export default CollectionSetHeader;
