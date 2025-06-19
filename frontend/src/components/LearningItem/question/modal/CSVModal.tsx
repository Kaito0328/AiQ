import { useState } from "react";
import { csvGenerateQuestions } from "../../../../api/GenerationAPI";
import { Question } from "../../../../types/question";
import { BatchUpsertResponse } from "../../../../types/batchResponse";

const CsvModal = ({ collectionId, onClose, onComplete }: { collectionId: number; onClose: () => void, onComplete: (response: BatchUpsertResponse<Question>) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("CSVファイルを選択してください。");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await csvGenerateQuestions(collectionId, file);
        setMessage("CSVのアップロードが完了しました！");
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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl p-8 rounded-lg shadow-lg">
        <h1 className="text-center text-2xl font-semibold text-gray-800 mb-6">CSVから問題を生成</h1>

        <div className="space-y-6">
          <div>
            <label className="block font-medium text-gray-700">CSVファイル:</label>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full p-2 mt-2 border rounded-md border-gray-300"
            />
          </div>
        </div>

        <div className="flex justify-center mt-8">
          {!message && (
            <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-64 py-3 bg-green-500 text-white text-lg font-semibold rounded-md hover:bg-green-600 focus:ring-4 focus:ring-green-200 transition duration-300"
          >
            {loading ? "アップロード中..." : "CSVをアップロード"}
          </button>
          )}
        </div>

        {error && <p className="text-red-500 text-center mt-4">{error}</p>}
        {message && <p className="text-blue-500 text-center mt-4">{message}</p>}

        <div className="flex justify-center mt-6">
          <button
            onClick={onClose}
            className="py-2 px-4 bg-gray-300 text-gray-700 text-lg font-semibold rounded-md hover:bg-gray-400 focus:ring-4 focus:ring-gray-200 transition duration-300"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};

export default CsvModal;
