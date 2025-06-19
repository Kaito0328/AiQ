import { useMemo, useState } from "react";
import { CollectionSet, CollectionSetInput } from "../../../../../types/collectionSet";

export const useUIState = (
    collectionSets: CollectionSet[],
    pendingUpdates: { id: number; updated: CollectionSetInput}[]
) => {

    const mergedCollectionSets = useMemo(() => {
    const updateMap = new Map(pendingUpdates.map(({ id, updated }) => [id, updated]));
    return collectionSets.map((col) => ({
        ...col,
        ...(updateMap.get(col.id) ?? {}),
    }));
    }, [collectionSets, pendingUpdates]);

    const [visibilityMap, setVisibilityMap] = useState<Record<number, boolean>>({});
    const [allVisible, setAllVisible] = useState<boolean>(false);
    const [savedMap, setSavedMap] = useState<Record<number, boolean>>({});
    const [isSelecting, setIsSelecting] = useState<boolean>(false);

  return {
    mergedCollectionSets,
    visibilityMap, setVisibilityMap,
    allVisible, setAllVisible,
    savedMap, setSavedMap,
    isSelecting, setIsSelecting,
   };
};
