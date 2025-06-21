import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FilterCondition, SortCondition } from "../../../types/quiz";
import { useUser } from "../../../hooks/useUser";
import CollectionSelector from "../../../components/quiz-option/collectionSelect/CollectionSelector";
import QuizConditionModal from "../../../components/quiz-option/optionModal/QuizConditionModal";
import Page from "../../../components/containerComponents/Page";


const QuizOption: React.FC = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
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
    <Page
      title="クイズの設定"
    >
      <div className="p-6  w-full min-h-screen">

      <div>
        <CollectionSelector userId={Number(userId)} isOfficial={user?.official} onSelectionChange={handleCollectionSelection} />
      </div>

        {showModal && (
          <QuizConditionModal
            onCancel={() => setShowModal(false)}
            handleStart={handleStartQuiz}
            loading={false}
          />
        )}
      </div>

    </Page>

  );
};

export default QuizOption;
