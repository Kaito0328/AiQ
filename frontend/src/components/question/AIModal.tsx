import { useState } from "react";
import { aiGenerateQuestions } from "../../api/GenerationAPI";
import { AiGenerationRequest } from "../../types/types";
import { Question } from "../../types/question";
import { BatchUpsertResponse } from "../../types/batchResponse";

const AIModal = ({ collectionId, onClose, onComplete }: { collectionId: number, onClose: () => void, onComplete: (response: BatchUpsertResponse<Question>) => void }) => {
  const [requestData, setRequestData] = useState<AiGenerationRequest>({
    theme: "",
    question_format: "",
    answer_format: "",
    question_example: "",
    answer_example: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const generateQuestions = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await aiGenerateQuestions(collectionId, requestData);
      setMessage("問題の保存が完了しました！");
      setTimeout(() => {
        onComplete(response);
      }, 2000);
    } catch (err) {
      setError("エラーが発生しました");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRequestData((prevData: AiGenerationRequest) => ({
      ...prevData,
      [name]: value,
    }));
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-xl">
        <h1 className="text-center text-2xl font-semibold text-gray-800 mb-6">AI 問題生成</h1>

        <div className="space-y-6">
          <div>
            <label className="block font-medium text-gray-700">テーマ:</label>
            <input
              type="text"
              name="theme"
              value={requestData.theme}
              onChange={handleInputChange}
              placeholder="例: 数学、歴史"
              className="w-full p-3 mt-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">出力形式 (問題):</label>
            <input
              type="text"
              name="question_format"
              value={requestData.question_format}
              onChange={handleInputChange}
              placeholder="例: 問題形式: 問題文"
              className="w-full p-3 mt-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">出力形式 (解答):</label>
            <input
              type="text"
              name="answer_format"
              value={requestData.answer_format}
              onChange={handleInputChange}
              placeholder="例: 解答形式: 答え"
              className="w-full p-3 mt-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">例 (問題):</label>
            <input
              type="text"
              name="question_example"
              value={requestData.question_example}
              onChange={handleInputChange}
              placeholder="例: 5 + 3 は何ですか？"
              className="w-full p-3 mt-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">例 (解答):</label>
            <input
              type="text"
              name="answer_example"
              value={requestData.answer_example}
              onChange={handleInputChange}
              placeholder="例: 8"
              className="w-full p-3 mt-2 border rounded-md border-gray-300 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <button
            onClick={generateQuestions}
            disabled={loading}
            className="w-64 py-3 bg-green-500 text-white text-lg font-semibold rounded-md hover:bg-green-600 focus:ring-4 focus:ring-green-200 transition duration-300"
          >
            {loading ? "生成中..." : "問題を生成"}
          </button>
        </div>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {message && <p className="text-blue-500 text-center mt-4">{message}</p>}

        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="w-64 py-3 bg-gray-500 text-white text-lg font-semibold rounded-md hover:bg-gray-600 focus:ring-4 focus:ring-gray-200 transition duration-300"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIModal;
