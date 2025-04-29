import { useState } from "react";
import { Collection, CollectionInput } from "../../../../types/collection";
import { ErrorCode } from "../../../../types/error";

export const useCollectionState = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [pendingCreations, setPendingCreations] = useState<CollectionInput[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<{ id: number; updated: CollectionInput }[]>([]);
  const [createErrors, setCreateErrors] = useState<Record<number, ErrorCode[]>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<number, ErrorCode[]>>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  return {
    collections, setCollections,
    pendingCreations, setPendingCreations,
    pendingUpdates, setPendingUpdates,
    createErrors, setCreateErrors,
    updateErrors, setUpdateErrors,
    selectedIds, setSelectedIds,
  };
};
