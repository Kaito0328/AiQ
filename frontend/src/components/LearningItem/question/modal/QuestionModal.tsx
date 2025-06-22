import { motion } from "framer-motion";
import { FaPlus, FaRobot, FaFileCsv } from "react-icons/fa";
import { useState } from "react";
import CSVModal from "./CSVModal";
import AIModal from "./AIModal";
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
  const [modalType, setModalType] = useState<"csv" | "ai" | null>(null);

  const toggleMenu = () => setIsExpanded((prev) => !prev);
  const openModal = (type: "csv" | "ai") => {
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
            <motion.div
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, x: -80, y: -20 }}
              exit={{ opacity: 0 }}
              className="absolute" // motionの位置制御用
            >
              <BaseButton
                icon={<FaRobot />}
                onClick={() => openModal("ai")}
                style={{
                  color: {
                    colorKey: CoreColorKey.Danger, // 色は任意
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
                    colorKey: CoreColorKey.Success, // 色は任意
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
          <BaseButton
            icon={<FaPlus />}
            onClick={toggleMenu}
            style={{
              color: {
                colorKey: isExpanded ? CoreColorKey.Secondary : CoreColorKey.Primary, // 色は任意
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
    </>
  );
};

export default QuestionModal;
