import BaseModal from "../../../common/modal/baseModal";
import { useState } from "react";
import { aiGenerateQuestions } from "../../../../api/GenerationAPI";
import { AiGenerationRequest } from "../../../../types/types";
import { Question } from "../../../../types/question";
import { BatchUpsertResponse } from "../../../../types/batchResponse";
import LabelWithInput from "../../../common/input/labelWithInput";
import ErrorMessageList from "../../../common/error/ErrorMessageList";
import { extractErrorCode } from "../../../../api/handleAPIError";
import BaseLabel from "../../../baseComponents/BaseLabel";
import { CoreColorKey } from "../../../../style/colorStyle";
import { ErrorCode } from "../../../../types/error";
import { SizeKey } from "../../../../style/size";
import BaseRangeInput from "../../../baseComponents/BaseRangeInput";
import InLineTextInput from "../../../baseComponents/InLineTextInput";
import { FontWeightKey } from "../../../../style/fontWeight";

const AIModal = ({
  collectionId,
  onClose,
  onComplete,
}: {
  collectionId: number;
  onClose: () => void;
  onComplete: (response: BatchUpsertResponse<Question>) => void;
}) => {
  const [requestData, setRequestData] = useState<AiGenerationRequest>({
    theme: "",
    question_format: "",
    answer_format: "",
    question_example: "",
    answer_example: "",
    question_number: 50,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ErrorCode[]>([]);
  const [message, setMessage] = useState("");

  const generateQuestions = async () => {
    setLoading(true);
    setError([]);
    setMessage("");
    try {
      const response = await aiGenerateQuestions(collectionId, requestData);
      setMessage("問題の保存が完了しました！");
      setTimeout(() => onComplete(response), 2000);
    } catch (err) {
      const code = extractErrorCode(err);
      setError([code]);
      console.log("エラーが発生しました");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (name: string, value: string) => {
    setRequestData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <BaseModal title="AI 問題生成" onClose={onClose} onConfirm={generateQuestions} confirmButtonText="問題を生成" loadingConfirmButtonText="問題を生成中,,," loading={loading}>
      <div className="space-y-6">
        {[
          { label: "テーマ:", name: "theme", placeholder: "例: 数学、歴史" },
          { label: "出力形式 (問題):", name: "question_format", placeholder: "例: 日本語" },
          { label: "出力形式 (解答):", name: "answer_format", placeholder: "例: 数字" },
          { label: "例 (問題):", name: "question_example", placeholder: "例: 5 + 3 は何ですか？" },
          { label: "例 (解答):", name: "answer_example", placeholder: "例: 8" },
        ].map((item) => (
          <LabelWithInput
            key={item.name}
            label={item.label}
            onChange={(value) => handleInputChange(item.name, value)}
            placeholder={item.placeholder}
            style={{
              size: {
                sizeKey: SizeKey.LG
              },
            }}
          />
        ))}
        <div>
          <BaseLabel
              label="生成する問題数: "
              style={{
                  fontWeightKey: FontWeightKey.Semibold,
              }}
          />
          <div>
            <InLineTextInput
                defaultValue={requestData.question_number.toString()}
                value={requestData.question_number.toString()}
                onChange={(value: string) =>  setRequestData((prev) => ({ ...prev, ["question_number"]: Number(value) }))}
                
            />
          </div>

          <BaseRangeInput
            min={0}
            max={100}
            value={requestData.question_number}
            onChange={(value) =>  setRequestData((prev) => ({ ...prev, ["question_number"]: value }))}
          />

        </div>

      </div>

      <ErrorMessageList errorMessages={error}/>
      <BaseLabel
        label={message}
        style={{
          color: {
            colorKey: CoreColorKey.Success
          }
        }}
      />
    </BaseModal>
  );
};

export default AIModal;

