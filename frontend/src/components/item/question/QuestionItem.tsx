import React, { useState } from "react";
import { Question, QuestionInput } from "../../../types/question"; // Question型とQuestionInput型
import { ErrorCode } from "../../../types/error";
import { handleAPIError } from "../../../api/handleAPIError";
import { FaCheck, FaEdit, FaTrash, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface Props {
  question: Question | QuestionInput;
  userId: number | undefined;
  isNew: boolean;
  isOwner: boolean;
  isAnswerVisible: boolean;
  errorMessages: ErrorCode[];
  onChange: (updated: QuestionInput) => void;
  onDelete: () => void;
  toggleAnswerVisibility: () => void | null;
}
const QuestionItem: React.FC<Props> = ({
  question,
  userId,
  isNew,
  isOwner,
  isAnswerVisible,
  errorMessages,
  onChange,
  onDelete,
  toggleAnswerVisibility
}) => {
  const [isEditing, setIsEditing] = useState(isNew);
  const [questionText, setQuestionText] = useState(question.questionText);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);
  const [descriptionText, setDescriptionText] = useState(question.descriptionText || "");
  const navigate = useNavigate();

  const onComplete = () => {
    setIsEditing(false);
    onChange({ questionText, correctAnswer, descriptionText });
  };

  const handleNavigate = () => {
    if ("id" in question) {
      navigate(`/user/${userId}/question/${question.id}`);
    }
  };

  return (
    <div className="p-5  rounded-lg hover:shadow-md duration-200 w-full max-w-3xl mx-auto">
      {isEditing && isOwner ? (
        <div className="space-y-6 bg-gray-50 p-6 border border-gray-200 rounded-lg shadow-inner">
          {/* 問題文 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">問題文</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none text-base shadow-sm"
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="問題文を入力"
            />
          </div>

          {/* 正解 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">正解</label>
            <input
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none text-base shadow-sm"
              value={correctAnswer}
              onChange={(e) => setCorrectAnswer(e.target.value)}
              placeholder="正解を入力"
            />
          </div>

          {/* 説明 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">説明（任意）</label>
            <textarea
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-400 focus:outline-none text-base shadow-sm"
              rows={4}
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="解説や補足があれば記述"
            />
          </div>

          {/* アクションボタン */}
          <div className="flex flex-wrap gap-4 pt-2">
            <button
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 transition"
              onClick={onComplete}
            >
              <FaCheck className="mr-2" /> 完了
            </button>
            <button
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-500 rounded-md hover:bg-red-600 transition"
              onClick={onDelete}
            >
              <FaTrash className="mr-2" /> 削除
            </button>
          </div>
        </div>

      ) : (
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center space-x-3 cursor-pointer" onClick={handleNavigate}>
              <span className="text-lg font-semibold text-blue-600 hover:underline break-all">
                {questionText}
              </span>
            </div>
          </div>
          {isOwner && (
            <div className="flex-shrink-0 flex space-x-4">
              <button
                className="flex items-center text-yellow-500 hover:text-yellow-600 transition space-x-1"
                onClick={() => setIsEditing(true)}
                title="編集"
              >
                <FaEdit /> <span>編集</span>
              </button>
              <div className="w-px bg-gray-300 h-5 my-auto" />
              <button
                className="flex items-center text-red-500 hover:text-red-600 transition space-x-1"
                onClick={onDelete}
                title="削除"
              >
                <FaTrash /> <span>削除</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Answer and Description Toggle Buttons */}
      {!isNew && (
        <div className="flex space-x-3 mt-3">
          <button
            className="flex items-center text-green-500 hover:text-green-600 transition space-x-1"
            onClick={toggleAnswerVisibility}
          >
            {isAnswerVisible ? <FaEyeSlash /> : <FaEye />} <span>解答</span>
          </button>
        </div>
      )}

      {/* Display Answer and Description */}
      {isAnswerVisible && (
        <div>
          <div className="mt-3 p-3 bg-gray-100 rounded-md">
            <strong>解答: </strong> {correctAnswer}
          </div>
          {descriptionText && (
            <div className="mt-3 p-3 bg-gray-100 rounded-md">
              <strong>説明: </strong> {descriptionText} 
            </div>
          )}
        </div>
      )}

      {errorMessages && errorMessages.length > 0 && (
        <ul className="mt-3 text-sm space-y-1">
          {errorMessages.map((err, idx) => (
            <li key={idx} className="flex items-start text-red-600">
              <span className="mr-1">⚠️</span>
              {handleAPIError(err)}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default QuestionItem;