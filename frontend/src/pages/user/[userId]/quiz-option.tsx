import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CollectionSelector from "./../../../components/quiz/CollectionSelector";
import { FilterCondition, SortCondition, SortKey, SortDirection, FilterType } from "../../../types/quiz";

const QuizOption: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);

  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [sorts, setSorts] = useState<SortCondition[]>([]);
  const [limit, setLimit] = useState(10);

  const handleCollectionSelection = (selected: number[]) => {
    console.log("a");
    setSelectedCollections(selected);
    setShowModal(true);
  };

  const handleStartQuiz = async () => {
    const query = new URLSearchParams({
      collectionIds: selectedCollections.join(","),
      limit: JSON.stringify(limit),
      filters: JSON.stringify(filters),
      sorts: JSON.stringify(sorts),
    }).toString();
    navigate(`/quiz/start?${query}`);
  };

  const toggleFilter = (type: FilterType, value?: number)  => {
    setFilters((prev) => {
      const exists = prev.find((f) => f.type === type);
      if (exists) return prev.filter((f) => f.type !== type);
      return [...prev, { type, value }];
    });
  };

  const toggleSort = (key: SortKey, direction: SortDirection) => {
    setSorts((prev) => {
      const exists = prev.find((s) => s.key === key && s.direction === direction);
      if (exists) return prev.filter((s) => !(s.key === key && s.direction === direction));
      return [...prev, { key, direction }];
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">クイズの設定</h2>

      <div className="bg-white shadow-md p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold mb-2">問題集を選択</h3>
        <CollectionSelector userId={Number(userId)} onSelectionChange={handleCollectionSelection} />
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-xl font-bold mb-4">フィルタ・ソート条件</h3>

            <div className="mb-4">
              <label className="block font-semibold mb-1">フィルター:</label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.some(f => f.type === 'NOT_SOLVED')}
                    onChange={() => toggleFilter('NOT_SOLVED')}
                  />
                  <span className="ml-2">未解答</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={filters.some(f => f.type === 'WRONG_COUNT')}
                    onChange={() => toggleFilter('WRONG_COUNT', 2)}
                  />
                  <span className="ml-2">2回以上間違えた</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label className="block font-semibold mb-1">ソート:</label>
              <div className="space-y-1">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sorts.some(s => s.key === 'RANDOM')}
                    onChange={() => toggleSort('RANDOM', 'ASC')}
                  />
                  <span className="ml-2">ランダム</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={sorts.some(s => s.key === 'WRONG' && s.direction === 'DESC')}
                    onChange={() => toggleSort('WRONG', 'DESC')}
                  />
                  <span className="ml-2">間違い回数（降順）</span>
                </label>
              </div>
            </div>

            <div className="mb-4">
              <label>出題数: {limit}</label>
              <input
                type="range"
                min="1"
                max="100"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full"
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-black px-4 py-2 rounded"
              >
                キャンセル
              </button>
              <button
                onClick={handleStartQuiz}
                className="bg-green-500 text-white px-4 py-2 rounded"
              >
                開始する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizOption;
