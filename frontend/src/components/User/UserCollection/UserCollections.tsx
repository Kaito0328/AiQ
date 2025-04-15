import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserHeader from "../UserHeader";
import { getCollectionsByCollectionSetId, createCollection, updateCollection } from "../../../api/CollectionAPI";
import { FaFolderOpen, FaPlus, FaEdit, FaLock, FaUnlock } from "react-icons/fa";

import { getUserById } from "../../../api/UserAPI";
import { CollectionInput } from "../../../types/collection";
import { User } from "../../../types/user";

const UserCollections: React.FC = () => {
  const navigate = useNavigate();
  const { userId, collectionSetId } = useParams<{ userId: string; collectionSetId: string }>();
  const [collections, setCollections] = useState<any[]>([]);
  const [newCollectionName, setNewCollectionName] = useState<string>("");
  const [newCollectionPublic, setNewCollectionPublic] = useState<boolean>(false);
  const [editCollectionId, setEditCollectionId] = useState<number | null>(null);
  const [editCollectionName, setEditCollectionName] = useState<string>("");
  const [editCollectionPublic, setEditCollectionPublic] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdding, setIsAdding] = useState<boolean>(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserById(Number(userId));
        setUser(data);
      } catch (error) {
        console.error("ユーザー情報の取得に失敗しました:", error);
      }
    };

    fetchUserData();
  }, [userId]);

  useEffect(() => {
    const fetchCollections = async () => {
      if (!collectionSetId) return;

      try {
        const data = await getCollectionsByCollectionSetId(Number(collectionSetId));
        setCollections(data);
      } catch (error) {
        console.error("コレクションの取得に失敗しました:", error);
      }
    };

    fetchCollections();
  }, [collectionSetId]);

  const handleAddCollection = async () => {
    if (!newCollectionName.trim()) return;

    const request: CollectionInput = {
      name: newCollectionName,
      open: newCollectionPublic,
    };

    try {
      const newCollection = await createCollection(Number(collectionSetId), request);
      setCollections([...collections, newCollection]);
      setNewCollectionName("");
      setNewCollectionPublic(false);
      setIsAdding(false);
    } catch (error) {
      console.error("コレクションの作成に失敗しました:", error);
    }
  };

  const handleEditCollection = async () => {
    if (!editCollectionName.trim() || editCollectionId === null) return;

    const request: CollectionInput = {
      name: editCollectionName,
      open: editCollectionPublic,
    };

    try {
      const updatedCollection = await updateCollection(editCollectionId, request);
      setCollections(
        collections.map((col) => (col.id === editCollectionId ? updatedCollection : col))
      );
      setIsEditing(false);
      setEditCollectionId(null);
      setEditCollectionName("");
      setEditCollectionPublic(false);
    } catch (error) {
      console.error("コレクションの更新に失敗しました:", error);
    }
  };

  const enableEditMode = (collectionId: number, collectionName: string, isPublic: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditCollectionName(collectionName);
    setEditCollectionPublic(isPublic);
    setEditCollectionId(collectionId);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <UserHeader user={user} />

      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl transition-transform hover:scale-105">
        <h2 className="text-3xl font-semibold text-gray-800 mb-6 border-b pb-3">コレクションリスト</h2>

        {collections.length === 0 && <p className="text-gray-500 text-center">コレクションがありません。</p>}

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {user?.self && (
            <li
              className="p-5 bg-gradient-to-r from-indigo-600 to-indigo-400 border border-gray-300 rounded-xl shadow-md hover:shadow-xl transform transition hover:scale-105 cursor-pointer flex items-center space-x-4"
              onClick={() => setIsAdding(true)}
            >
              {isAdding ? (
                <div>
                  <input
                    type="text"
                    className="p-4 border rounded-lg w-full mb-4 text-lg focus:ring-2 focus:ring-indigo-500 transition-all"
                    placeholder="新しいコレクション名"
                    value={newCollectionName}
                    onChange={(e) => setNewCollectionName(e.target.value)}
                    onBlur={() => setIsAdding(false)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddCollection()}
                  />
                  <button
                    onClick={() => setNewCollectionPublic(!newCollectionPublic)}
                    className="ml-auto text-xl text-gray-600 transition-transform hover:scale-110"
                  >
                    {newCollectionPublic ? <FaUnlock /> : <FaLock />}
                  </button>
                </div>
              ) : (
                <div className="flex space-x-4">
                  <FaPlus className="text-3xl text-white transition-transform hover:scale-110"/>
                  <span className="text-lg font-medium text-white">コレクションを追加</span>
                </div>
              )}
            </li>
          )}

          {collections.map((collection) => (
            <li
              key={collection.id}
              className="p-5 bg-white border border-gray-300 rounded-xl shadow-md hover:shadow-xl transform transition hover:scale-105 cursor-pointer flex items-center space-x-4"
              onClick={() => {
                if (isEditing) return;
                navigate(`/user/${userId}/collections/${collection.id}/questions`);
              }}
            >
              <FaFolderOpen className="text-3xl text-indigo-600" />

              {isEditing && collection.id === editCollectionId ? (
                <div className="flex items-center space-x-4">
                  <input
                    className="text-lg font-medium text-gray-900 border-b p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={editCollectionName}
                    onChange={(e) => setEditCollectionName(e.target.value)}
                    onBlur={() => setIsEditing(false)} 
                    onKeyDown={(e) => e.key === 'Enter' && handleEditCollection()}
                  />
                  <button
                    onClick={() => isEditing && setEditCollectionPublic(!editCollectionPublic)}
                    className="ml-auto text-xl text-gray-600 transition-transform hover:scale-110"
                  >
                    {editCollectionPublic ? <FaUnlock /> : <FaLock />}
                  </button>
                </div>
              ) : (
                <span className="text-lg font-medium text-gray-900">{collection.name}</span>
              )}

              {user?.self && !isEditing && (
                <div className="flex items-center space-x-4">
                  {collection.public ? <FaUnlock /> : <FaLock />}
                  <button
                    className="ml-auto text-yellow-400 hover:text-yellow-500 transition-colors"
                    onClick={(e) => enableEditMode(collection.id, collection.name, collection.public, e)}
                  >
                    <FaEdit />
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserCollections;
