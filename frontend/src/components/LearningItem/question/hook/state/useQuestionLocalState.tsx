import { useState } from "react";
import { QuestionInput } from "../../../../../types/question";

export const useLocalState = () => {
  const [pendingCreations, setPendingCreations] = useState<QuestionInput[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<{ id: number; updated: QuestionInput }[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  return {
    pendingCreations, setPendingCreations,
    pendingUpdates, setPendingUpdates,
    selectedIds, setSelectedIds,
  };
};
