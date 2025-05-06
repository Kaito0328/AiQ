import { FaPlus, FaSave, FaCheckSquare, FaTimesCircle, FaTrashAlt } from "react-icons/fa";

interface ActionButtonsProps {
    isSelecting: boolean;
    toggleSelectMode: () => void;
    handleAddPendingCreation: () => void;
    handleBatchUpsert: () => void;
    hasPendingChanges: boolean;
    hasSelectedIds: boolean;
    handleBatchDelete: () => void;
  }

const ActionButtons: React.FC<ActionButtonsProps> = ({
isSelecting,
toggleSelectMode,
handleAddPendingCreation,
handleBatchUpsert,
hasPendingChanges,
hasSelectedIds,
handleBatchDelete,
}) => {
return (
    <div className="flex flex-wrap justify-center gap-7">
        <button
        className="flex items-center gap-2 px-5 py-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 font-medium rounded-full shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={handleAddPendingCreation}
        >
        <FaPlus />
        <span>追加</span>
        </button>

        <button
        className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-full shadow-sm transition ${
            hasPendingChanges
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
        onClick={handleBatchUpsert}
        disabled={!hasPendingChanges}
        >
        <FaSave />
        <span>保存</span>
        </button>

        <button
        className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-full shadow-sm transition ${
            isSelecting
            ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
            : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
        }`}
        onClick={toggleSelectMode}
        >
        {isSelecting ? <FaTimesCircle /> : <FaCheckSquare />}
        <span>{isSelecting ? "選択解除" : "選択"}</span>
        </button>

        {isSelecting && (
        <button
            className={`flex items-center gap-2 px-5 py-2.5 font-medium rounded-full shadow-sm transition ${
            hasSelectedIds
                ? "bg-red-100 text-red-700 hover:bg-red-200"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            onClick={handleBatchDelete}
            disabled={!hasSelectedIds}
        >
            <FaTrashAlt />
            <span>削除</span>
        </button>
        )}
    </div>
  );
};

export default ActionButtons;
