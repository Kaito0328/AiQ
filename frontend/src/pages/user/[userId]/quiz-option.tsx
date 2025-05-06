import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CollectionSelector from "../../../components/quiz/CollectionSelector";
import { FilterCondition, SortCondition, SortKey, SortDirection, FilterType } from "../../../types/quiz";
import { FaFilter, FaSortAmountDown } from "react-icons/fa";
import { useUser } from "../../../hooks/useUser";

type FilterItemProps = {
  label: string;
  type: FilterType;
  value?: number;
  filters: FilterCondition[];
  setFilters: React.Dispatch<React.SetStateAction<FilterCondition[]>>;
  inputType?: "number";
};

const FilterItem: React.FC<FilterItemProps> = ({ label, type, value, filters, setFilters, inputType }) => {
  const current = filters.find((f) => f.type === type);

  const toggle = () => {
    if (current) {
      setFilters((prev) => prev.filter((f) => f.type !== type));
    } else {
      setFilters((prev) => [...prev, { type, value }]);
    }
  };

  const updateValue = (v: number) => {
    setFilters((prev) =>
      prev.map((f) =>
        f.type === type ? { ...f, value: v } : f
      )
    );
  };

  return (
    <div className="flex items-center gap-2">
      <input
        type="checkbox"
        checked={!!current}
        onChange={toggle}
      />
      <span>{label}</span>
      {inputType === "number" && current && (
        <input
          type="number"
          min={1}
          max={10}
          value={current.value ?? value ?? 2}
          onChange={(e) => updateValue(Number(e.target.value))}
          className="w-16 px-2 py-1 border rounded"
        />
      )}
    </div>
  );
};

type SortItemProps = {
  label: string;
  keyName: SortKey;
  sorts: SortCondition[];
  setSorts: React.Dispatch<React.SetStateAction<SortCondition[]>>;
  options: { label: string; direction: SortDirection }[];
};

const SortItem: React.FC<SortItemProps> = ({ label, keyName, sorts, setSorts, options }) => {
  const current = sorts.find((s) => s.key === keyName);

  const update = (dir: SortDirection) => {
    setSorts((prev) => {
      const exists = prev.find((s) => s.key === keyName);
      if (exists) {
        return prev.map((s) => s.key === keyName ? { ...s, direction: dir } : s);
      }
      return [...prev, { key: keyName, direction: dir }];
    });
  };

  return (
    <div>
      <span className="mr-2">{label}:</span>
      {options.map(opt => (
        <label key={opt.direction} className="mr-3">
          <input
            type="radio"
            name={`sort-${keyName}`}
            checked={current?.direction === opt.direction}
            onChange={() => update(opt.direction)}
          />
          <span className="ml-1">{opt.label}</span>
        </label>
      ))}
    </div>
  );
};

const QuizOption: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [sorts, setSorts] = useState<SortCondition[]>([]);
  const [limit, setLimit] = useState(10);
  const { user }= useUser(Number(userId));

  const handleCollectionSelection = (selected: number[]) => {
    setSelectedCollections(selected);
    setShowModal(true);
  };

  const handleStartQuiz = () => {
    const query = new URLSearchParams({
      collectionIds: selectedCollections.join(","),
      limit: JSON.stringify(limit),
      filters: JSON.stringify(filters),
      sorts: JSON.stringify(sorts),
    }).toString();
    navigate(`/quiz/start?${query}`);
  };

  return (
    <div className="p-6  w-full bg-gradient-to-br from-gray-100 to-blue-100 rounded-lg shadow-lg min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">クイズの設定</h2>

    <div>
      <CollectionSelector userId={Number(userId)} isOfficial={user?.official} onSelectionChange={handleCollectionSelection} />
    </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-full max-w-md text-gray-800">
            <h3 className="text-2xl font-bold mb-4 flex items-center gap-2">
              クイズ条件の設定
            </h3>

            {/* Filters */}
            <div className="mb-6">
              <div className="font-semibold flex items-center gap-2 mb-2 text-gray-700">
                <FaFilter className="text-gray-500" />
                <span>フィルタ</span>
              </div>
              <div className="space-y-3">
                <FilterItem
                  label="未解答の問題"
                  type="NOT_SOLVED"
                  filters={filters}
                  setFilters={setFilters}
                />
                <FilterItem
                  label="指定回数以上間違えた"
                  type="WRONG_COUNT"
                  value={2}
                  filters={filters}
                  setFilters={setFilters}
                  inputType="number"
                />
              </div>
            </div>

            {/* Sorts */}
            <div className="mb-6">
              <div className="font-semibold flex items-center gap-2 mb-2 text-gray-700">
                <FaSortAmountDown className="text-gray-500" />
                <span>ソート</span>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sorts.some(s => s.key === 'RANDOM')}
                    onChange={() => {
                      const exists = sorts.find(s => s.key === 'RANDOM');
                      setSorts((prev) =>
                        exists ? prev.filter(s => s.key !== 'RANDOM') : [...prev, { key: 'RANDOM', direction: 'ASC' }]
                      );
                    }}
                  />
                  ランダム
                </label>

                <SortItem
                  label="間違い回数でソート"
                  keyName="WRONG"
                  sorts={sorts}
                  setSorts={setSorts}
                  options={[
                    { label: "昇順", direction: "ASC" },
                    { label: "降順", direction: "DESC" },
                  ]}
                />
              </div>
            </div>

            {/* 出題数 */}
            <div className="mb-6">
              <label className="block font-semibold mb-1">出題数: {limit}</label>
              <input
                type="range"
                min="1"
                max="100"
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full accent-blue-600"
              />
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                キャンセル
              </button>
              <button
                onClick={handleStartQuiz}
                className="px-5 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white shadow-md"
              >
                クイズを開始
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizOption;
