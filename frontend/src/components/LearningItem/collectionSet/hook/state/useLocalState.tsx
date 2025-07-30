import { useState } from "react";
import { CollectionSetInput } from "../../../../../types/collectionSet";

export const useLocalState = () => {
  const [pendingCreations, setPendingCreations] = useState<CollectionSetInput[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<{ id: number; updated: CollectionSetInput }[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  return {
    pendingCreations, setPendingCreations,
    pendingUpdates, setPendingUpdates,
    selectedIds, setSelectedIds,
  };
};
