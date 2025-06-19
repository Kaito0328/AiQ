import { useState } from "react";
import { ErrorCode } from "../../../../../types/error";
import { Question } from "../../../../../types/question";

export const useAPIState = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(undefined);
  const [createErrors, setCreateErrors] = useState<Record<number, ErrorCode[]>>({});
  const [updateErrors, setUpdateErrors] = useState<Record<number, ErrorCode[]>>({});

  return {
    questions, setQuestions,
    loading, setLoading,
    errorMessage, setErrorMessage,
    createErrors, setCreateErrors,
    updateErrors, setUpdateErrors,
  };
};