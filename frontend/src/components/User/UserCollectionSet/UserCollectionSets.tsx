import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserHeader from "../UserHeader"; // ヘッダーコンポーネント
import { getCollectionSetsByUserId, createCollectionSet, updateCollectionSet, deleteCollectionSet } from "../../../api/CollectionSetAPI";
import { FaBook, FaPlus, FaEdit, FaTrash } from "react-icons/fa"; // 書籍アイコンと追加、編集、削除アイコン
import { getUserById } from "../../../api/UserAPI";
import { User } from "../../../types/user";
import { CollectionSetInput } from "../../../types/collectionSet";

const UserCollectionSets: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [collectionSets, setCollectionSets] = useState<any[]>([]);
  const [newCollectionSetRequest, setNewCollectionSetRequest] = useState<CollectionSetInput>({ name: "" });
  const [editCollectionSetId, setEditCollectionSetId] = useState<number | null>(null);
  const [editCollectionSetRequest, setEditCollectionSetRequest] = useState<CollectionSetInput>({ name: "" });
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
    if (!userId) return;

    const fetchCollectionSets = async () => {
      try {
        const data = await getCollectionSetsByUserId(Number(userId));
        setCollectionSets(data);
      } catch (error) {
        console.error("コレクションセットの取得に失敗しました:", error);
      }
    };

    fetchCollectionSets();
  }, [userId]);

  // コレクションセットを追加
  const handleAddCollectionSet = async () => {
    if (!newCollectionSetRequest.name || newCollectionSetRequest.name.trim() === "") return;

    try {
      const newCollectionSet = await createCollectionSet(newCollectionSetRequest);
      setCollectionSets([...collectionSets, newCollectionSet]);
      setNewCollectionSetRequest({ name: "" }); // フォームをクリア
      setIsAdding(false);
    } catch (error) {
      console.error("コレクションセットの作成に失敗しました:", error);
    }
  };

  // コレクションセットを編集
  const handleEditCollectionSet = async () => {
    if (!editCollectionSetId || !editCollectionSetRequest.name || editCollectionSetRequest.name.trim() === "") return;

    try {
      const updatedCollectionSet = await updateCollectionSet(editCollectionSetId, editCollectionSetRequest);
      setCollectionSets(collectionSets.map(set =>
        set.id === editCollectionSetId ? updatedCollectionSet : set
      ));
      setIsEditing(false); // 編集終了
      setEditCollectionSetId(null); // 編集するIDをリセット
      setEditCollectionSetRequest({ name: "" }); // フォームをクリア
    } catch (error) {
      console.error("コレクションセットの更新に失敗しました:", error);
    }
  };

  // コレクションセットを削除
  const handleDeleteCollectionSet = async () => {
    if (!editCollectionSetId || !user?.self) return;

    const confirmDelete = window.confirm("本当にこのコレクションセットを削除しますか？この操作は取り消せません。");
    if (!confirmDelete) return;

    try {
      await deleteCollectionSet(editCollectionSetId); // 削除リクエスト
      setCollectionSets(collectionSets.filter(set => set.id !== editCollectionSetId)); // 削除後リスト更新
      setIsEditing(false);
      setEditCollectionSetId(null);
      setEditCollectionSetRequest({ name: "" });
      alert("コレクションセットを削除しました。");
    } catch (error) {
      console.error("コレクションセットの削除に失敗しました:", error);
      alert("削除に失敗しました。");
    }
  };

  // 編集モードに切り替える
  const enableEditMode = (setId: number, setName: string, e: React.MouseEvent) => {
    e.stopPropagation(); // 遷移を防止
    setIsEditing(true);
    setEditCollectionSetId(setId);
    setEditCollectionSetRequest({ name: setName });
  };

  return (
    <div className="min-h-screen">
      <UserHeader user={user} />

      <div className="max-w-4xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-xl">
        <h2 className="text-3xl font-bold text-gray-900 mb-6 border-b pb-3">ユーザーのコレクションセット</h2>
        {collectionSets.length === 0 && <p className="text-gray-500 text-center">コレクションセットがありません。</p>}

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {user?.self && (
            <li
              className="p-5 bg-white border border-gray-300 rounded-xl shadow-md hover:shadow-xl transform transition hover:scale-105 cursor-pointer flex items-center space-x-4"
              onClick={() => setIsAdding(true)}
            >
              {isAdding ? (
                <input
                  type="text"
                  className="p-4 border rounded-lg w-full mb-4 text-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="新しいコレクションセット名"
                  value={newCollectionSetRequest.name}
                  onChange={(e) => setNewCollectionSetRequest({ name: e.target.value })}
                  onBlur={() => setIsAdding(false)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddCollectionSet()}
                />
              ) : (
                <div>
                  <FaPlus />
                  <span className="text-lg font-medium text-gray-900">コレクションセットを追加</span>
                </div>
              )}
            </li>
          )}

          {collectionSets.map((set) => (
            <li
              key={set.id}
              className="p-5 bg-white border border-gray-300 rounded-xl shadow-md hover:shadow-xl transform transition hover:scale-105 cursor-pointer flex items-center space-x-4"
              onClick={() => !isEditing && navigate(`/user/${userId}/collection-sets/${set.id}/collections`)}
            >
              <FaBook className="text-3xl text-indigo-600" />

              {isEditing && set.id === editCollectionSetId ? (
                <div className="flex items-center space-x-4">
                  <input
                    className="text-lg font-medium text-gray-900 border-b p-2"
                    value={editCollectionSetRequest.name}
                    onChange={(e) => setEditCollectionSetRequest({ name: e.target.value })}
                    onKeyDown={(e) => e.key === 'Enter' && handleEditCollectionSet()}
                  />
                  <button onClick={handleDeleteCollectionSet} className="text-red-500 hover:text-red-600">
                    <FaTrash />
                  </button>
                </div>
              ) : (
                <span className="text-lg font-medium text-gray-900">{set.name}</span>
              )}
              
                {/* 編集ボタン (ユーザーが自分のコレクションセットを編集できる場合のみ表示) */}
                {user?.self && !isEditing && (
                  <button
                    className="ml-auto text-yellow-400 hover:text-yellow-500"
                    onClick={(e) => enableEditMode(set.id, set.name, e)}
                  >
                    <FaEdit />
                  </button>
                )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default UserCollectionSets;