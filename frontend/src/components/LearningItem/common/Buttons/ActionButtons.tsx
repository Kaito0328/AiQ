import AddButton from "../Button/AddButton";
import SaveButton from "../Button/SaveButton";
import SelectButton from "../Button/SelectButton";
import BatchDeleteButton from "../Button/BatchDeleteButton";

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
        <div>
            <AddButton
                onAdd={handleAddPendingCreation}
            />

        </div>
        <div>
            <SaveButton
                onSave={handleBatchUpsert}
                disabled={!hasPendingChanges}
            />
        </div>

        <div>
            <SelectButton
                onSelect={toggleSelectMode}
                isSelecting={isSelecting}
            />
        </div>


        {isSelecting && (
            <div>
                <BatchDeleteButton
                    onDelete={handleBatchDelete}
                    disabled={!hasSelectedIds}
                />
            </div>
        )}
    </div>
  );
};

export default ActionButtons;
