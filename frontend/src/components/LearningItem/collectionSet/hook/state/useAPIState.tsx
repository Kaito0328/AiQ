import { useState } from "react";
import { ErrorCode } from "../../../../../types/error";
import { CollectionSet } from "../../../../../types/collectionSet";

export const useAPIState = () => {
  const [collectionSets, setCollectionSets] = useState<CollectionSet[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [createErrors, setCreateErrors] = useState<Record<number, ErrorCode[]>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<number, ErrorCode[]>>({});

  return {
    collectionSets, setCollectionSets,
    loading, setLoading,
    errorMessage, setErrorMessage,
    createErrors, setCreateErrors,
    updateErrors, setUpdateErrors,
  };
};