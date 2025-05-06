import React, { useState, useEffect } from "react";
import {
  getCollectionsByCollectionSetId,
  getFavoriteCollections,
} from "../../api/CollectionAPI";
import { getCollectionSetsByUserId } from "../../api/CollectionSetAPI";
import { CollectionSet } from "../../types/collectionSet";
import { Collection } from "../../types/collection";
import {
  FaFolder,
  FaBook,
  FaHeart,
  FaChevronRight,
  FaChevronDown,
} from "react-icons/fa";
import { IoArrowRedoSharp } from "react-icons/io5";
import { generatePath, useNavigate } from "react-router-dom";
import Paths from "../../routes/Paths";
import LoadingIndicator from "../item/layout/LoadingIndicator";

type Props = {
  userId: number;
  isOfficial?: boolean;
  onSelectionChange: (selected: number[]) => void;
};

const CollectionSelector: React.FC<Props> = ({
  userId,
  isOfficial,
  onSelectionChange,
}) => {
  const [collectionSets, setCollectionSets] = useState<CollectionSet[]>([]);
  const [favoriteCollections, setFavoriteCollections] = useState<Collection[]>([]);
  const [selectedCols, setSelectedCols] = useState<number[]>([]);
  const [selectedSetIds, setSelectedSetIds] = useState<number[]>([]);
  const [expandedSetIds, setExpandedSetIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const sets = await getCollectionSetsByUserId(userId);
        const withCols = await Promise.all(
          sets.map(async (s) => ({
            ...s,
            collections: await getCollectionsByCollectionSetId(s.id),
          }))
        );
        setCollectionSets(withCols);
        setExpandedSetIds(new Set(withCols.map((s) => s.id)));
        if (!isOfficial) {
          setFavoriteCollections(await getFavoriteCollections(userId));
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [userId, isOfficial]);

  const goToSets = () =>
    nav(generatePath(Paths.COLLECTION_SET_PAGE, { userId }));
  const goToFavs = () =>
    nav(generatePath(Paths.FAVORITE_COLLECTION_PAGE, { userId }));
  const goToQuestions = (id: number) =>
    nav(generatePath(Paths.QUESTION_PAGE, { userId, collectionId: id }));

  const toggleSet = (s: CollectionSet) => {
    const inSet = selectedSetIds.includes(s.id);
    setSelectedSetIds((p) =>
      inSet ? p.filter((i) => i !== s.id) : [...p, s.id]
    );
    setSelectedCols((p) =>
      inSet
        ? p.filter((c) => !s.collections.some((sc) => sc.id === c))
        : [...p, ...s.collections.map((c) => c.id)]
    );
  };
  const toggleCol = (id: number) =>
    setSelectedCols((p) =>
      p.includes(id) ? p.filter((c) => c !== id) : [...p, id]
    );
  const toggleExpand = (id: number) =>
    setExpandedSetIds((p) => {
      const n = new Set(p);
      if (n.has(id)) {
        n.delete(id);
      } else {
        n.add(id);
      }
      return n;
    });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">


      {/* ヘッダー */}
      <div className="flex justify-between items-center justify-center">
        <h1 className="text-3xl font-bold text-indigo-800">コレクション選択</h1>
      </div>

            {/* 上部ナビ */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={goToSets}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-400 to-emerald-500 text-white rounded-full shadow hover:from-emerald-700 hover:to-indigo-800 transition"
          >
            <FaFolder /> コレクションセット一覧
          </button>
          <button
            onClick={goToFavs}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-400 to-pink-500 text-white rounded-full shadow hover:from-yellow-600 hover:to-yellow-700 transition"
          >
            <FaHeart /> お気に入り一覧
          </button>
        </div>

      {/* コレクションセット */}
      <div>
        {loading ? (
          <LoadingIndicator />
        ) : (
          <div className="bg-emerald-50 rounded-lg p-6 shadow-inner">
            <h2 className="text-2xl font-semibold text-emerald-700 mb-4 flex items-center gap-2">
              <FaFolder /> コレクションセット
            </h2>
            {collectionSets.map((set) => (
              <div
                key={set.id}
                className="mb-4 border border-emerald-200 rounded-lg bg-white overflow-hidden"
              >
                {/* セットヘッダー */}
                <div
                  className="flex items-center justify-between p-4 bg-emerald-200 hover:bg-emerald-300 cursor-pointer transition"
                  onClick={() => toggleExpand(set.id)}
                >
                  <label className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      className="accent-emerald-600"
                      checked={selectedSetIds.includes(set.id)}
                      onChange={() => toggleSet(set)}
                    />
                    <FaFolder className="text-emerald-600" />
                    <span className="font-medium text-emerald-800">{set.name}</span>
                  </label>
                  {expandedSetIds.has(set.id) ? (
                    <FaChevronDown className="text-emerald-600" />
                  ) : (
                    <FaChevronRight className="text-emerald-600" />
                  )}
                </div>

                {/* 配下コレクション */}
                {expandedSetIds.has(set.id) && (
                  <div className="bg-emerald-100 p-4 grid grid-cols-2 gap-3">
                    {set.collections.map((col) => (
                      <div
                        key={col.id}
                        className="flex items-center justify-between bg-white p-3 rounded shadow-sm hover:shadow-md transition"
                      >
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            className="accent-emerald-600"
                            checked={selectedCols.includes(col.id)}
                            onChange={() => toggleCol(col.id)}
                          />
                          <FaBook className="text-sky-600" />
                          <span className="text-sky-700">{col.name}</span>
                        </label>
                        <button
                          onClick={() => goToQuestions(col.id)}
                          className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition"
                          title="問題ページへ"
                        >
                          <IoArrowRedoSharp />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* お気に入りコレクション */}
      {!loading && favoriteCollections.length > 0 && (
        <div className="bg-pink-50 rounded-lg p-6 shadow-inner">
          <h2 className="text-xl font-semibold text-pink-700 mb-4 flex items-center gap-2">
            <FaHeart /> お気に入りコレクション
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {favoriteCollections.map((col) => (
              <div
                key={col.id}
                className="flex items-center justify-between bg-white p-3 rounded shadow-sm hover:shadow-md transition"
              >
                <label className="flex items-center gap-2 ">
                  <input
                    type="checkbox"
                    className="accent-pink-600"
                    checked={selectedCols.includes(col.id)}
                    onChange={() => toggleCol(col.id)}
                  />
                  <FaBook className="text-sky-600" />
                  <span className="text-sky-800">{col.name}</span>
                </label>
                <button
                  onClick={() => goToQuestions(col.id)}
                  className="p-2 bg-pink-600 text-white rounded-full hover:bg-pink-700 transition"
                  title="問題ページへ"
                >
                  <IoArrowRedoSharp />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 下部確定ボタン */}
      {!loading && (
        <div className="text-center">
          <button
            onClick={() => onSelectionChange(selectedCols)}
            className="bg-indigo-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:bg-indigo-800 transition"
          >
            選択を確定
          </button>
        </div>
      )}
    </div>
  );
};

export default CollectionSelector;
