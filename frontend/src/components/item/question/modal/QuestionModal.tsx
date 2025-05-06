import { motion } from "framer-motion";
import { FaPlus, FaRobot, FaFileCsv } from "react-icons/fa";
import { useState } from "react";
import CSVModal from "./CSVModal";
import AIModal from "./AIModal";
import { BatchUpsertResponse } from "../../../../types/batchResponse";
import { Question } from "../../../../types/question";

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
            <motion.button
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, x: 80, y: -20 }}
              exit={{ opacity: 0 }}
              className="absolute bg-blue-500 text-white p-3 rounded-full shadow-lg"
              onClick={() => openModal("ai")}
            >
              <FaRobot />
            </motion.button>

            <motion.button
              initial={{ opacity: 0, x: 0, y: 0 }}
              animate={{ opacity: 1, x: 20, y: -80 }}
              exit={{ opacity: 0 }}
              className="absolute bg-green-500 text-white p-3 rounded-full shadow-lg"
              onClick={() => openModal("csv")}
            >
              <FaFileCsv />
            </motion.button>
          </>
        )}

        <button
          className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-transform transform hover:scale-110"
          onClick={toggleMenu}
        >
          <FaPlus />
        </button>
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
