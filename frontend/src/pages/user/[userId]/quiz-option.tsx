import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FilterCondition, SortCondition } from "../../../types/quiz";
import { useUser } from "../../../hooks/useUser";
import CollectionSelector from "../../../components/quiz-option/collectionSelect/CollectionSelector";
import QuizConditionModal from "../../../components/quiz-option/optionModal/QuizConditionModal";


const QuizOption: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user }= useUser(Number(userId));

  const handleCollectionSelection = (selected: number[]) => {
    setSelectedCollections(selected);
    setShowModal(true);
  };

  const handleStartQuiz = (filters: FilterCondition[], sorts: SortCondition[], limit: number) => {
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
        <QuizConditionModal
          onCancel={() => setShowModal(false)}
          handleStart={handleStartQuiz}
          loading={loading}
        />
      )}
    </div>
  );
};

export default QuizOption;
