import React, { useState } from "react";
import { CollectionSet, CollectionSetInput } from "../../types/collectionSet";
import { ErrorCode } from "../../types/error";
import { handleAPIError } from "../../api/handleAPIError";
import { FaCheck, FaEdit, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Props {
  collectionSet: CollectionSet | CollectionSetInput;
  userId: number;
  isNew: boolean;
  isOwner: boolean;
  errorMessages: ErrorCode[];
  onChange: (updated: CollectionSetInput) => void;
  onDelete: () => void;
}

const CollectionSetItem: React.FC<Props> = ({
  collectionSet,
  userId,
  isNew,
  isOwner,
  errorMessages,
  onChange,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [name, setName] = useState(collectionSet.name);
  const navigate = useNavigate();

  const handleNavigate = () => {
    if ("id" in collectionSet) {
      navigate(`/user/${userId}/collection-set/${collectionSet.id}/collections`);
    }
  };

  const onComplete = () => {
    setIsEditing(false);
    onChange({ name });
    console.log("Updated collection set:", { name });
  };

  return (
    <li className="p-5 bg-white border border-gray-200 shadow-sm rounded-lg hover:shadow-md transition-all duration-200 w-full max-w-3xl mx-auto">
      {isEditing && isOwner ? (
        <div className="space-y-4">
          <div>
            <input
              className="w-full p-3 border border-gray-300 rounded focus:ring-2 focus:ring-blue-400 focus:outline-none text-base"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="新しいコレクションセット名"
            />
          </div>

          <div className="flex space-x-3">
            <button
              className="flex items-center px-3 py-1 text-sm font-medium text-white bg-blue-500 rounded hover:bg-blue-600 transition"
              onClick={onComplete}
            >
              <FaCheck className="mr-1" /> 完了
            </button>
            <button
              className="flex items-center px-3 py-1 text-sm font-medium text-white bg-red-500 rounded hover:bg-red-600 transition"
              onClick={onDelete}
            >
              <FaTrash className="mr-1" /> 削除
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleNavigate}>
              <span className="text-lg font-semibold text-blue-600 hover:underline break-all">
                {name}
              </span>
            </div>
          </div>
          { isOwner && (
            <div className="flex-shrink-0 flex space-x-4">
              <button
                className="flex items-center text-yellow-500 hover:text-yellow-600 transition space-x-1"
                onClick={() => setIsEditing(true)}
                title="編集"
              >
                <FaEdit /> <span>編集</span>
              </button>
              <div className="w-px bg-gray-300 h-5 my-auto" />
              <button
                className="flex items-center text-red-500 hover:text-red-600 transition space-x-1"
                onClick={onDelete}
                title="削除"
              >
                <FaTrash /> <span>削除</span>
              </button>
            </div>
          )}
          </div>    
      )}

      {errorMessages && errorMessages.length > 0 && (
        <ul className="mt-3 text-sm space-y-1">
          {errorMessages.map((err, idx) => (
            <li key={idx} className="flex items-start text-red-600">
              <span className="mr-1">⚠️</span>
              {handleAPIError(err)}
            </li>
          ))}
        </ul>
      )}
    </li>
  );
};

export default CollectionSetItem;
