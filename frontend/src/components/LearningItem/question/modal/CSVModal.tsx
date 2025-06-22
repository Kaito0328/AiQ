import { useState } from "react";
import { csvGenerateQuestions } from "../../../../api/GenerationAPI";
import { Question } from "../../../../types/question";
import { BatchUpsertResponse } from "../../../../types/batchResponse";
import BaseModal from "../../../common/modal/baseModal";
import { CoreColorKey } from "../../../../style/colorStyle";
import BaseLabel from "../../../baseComponents/BaseLabel";
import { handleError } from "../../../../api/handleAPIError";
import { FontWeightKey } from "../../../../style/fontWeight";

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
      const errorMessage =handleError(err);
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
        <BaseModal title="CSVから問題を生成" onClose={onClose} onConfirm={handleSubmit} confirmButtonText="CSVをアップロード" loadingConfirmButtonText="アップロード中..." loading={loading}>
          <div>
            <BaseLabel
              label="CSVファイル:"
              style={{
                fontWeightKey: FontWeightKey.Semibold
              }}

            />
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full p-2 mt-2 border rounded-md border-gray-300"
            />
          </div>

      <BaseLabel
        label={error}
        style={{
          color: {
            colorKey: CoreColorKey.Success
          }
        }}
        center={true}
      />
      <BaseLabel
        label={message}
        style={{
          color: {
            colorKey: CoreColorKey.Success
          }
        }}
        center={true}
      />

    </BaseModal>
  );
};

export default CsvModal;
