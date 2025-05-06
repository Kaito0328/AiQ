import React, { useState } from "react";
import { FaEdit, FaSave, FaTimes, FaLock, FaLockOpen, FaBook } from "react-icons/fa";
import { Collection } from "../../../types/collection";
import { updateCollection } from "../../../api/CollectionAPI";

interface Props {
  collection: Collection;
  isOwner: boolean;
}

const CollectionHeader: React.FC<Props> = ({ collection, isOwner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(collection.name);
  const [open, setOpen] = useState(collection.open);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await updateCollection(collection.id, { name, open });
      setName(res.name);
      setOpen(res.open);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setName(collection.name);
    setOpen(collection.open);
    setError("");
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md border mb-4">
      {isEditing ? (
        <div>
          <input
            className="text-xl font-semibold w-full border-b mb-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={loading}
          />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpen(!open)}
              className={`p-2 rounded-lg ${open ? "bg-green-100" : "bg-red-100"}`}
              disabled={loading}
            >
              {open ? <FaLockOpen /> : <FaLock />}
            </button>
            <span>{open ? "公開中" : "非公開"}</span>
          </div>
          <div className="flex space-x-3 mt-3">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              onClick={handleSave}
              disabled={loading}
            >
              <FaSave className="inline mr-1" /> 保存
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              onClick={handleCancel}
              disabled={loading}
            >
              <FaTimes className="inline mr-1" /> キャンセル
            </button>
          </div>
          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        </div>
      ) : (
        <div className="flex items-start">
            <FaBook className="text-yellow-600 text-3xl mr-4" />
            <h2 className="text-xl font-semibold mr-5">{name}</h2>
            {isOwner && (
              <p className="text-sm text-gray-600 flex items-center mt-1">
                {open ? <FaLockOpen className="mr-1" /> : <FaLock className="mr-1" />}
                {open ? "公開中" : "非公開"}
              </p>
            )}

          {isOwner && (
            <button
              className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600"
              onClick={() => setIsEditing(true)}
            >
              <FaEdit className="inline mr-1" /> 編集
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CollectionHeader;
