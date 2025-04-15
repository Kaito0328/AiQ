import React, { useState } from "react";
import { FaEdit, FaSave, FaTimes, FaTrash, FaSpinner } from "react-icons/fa";
import { CollectionSet } from "../../types/collectionSet";
import { updateCollectionSet, deleteCollectionSet } from "../../api/CollectionSetAPI";
import { useNavigate } from "react-router-dom";

interface Props {
  collectionSet: CollectionSet;
  isOwner: boolean;
  onDelete?: (id: number) => void; // 削除後にリストから除外するため
}

const CollectionSetHeader: React.FC<Props> = ({ collectionSet, isOwner, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(collectionSet.name);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const navigate = useNavigate();

  const handleSave = async () => {
    console.log("Saving...");
    try {

      setLoading(true);
      setError("");
      const res = await updateCollectionSet(collectionSet.id, { name });
      setIsEditing(false);
      setName(res.name);
    } catch (err) {
      console.error(err);
      setError("保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(collectionSet.name);
    setError("");
    setIsEditing(false);
  };

  const handleDelete = async () => {
    console.log("Deleting...");
    try {
      setLoading(true);
      await deleteCollectionSet(collectionSet.id);
      onDelete?.(collectionSet.id);
      navigate(-1);
    } catch (err) {
      console.error(err);
      setError("削除に失敗しました。");
    } finally {
      setLoading(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-md border border-gray-100 mb-4 transition-all">
      {isEditing && isOwner ? (
        <div>
          <input
            className="text-2xl font-semibold w-full border-b border-gray-300 focus:outline-none focus:border-blue-500 mb-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          <div className="flex space-x-3 mt-3">
            <button
              className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition disabled:opacity-50"
              onClick={handleSave}
              disabled={loading}
            >
              {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaSave className="mr-2" />}
              保存
            </button>
            <button
              className="flex items-center px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 transition disabled:opacity-50"
              onClick={handleCancel}
              disabled={loading}
            >
              <FaTimes className="mr-2" />
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-semibold text-gray-800 break-words">{name}</h2>
          {isOwner && (
            <div className="flex gap-2">
              <button
                className="flex items-center px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                onClick={() => setIsEditing(true)}
              >
                <FaEdit className="mr-1" />
                編集
              </button>
              <button
                className="flex items-center px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                onClick={() => setConfirmDelete(true)}
              >
                <FaTrash className="mr-1" />
                削除
              </button>
            </div>
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
        <p className="text-red-500 text-sm mt-2">{error}</p>
      )}
    </div>
  );
};

export default CollectionSetHeader;
