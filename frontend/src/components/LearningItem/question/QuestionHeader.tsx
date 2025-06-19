import React, { useState } from "react";
import { FaEdit, FaSave, FaTimes } from "react-icons/fa";
import { Question } from "../../../types/question";
import { updateQuestion } from "../../../api/QuestionAPI";

interface Props {
  question: Question;
  isOwner: boolean;
}

const QuestionHeader: React.FC<Props> = ({ question, isOwner }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [questionText, setQuestionText] = useState(question.questionText);
  const [correctAnswer, setCorrectAnswer] = useState(question.correctAnswer);
  const [descriptionText, setDescription] = useState(question.descriptionText);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setLoading(true);
      await updateQuestion(question.id, {
        questionText,
        correctAnswer,
        descriptionText,
      });
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      setError("保存に失敗しました。");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setQuestionText(question.questionText);
    setCorrectAnswer(question.correctAnswer);
    setDescription(question.descriptionText);
    setError("");
    setIsEditing(false);
  };

  return (
    <div className="bg-white p-4 rounded-2xl shadow-md border mb-4">
      {isEditing ? (
        <div className="space-y-3">
          <input
            className="w-full border-b"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            placeholder="問題文"
            disabled={loading}
          />
          <input
            className="w-full border-b"
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
            placeholder="正解"
            disabled={loading}
          />
          <textarea
            className="w-full border rounded p-2"
            value={descriptionText}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="説明文"
            disabled={loading}
          />
          <div className="flex space-x-3">
            <button
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
              onClick={handleSave}
              disabled={loading}
            >
              <FaSave className="inline mr-1" /> 保存
            </button>
            <button
              className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
              onClick={handleCancel}
              disabled={loading}
            >
              <FaTimes className="inline mr-1" /> キャンセル
            </button>
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
      ) : (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">{questionText}</h3>
          <p className="text-green-600 font-medium">正解: {correctAnswer}</p>
          <p className="text-gray-700">{descriptionText}</p>
          {isOwner && (
            <button
              className="bg-blue-500 text-white px-3 py-1.5 rounded-lg hover:bg-blue-600"
              onClick={() => setIsEditing(true)}
            >
              <FaEdit className="inline mr-1" /> 編集
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuestionHeader;
