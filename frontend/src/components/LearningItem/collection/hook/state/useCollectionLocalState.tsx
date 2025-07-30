import { useState } from "react";
import { CollectionInput } from "../../../../../types/collection";

export const useCollectionLocalState = () => {
  const [pendingCreations, setPendingCreations] = useState<CollectionInput[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<{ id: number; updated: CollectionInput }[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  return {
    pendingCreations, setPendingCreations,
    pendingUpdates, setPendingUpdates,
    selectedIds, setSelectedIds,
  };
};
