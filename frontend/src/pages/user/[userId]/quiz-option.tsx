import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import CollectionSelector from "./../../../components/quiz/CollectionSelector";

const QuizOption: React.FC = () => {
  const { userId } = useParams(); // URLパラメータから userId を取得
  const navigate = useNavigate();

  const [questionOrder, setQuestionOrder] = useState("random");
  const [questionCount, setQuestionCount] = useState(10);
  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);

  const handleCollectionSelection = (selected: number[]) => {
    setSelectedCollections(selected);
  };

  const handleStart = () => {
    navigate("/questions", {
      state: { userId: Number(userId), selectedCollections, questionOrder, questionCount },
    });
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">クイズの設定</h2>

      <div className="bg-white shadow-md p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold mb-2">出題順</h3>
        <div className="flex gap-4">
          {["random", "asc", "desc"].map((order) => (
            <label key={order} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="questionOrder"
                value={order}
                checked={questionOrder === order}
                onChange={(e) => setQuestionOrder(e.target.value)}
                className="hidden"
              />
              <div
                className={`px-4 py-2 border rounded-lg ${
                  questionOrder === order
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100"
                }`}
              >
                {order === "random" ? "ランダム" : order === "asc" ? "昇順" : "降順"}
              </div>
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white shadow-md p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold mb-2">出題数</h3>
        <input
          type="range"
          min="1"
          max="100"
          value={questionCount}
          onChange={(e) => setQuestionCount(Number(e.target.value))}
          className="w-full"
        />
        <div className="text-center mt-2">{questionCount} 問</div>
      </div>

      <div className="bg-white shadow-md p-4 rounded-lg mb-4">
        <h3 className="text-lg font-semibold mb-2">問題集を選択</h3>
        <CollectionSelector userId={Number(userId)} onSelectionChange={handleCollectionSelection} />
      </div>

      <button
        className={`w-full py-3 text-lg font-bold text-white rounded-lg ${
          selectedCollections.length === 0
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-green-500 hover:bg-green-600"
        }`}
        onClick={handleStart}
        disabled={selectedCollections.length === 0}
      >
        問題を開始
      </button>
    </div>
  );
};

export default QuizOption;
