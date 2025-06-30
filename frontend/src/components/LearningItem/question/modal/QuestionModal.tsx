import { motion } from "framer-motion";
import { FaPlus, FaRobot, FaFileCsv, FaFilePdf } from "react-icons/fa"; // FaFilePdf を追加
import { useState } from "react";
import CSVModal from "./CSVModal";
import AIModal from "./AIModal";
import PdfModal from "./PdfModal"; // PdfModal をインポート
import { BatchUpsertResponse } from "../../../../types/batchResponse";
import { Question } from "../../../../types/question";
import BaseButton from "../../../common/button/BaseButton";
import { CoreColorKey } from "../../../../style/colorStyle";
import { SizeKey } from "../../../../style/size";
import { RoundKey } from "../../../../style/rounded";
import { ShadowKey } from "../../../../style/shadow";

interface Props {
  collectionId: number;
  onComplete: (res: BatchUpsertResponse<Question>) => void;
}

const QuestionModal: React.FC<Props> = ({ collectionId, onComplete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  // modalType に "pdf" を追加
  const [modalType, setModalType] = useState<"csv" | "ai" | "pdf" | null>(null); 

  const toggleMenu = () => setIsExpanded((prev) => !prev);
  // openModal の型定義に "pdf" を追加
  const openModal = (type: "csv" | "ai" | "pdf") => { 
    setIsExpanded(false);
    setModalType(type);
  };
  
  const closeModal = () => setModalType(null);

  const handleComplete = (res: BatchUpsertResponse<Question>) => {
    closeModal();
    onComplete(res);
  }

  return (
    <>
      {/* 浮かぶボタン */}
      <div>
        {isExpanded && (
          <>
            {/* AIから生成ボタン */}
            <motion.div
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, x: -80, y: -20 }}
              exit={{ opacity: 0 }}
              className="absolute"
            >
              <BaseButton
                icon={<FaRobot />}
                onClick={() => openModal("ai")}
                style={{
                  color: {
                    colorKey: CoreColorKey.Danger,
                  },
                  size: {
                    sizeKey: SizeKey.MD,
                  },
                  roundKey: RoundKey.Full,
                  shadow: {
                    shadowKey: ShadowKey.LG
                  }
                }}
                bg_color={true}
              />
            </motion.div>

            {/* CSVから生成ボタン */}
            <motion.button
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, x: -20, y: -80 }}
              exit={{ opacity: 0 }}
              className="absolute"
            >
              <BaseButton
                icon={<FaFileCsv />}
                onClick={() => openModal("csv")}
                style={{
                  color: {
                    colorKey: CoreColorKey.Success,
                  },
                  size: {
                    sizeKey: SizeKey.MD,
                  },
                  roundKey: RoundKey.Full,
                  shadow: {
                    shadowKey: ShadowKey.LG
                  }
                }}
                bg_color={true}
              />
            </motion.button>

            {/* PDFから生成ボタンを追加 */}
            <motion.button
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, x: -80, y: -80 }} // 位置を調整
              exit={{ opacity: 0 }}
              className="absolute"
            >
              <BaseButton
                icon={<FaFilePdf />} // PDFアイコン
                onClick={() => openModal("pdf")} // modalType を "pdf" に設定
                style={{
                  color: {
                    colorKey: CoreColorKey.Success, // 任意の色
                  },
                  size: {
                    sizeKey: SizeKey.MD,
                  },
                  roundKey: RoundKey.Full,
                  shadow: {
                    shadowKey: ShadowKey.LG
                  }
                }}
                bg_color={true}
              />
            </motion.button>
          </>
        )}
        {/* プラスボタン */}
        <BaseButton
          icon={<FaPlus />}
          onClick={toggleMenu}
          style={{
            color: {
              colorKey: isExpanded ? CoreColorKey.Secondary : CoreColorKey.Primary,
            },
            size: {
              sizeKey: SizeKey.MD,
            },
            roundKey: RoundKey.Full,
            shadow: {
              shadowKey: ShadowKey.LG
            }
          }}
          bg_color={true}
        />
      </div>

      {/* モーダル */}
      {modalType === "csv" && (
        <CSVModal
          onClose={closeModal}
          onComplete={handleComplete}
          collectionId={collectionId}
        />
      )}
      {modalType === "ai" && (
        <AIModal
          onClose={closeModal}
          onComplete={handleComplete}
          collectionId={collectionId}
        />
      )}
      {/* PDFモーダルをレンダリング */}
      {modalType === "pdf" && (
        <PdfModal
          onClose={closeModal}
          onComplete={handleComplete}
          collectionId={collectionId}
        />
      )}
    </>
  );
};

export default QuestionModal;