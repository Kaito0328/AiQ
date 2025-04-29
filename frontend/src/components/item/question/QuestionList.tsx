interface Props {
  collectionId: number;
  userId: number | undefined;
  isOwner: boolean;
}

import EditableItemList from "../layout/ItemList";
import QuestionItem from "./QuestionItem";
import { useState, useEffect } from "react";
import { useQuestionState } from "./hook/useQuestionState";
import { useQuestionActions } from "./hook/UseQuestionActions";
import { useQuestionLocalActions } from "./hook/UseQuestionLocalActions";
import { BatchUpsertResponse } from "../../../types/batchResponse";
import { Question } from "../../../types/question";
import QuestionModal from "./modal/QuestionModal";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const QuestionList: React.FC<Props> = ({ collectionId, userId, isOwner }) => {
  const state = useQuestionState();
  const {
    handleGetQuestion,
    handleQuestionBatchUpsert,
    handleDelete,
    handleBatchDelete,
  } = useQuestionActions(collectionId, state);
  const {
    handleLocalCreate,
    handleLocalUpdate,
    handleAddPendingCreation,
    toggleSelect,
  } = useQuestionLocalActions(state);

  const [showAllAnswer, setShowAllAnswer] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);

  useEffect(() => {
    if (!collectionId) return;
    (async () => {
      await handleGetQuestion(collectionId);
    })();
  }, [collectionId, handleGetQuestion]);

  const toggleSelectMode = () => {
    setIsSelecting((prev) => !prev);
    state.setSelectedIds([]);
  };

  const toggleAllAnswers = () => {
    const reversed = !showAllAnswer;
    setShowAllAnswer(reversed);
    state.setAnswerVisibilityMap(() => {
      const map: Record<number, boolean> = {};
      state.questions.forEach((q) => (map[q.id] = reversed));
      return map;
    });
  };

  const toggleAnswerVisibleFor = (id: number) => {
    state.setAnswerVisibilityMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const onComplete = (res: BatchUpsertResponse<Question>) => {
    state.setQuestions((prev) => [...prev, ...res.successItems]);
  };

  return (
    <div className="pb-32">
      <div className="flex space-x-4 mb-4">
        <button
          className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-all duration-300 ease-in-out transform hover:scale-105"
          onClick={toggleAllAnswers}
        >
          {/* アイコン */}
          {showAllAnswer ? (
            <FaEyeSlash className="text-lg" />
          ) : (
            <FaEye className="text-lg" />
          )}
          {/* ボタンテキスト */}
          <span>{showAllAnswer ? "全ての解答を非表示" : "全ての解答を表示"}</span>
        </button>
      </div>

      <EditableItemList
        items={state.questions}
        pendingCreations={state.pendingCreations}
        selectedIds={state.selectedIds}
        isSelecting={isSelecting}
        isOwner={isOwner}
        hasPendingUpsert={state.pendingUpdates.length > 0}
        onToggleSelectMode={toggleSelectMode}
        toggleSelect={toggleSelect}
        onAddPendingCreation={handleAddPendingCreation}
        onBatchUpsert={handleQuestionBatchUpsert}
        onBatchDelete={() => handleBatchDelete(collectionId, state.selectedIds)}
        renderItem={(question, isNew) => (
          <QuestionItem
            key={question.id}
            question={question}
            userId={userId}
            isOwner={isOwner}
            isNew={isNew}
            errorMessages={state.updateErrors[question.id]}
            onChange={(updated) => handleLocalUpdate(question.id, updated)}
            onDelete={() => handleDelete(question.id)}
            isAnswerVisible={state.answerVisibilityMap[question.id] || false}
            toggleAnswerVisibility={() => toggleAnswerVisibleFor(question.id)}
          />
        )}
        renderPendingItem={(question, index) => (
          <QuestionItem
            key={index}
            question={question}
            userId={userId}
            isOwner={isOwner}
            isNew={true}
            errorMessages={state.createErrors[index]}
            onChange={(updated) => handleLocalCreate(index, updated)}
            onDelete={() => {
              state.setPendingCreations((prev) =>
                prev.filter((_, i) => i !== index)
              );
            }}
            isAnswerVisible={true}
            toggleAnswerVisibility={() => {}}
          />
        )}
      />

      <QuestionModal
        collectionId={collectionId}
        onComplete={onComplete}
      />
    </div>
  );
};

export default QuestionList;
