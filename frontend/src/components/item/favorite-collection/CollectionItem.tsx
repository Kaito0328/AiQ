import React, { useState } from "react";
import { Collection, CollectionInput } from "../../../types/collection";
import {
  FaLock,
  FaLockOpen,
  FaBook,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { addFavoriteCollection, removeFavoriteCollection } from "../../../api/FavoriteCollection";

interface Props {
  collection: Collection | CollectionInput;
  userId: number;
  isOwner: boolean;
  isLogined: boolean;
}

const CollectionItem: React.FC<Props> = ({
  collection,
  userId,
  isOwner,
  isLogined,
}) => {
  const [favorite, setFavorite] = useState(
    "favorite" in collection ? collection.favorite : false
  );
  const navigate = useNavigate();


  const handleNavigate = () => {
    if ("id" in collection) {
      navigate(`/user/${userId}/collection/${collection.id}/questions`);
    }
  };

  const toggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation(); // 親のクリック（画面遷移）を防止
    if (!("id" in collection)) return;

    try {
      if (favorite) {
        await removeFavoriteCollection(collection.id);
        setFavorite(false);
      } else {
        await addFavoriteCollection(collection.id);
        setFavorite(true);
      }
    } catch (err) {
      console.error("お気に入り更新失敗", err);
      // ここでエラー時のトースト表示とかしてもいい
    }
  };

  return (
    <div className="p-5 shadow-sm rounded-lg hover:shadow-md transition-all duration-200 w-full max-w-3xl mx-auto">
        <div className="flex items-start justify-between">
          {/* 左：コレクション名 & 公開状態 */}
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleNavigate}>
            <FaBook className="text-xl text-yellow-500 group-hover:text-gray-700 transition" />
              <span className="text-lg font-semibold text-blue-600 hover:underline break-all">
                {collection.name}
              </span>

              {/* 公開・非公開マーク（オーナーだけに表示） */}
              {isOwner && (
                <div
                  className={`flex items-center px-2 py-1 text-xs rounded-full font-semibold ${
                    collection.open ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-600"
                  }`}
                  title={collection.open ? "公開中" : "非公開"}
                >
                  {collection.open ? <FaLockOpen className="mr-1" /> : <FaLock className="mr-1" />}
                  {collection.open ? "公開" : "非公開"}
                </div>
              )}

              {/* お気に入りハート（ログインしている場合だけ） */}
              {isLogined && (
                <button
                  onClick={toggleFavorite}
                  className="text-pink-400 hover:text-pink-500 transition"
                  title={favorite ? "お気に入り解除" : "お気に入り登録"}
                >
                  {favorite ? <FaHeart className="text-xl" /> : <FaRegHeart className="text-xl" />}
                </button>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};

export default CollectionItem;
