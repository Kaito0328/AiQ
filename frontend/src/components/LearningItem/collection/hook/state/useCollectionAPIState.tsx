import { useState } from "react";
import { Collection } from "../../../../../types/collection";
import { ErrorCode } from "../../../../../types/error";

export const useCollectionAPIState = () => {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [createErrors, setCreateErrors] = useState<Record<number, ErrorCode[]>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<number, ErrorCode[]>>({});

  return {
    collections, setCollections,
    loading, setLoading,
    errorMessage, setErrorMessage,
    createErrors, setCreateErrors,
    updateErrors, setUpdateErrors,
  };
};