import { useMemo, useState } from "react";
import { Question, QuestionInput } from "../../../../../types/question";

export const useUIState = (
    questions: Question[],
    pendingUpdates: { id: number; updated: QuestionInput}[]
) => {

    const mergedQuestions = useMemo(() => {
    const updateMap = new Map(pendingUpdates.map(({ id, updated }) => [id, updated]));
    return questions.map((col) => ({
        ...col,
        ...(updateMap.get(col.id) ?? {}),
    }));
    }, [questions, pendingUpdates]);

    const [visibilityMap, setVisibilityMap] = useState<Record<number, boolean>>({});
    const [allVisible, setAllVisible] = useState<boolean>(false);
    const [savedMap, setSavedMap] = useState<Record<number, boolean>>({});


    const [isSelecting, setIsSelecting] = useState<boolean>(false);

  return {
    mergedQuestions,
    visibilityMap, setVisibilityMap,
    allVisible, setAllVisible,
    savedMap, setSavedMap,
    isSelecting, setIsSelecting,
   };
};
