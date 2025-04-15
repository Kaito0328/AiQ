import React, { useEffect, useState } from "react";
import { Question } from "../../types/question";
import { useQuestionActions } from "./UserQuestionActions";
import { useQuestionLocalActions } from "./UserQuestionLocalActions";
import { useQuestionState } from "./userQuestionState";
import { FaCheckSquare, FaFileCsv, FaPlus, FaRobot, FaSave, FaTimesCircle, FaTrashAlt } from "react-icons/fa";
import QuestionItem from "./QuestionItem";
import { motion } from "framer-motion";
import CSVModal from "./CSVModal";
import AIModal from "./AIModal";
import { BatchUpsertResponse } from "../../types/batchResponse";
interface Props {
  collectionId: number;
  userId: number | undefined;
  isOwner: boolean;
}
const QuestionList: React.FC<Props> = ({ collectionId, userId, isOwner }) => {
  const state = useQuestionState();
  const { handleGetQuestion, handleQuestionBatchUpsert, handleDelete, handleBatchDelete } = useQuestionActions(collectionId, state);
  const { handleLocalCreate, handleLocalUpdate, handleAddPendingCreation, toggleSelect } = useQuestionLocalActions(state);
  const [showAllAnswer, setShowAllAnswer] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalType, setModalType] = useState<"csv" | "ai" | null>(null);
  


  const [isSelecting, setIsSelecting] = useState(false);

  const toggleAllAnswers = () => {
    const reversedShow = !showAllAnswer;
    setShowAllAnswer(reversedShow);
    state.setAnswerVisibilityMap(() => {
      const newMap: Record<number, boolean> = {};
      state.questions.forEach((question) => {
        newMap[question.id] = reversedShow;
      });
      return newMap;
    }
    );
  };

  const toggleAnswerVisibleFor = (id: number) => {
    state.setAnswerVisibilityMap((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // 初期質問の読み込み
  useEffect(() => {
    if (!collectionId) return;
    (async () => {
      await handleGetQuestion(collectionId);
    })();
  }, [collectionId, handleGetQuestion]);

  const toggleSelectMode = () => {
    setIsSelecting((prev) => !prev);
    state.setSelectedIds([]); // モード切替時に選択解除
  };

  const openModal = (type: "csv" | "ai") => {
    setIsExpanded(false); // 選択肢を閉じる
    setTimeout(() => setModalType(type), 300); // アニメーション後にモーダルを開く
  };

  const toggleMenu = () => setIsExpanded(!isExpanded);

  
  const closeModal = () => setModalType(null);

  const onComplete = (response: BatchUpsertResponse<Question>) => {
    setModalType(null);
    state.setQuestions((prev) => [...prev, ...response.successItems]);
  }

  return (
    <div>
      <div className="flex space-x-4 mb-4">
        <button
          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          onClick={toggleAllAnswers}
        >
          {showAllAnswer ? "解答を非表示" : "解答を表示"}
        </button>
      </div>
      <ul className="space-y-4">
        {state.questions.map((question: Question) => (
          <div
            key={`existing-${question.id}`}
            className="flex items-start space-x-3 p-2 bg-gray-50 rounded-lg shadow-sm"
          >
            {isSelecting && (
              <input
                type="checkbox"
                className="mt-3 accent-blue-500 scale-125"
                checked={state.selectedIds.includes(question.id)}
                onChange={() => toggleSelect(question.id)}
              />
            )}
            <QuestionItem
              question={question}
              userId={userId}
              isOwner={isOwner}
              isNew={false}
              errorMessages={state.updateErrors[question.id]}
              onChange={(updated) => handleLocalUpdate(question.id, updated)}
              onDelete={() => handleDelete(question.id)}
              isAnswerVisible={state.answerVisibilityMap[question.id] || false}
              toggleAnswerVisibility={() => toggleAnswerVisibleFor(question.id)}
            />
          </div>
        ))}

        {state.pendingCreations.map((question, index) => (
          <div key={`new-${index}`} className="p-2 bg-yellow-50 rounded-lg shadow-sm">
            <QuestionItem
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
          </div>
        ))}
      </ul>

      {isOwner && (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="flex items-center space-x-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition"
            onClick={handleAddPendingCreation}
          >
            <FaPlus />
            <span>新規追加</span>
          </button>

          <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition text-white ${
              state.pendingCreations.length === 0 && state.pendingUpdates.length === 0
                ? "bg-green-300 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-600"
            }`}
            onClick={handleQuestionBatchUpsert}
            disabled={state.pendingCreations.length === 0 && state.pendingUpdates.length === 0}
          >
            <FaSave />
            <span>一括保存</span>
          </button>

           <button
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition ${
              isSelecting ? "bg-gray-500 hover:bg-gray-600" : "bg-yellow-500 hover:bg-yellow-600"
            }`}
            onClick={toggleSelectMode}
          >
            {isSelecting ? <FaTimesCircle /> : <FaCheckSquare />}
            <span>{isSelecting ? "選択解除" : "選択"}</span>
          </button>
    
          {isSelecting && (
            <button
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-white transition ${
                state.selectedIds.length === 0
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-red-500 hover:bg-red-600"
              }`}
              onClick={() => handleBatchDelete(state.selectedIds)}
              disabled={state.selectedIds.length === 0}
            >
              <FaTrashAlt />
              <span>選択削除</span>
            </button>
          )}
        </div>
      )}
      <div className="fixed bottom-6 right-6">
        {isExpanded && (
          <>
            <motion.button
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, x: -80, y: -20 }}
              exit={{ opacity: 0 }}
              className="absolute bg-blue-500 text-white p-3 rounded-full shadow-lg"
              onClick={() => openModal("ai")}
            >
              <FaRobot />
              <span className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-sm bg-gray-700 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                AIによる問題生成
              </span>
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, x: -20, y: -80 }}
              exit={{ opacity: 0 }}
              className="absolute bg-green-500 text-white p-3 rounded-full shadow-lg"
              onClick={() => openModal("csv")}
            >
              <FaFileCsv />
              <span className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-sm bg-gray-700 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                CSVファイルアップロード
              </span>
            </motion.button>
          </>
        )}

        {/* プラスボタン */}
        <button
          className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-transform transform hover:scale-110"
          onClick={toggleMenu}
        >
        <span className="absolute bottom-12 left-1/2 transform -translate-x-1/2 text-sm bg-gray-700 text-white rounded-lg p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                CSVファイルアップロード
        </span>
          <FaPlus />
        </button>
      </div>

      {/* モーダル表示 */}
      {modalType === "csv" && <CSVModal onClose={closeModal} onComplete={onComplete} collectionId={Number(collectionId)}/>}
      {modalType === "ai" && <AIModal onClose={closeModal} onComplete={onComplete} collectionId={Number(collectionId)}/>}
    </div>
  );
};
export default QuestionList;