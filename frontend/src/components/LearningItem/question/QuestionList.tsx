import ItemList from "../common/ItemList";
import { BatchUpsertResponse } from "../../../types/batchResponse";
import { Question, QuestionInput } from "../../../types/question";
import QuestionModal from "./modal/QuestionModal";
import { useLocalState } from "./hook/state/useQuestionLocalState";
import { useAPIState } from "./hook/state/useQuestionAPIState";
import { useUIState } from "./hook/state/useQuestionUIState";
import { useAPIActions } from "./hook/action/useQuestionAPIActions";
import { useLocalActions } from "./hook/action/useQuestionLocalActions";
import { useUIAction } from "./hook/action/useQuestionUIAction";
import { useCallback, useEffect } from "react";
import ItemCard from "./QuestionCard/ItemCard";
import NewItemCard from "./QuestionCard/NewItemCard";
import AllDescriptionToggleButton from "../common/Button/AllDescriptionToggleButton";

interface Props {
  collectionId: number;
  userId: number | undefined;
  isOwner: boolean;
}

const QuestionList: React.FC<Props> = ({ collectionId, userId, isOwner }) => {
  const localState = useLocalState();
  const apiState = useAPIState();
  const uiState = useUIState(apiState.questions, localState.pendingUpdates);

  const {
    initQuestions,
    handleCollectionBatchUpsert,
    handleDelete,
    handleBatchDelete,
  } = useAPIActions(collectionId, apiState);

  const {
    handleLocalCreate,
    handleLocalUpdate,
    handleAddPendingCreation,
    toggleSelect,
    clearFailedPendingUpdates,
    clearFailedPendingCreates,
  } = useLocalActions(localState);

  const {
    toggleVisibility,
    setAllVisibility,
    toggleSelectMode,
    markAsSaved,
    toUnSaved,
  } = useUIAction(uiState);

  // 初期ロード
  useEffect(() => {
    if (!userId) return;
    initQuestions();
  }, [initQuestions, userId]);

  const onBatchUpsert = async () => {
    const res = await handleCollectionBatchUpsert(localState.pendingCreations, localState.pendingUpdates);
    clearFailedPendingUpdates(res.failedUpdates);
    clearFailedPendingCreates(res.failedCreates);
    markAsSaved(res.failedUpdates);
  }

  const AddPendingChanges = useCallback((id: number, updated: QuestionInput) => {
    handleLocalUpdate(id, updated);
    toUnSaved(id);
  }, [handleLocalUpdate, toUnSaved]);

  const renderItem = useCallback(
    (question: Question) => (
      <ItemCard
        key={question.id}
        question={question}
        isOwner={isOwner}
        errorMessages={apiState.updateErrors[question.id]}
        AddPendingChanges={(updated) => AddPendingChanges(question.id, updated)}
        onDelete={() => handleDelete(question.id)}
        onDescriptionToggle={() => toggleVisibility(question.id)}
        isAnswerVisible={uiState.visibilityMap[question.id]}
        isSaved={uiState.savedMap[question.id] ?? true}
      />
    ),
    [isOwner, handleDelete, apiState.updateErrors, toggleVisibility, uiState.visibilityMap, AddPendingChanges, uiState.savedMap]
  );

  const renderPendingItem = useCallback(
    (question: QuestionInput, index: number) => (
       <NewItemCard
        key={`new-${index}`}
        question={question}
        isOwner={isOwner}
        errorMessages={apiState.createErrors[index]}
        AddPendingChanges={(created: QuestionInput) => handleLocalCreate(index, created)}
        onDelete={() => (index)}
      />
    ),
    [isOwner, handleLocalCreate, apiState.createErrors]
  );

  
  const onComplete = (res: BatchUpsertResponse<Question>) => {
    apiState.setQuestions((prev) => [...prev, ...res.successItems]);
  };

  return (
    <div>
      <div className="w-full max-w-4xl flex justify-end mb-5">
        <AllDescriptionToggleButton
          isVisible={uiState.allVisible}
          onToggle={() => setAllVisibility()}
        />
      </div>

      <ItemList<Question, QuestionInput>
        items={uiState.mergedQuestions}
        loading={apiState.loading}
        errorMessage={apiState.errorMessage}
        pendingCreations={localState.pendingCreations}
        selectedIds={localState.selectedIds}
        isSelecting={uiState.isSelecting}
        isOwner={isOwner}
        hasPendingUpsert={localState.pendingUpdates.length > 0}
        renderItem={renderItem}
        renderPendingItem={renderPendingItem}
        onToggleSelectMode={toggleSelectMode}
        toggleSelect={toggleSelect}
        onAddPendingCreation={handleAddPendingCreation}
        onBatchUpsert={onBatchUpsert}
        onBatchDelete={() => handleBatchDelete(localState.selectedIds)}
      />
      <div className="fixed bottom-9 right-10 z-40">
        <QuestionModal
          collectionId={collectionId}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
};

export default QuestionList;
