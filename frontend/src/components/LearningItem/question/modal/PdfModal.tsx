// src/components/modals/PdfModal.tsx
import { useState } from "react";
import { pdfGenerateQuestions } from "../../../../api/GenerationAPI"; // 上記で作成したAPI関数をインポート
import { Question } from "../../../../types/question";
import { BatchUpsertResponse } from "../../../../types/batchResponse";
import BaseModal from "../../../common/modal/baseModal";
import { CoreColorKey } from "../../../../style/colorStyle";
import BaseLabel from "../../../baseComponents/BaseLabel";
import { handleError } from "../../../../api/handleAPIError";
import { FontWeightKey } from "../../../../style/fontWeight";
import InLineTextInput from "../../../baseComponents/InLineTextInput";
import BaseRangeInput from "../../../baseComponents/BaseRangeInput";

const PdfModal = ({ collectionId, onClose, onComplete }: { collectionId: number; onClose: () => void, onComplete: (response: BatchUpsertResponse<Question>) => void }) => {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [theme, setTheme] = useState(""); // 追加: テーマ入力用
  const [numQuestions, setNumQuestions] = useState<string>("10"); // 追加: 質問数入力用 (文字列で管理し、API呼び出し時に数値に変換)

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setFile(event.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file) {
      setError("PDFファイルを選択してください。");
      return;
    }

    const parsedNumQuestions = parseInt(numQuestions, 10);
    if (isNaN(parsedNumQuestions) || parsedNumQuestions <= 0) {
      setError("質問数は正の整数で入力してください。");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      // API呼び出しを pdfGenerateQuestions に変更し、テーマと質問数を渡す
      const response = await pdfGenerateQuestions(collectionId, file, theme, parsedNumQuestions);
      setMessage("PDFのアップロードと問題生成が完了しました！");
      setTimeout(() => {
        onComplete(response);
      }, 2000);
    } catch (err) {
      const errorMessage = handleError(err);
      setError(errorMessage);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      title="PDFから問題を生成"
      onClose={onClose}
      onConfirm={handleSubmit}
      confirmButtonText="PDFをアップロードして生成"
      loadingConfirmButtonText="生成中..."
      loading={loading}
    >
      <div>
        <BaseLabel
          label="PDFファイル:"
          style={{
            fontWeightKey: FontWeightKey.Semibold
          }}
        />
        <input
          type="file"
          accept=".pdf" // CSVからPDFに変更
          onChange={handleFileChange}
          className="w-full p-2 mt-2 border rounded-md border-gray-300"
        />
      </div>

      <div className="mt-4">
        <BaseLabel
          label="クイズのテーマ (任意):"
          style={{
            fontWeightKey: FontWeightKey.Semibold
          }}
        />
        <InLineTextInput
          value={theme}
          onChange={(value) => setTheme(value)}
          placeholder="例: スペイン語動詞の活用"
        />
      </div>

          <div>
            <BaseLabel
                label="生成する問題数: "
                style={{
                    fontWeightKey: FontWeightKey.Semibold,
                }}
            />
            <div>
              <InLineTextInput
                  defaultValue={numQuestions}
                  value={numQuestions}
                  onChange={(value: string) =>  setNumQuestions(value)}
                  
              />
            </div>

            <BaseRangeInput
              min={0}
              max={100}
              value={Number(numQuestions)}
              onChange={(value) =>  setNumQuestions(value.toString())}
            />

          </div>

      {error && (
        <BaseLabel
          label={error}
          style={{
            color: {
              colorKey: CoreColorKey.Danger // エラーはDangerカラーが適切
            }
          }}
          center={true}
        />
      )}
      {message && (
        <BaseLabel
          label={message}
          style={{
            color: {
              colorKey: CoreColorKey.Success
            }
          }}
          center={true}
        />
      )}
    </BaseModal>
  );
};

export default PdfModal;