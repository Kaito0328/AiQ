import { useState } from "react";
import { Collection, CollectionInput } from "../../../../types/collection";
import { ErrorCode } from "../../../../types/error";

export const useCollectionState = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [pendingCreations, setPendingCreations] = useState<CollectionInput[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<{ id: number; updated: CollectionInput }[]>([]);
  const [createErrors, setCreateErrors] = useState<Record<number, ErrorCode[]>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<number, ErrorCode[]>>({});
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  return {
    collections, setCollections,
    loading, setLoading,
    errorMessage, setErrorMessage,
    pendingCreations, setPendingCreations,
    pendingUpdates, setPendingUpdates,
    createErrors, setCreateErrors,
    updateErrors, setUpdateErrors,
    selectedIds, setSelectedIds,
  };
};
