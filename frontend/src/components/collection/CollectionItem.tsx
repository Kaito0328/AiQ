import React, { useState } from "react";
import { Collection, CollectionInput } from "../../types/collection";
import { ErrorCode } from "../../types/error";
import { handleAPIError } from "../../api/handleAPIError";
import {
  FaEdit,
  FaTrash,
  FaCheck,
  FaLock,
  FaLockOpen,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Props {
  collection: Collection | CollectionInput;
  userId: number;
  isOwner: boolean;
  isNew: boolean;
  errorMessages: ErrorCode[];
  onChange: (updated: CollectionInput) => void;
  onDelete: () => void;
}

const CollectionItem: React.FC<Props> = ({
  collection,
  userId,
  isOwner,
  isNew,
  errorMessages,
  onChange,
  onDelete,
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [name, setName] = useState(collection.name);
  const [open, setOpen] = useState(collection.open);
  const navigate = useNavigate();

  const onComplete = () => {
    setIsEditing(false);
    onChange({ name, open });
  }

  const toggleOpen = () => setOpen((prev) => !prev);

  const handleNavigate = () => {
    if ("id" in collection) {
      navigate(`/user/${userId}/collection/${collection.id}/questions`);
    }
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
              placeholder="新しいコレクション名"
            />
          </div>

          {isOwner && (
            <div className="flex items-center justify-between">
              <div
                className="flex items-center space-x-2 cursor-pointer group"
                onClick={toggleOpen}
                title={open ? "公開中（クリックで非公開）" : "非公開（クリックで公開）"}
              >
                <span
                  className={`p-2 rounded-full text-xl transition-transform duration-200 group-hover:scale-110 ${open ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-500" }`}
                >
                  {open ? <FaLockOpen /> : <FaLock />}
                </span>
                <span className="text-sm font-medium">
                  {open ? "公開" : "非公開"}
                </span>
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
          )}
          
        </div>
      ) : (
        <div className="flex items-start justify-between">
          {/* 左：コレクション名 & 公開状態 */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleNavigate}>
              <span className="text-lg font-semibold text-blue-600 hover:underline break-all">
                {name}
              </span>
              <div
                className={`flex items-center px-2 py-1 text-xs rounded-full font-semibold ${
                  open ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                }`}
                title={open ? "公開中" : "非公開"}
              >
                {open ? <FaLockOpen className="mr-1" /> : <FaLock className="mr-1" />}
                {open ? "公開" : "非公開"}
              </div>
            </div>
          </div>

          {isOwner && (
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

      {/* エラーメッセージ */}
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

export default CollectionItem;
