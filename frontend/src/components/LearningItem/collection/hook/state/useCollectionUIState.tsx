import { useMemo, useState } from "react";
import { Collection, CollectionInput } from "../../../../../types/collection";

export const useCollectionUIState = (
    collections: Collection[],
    pendingUpdates: { id: number; updated: CollectionInput}[]
) => {

    const mergedCollections = useMemo(() => {
    const updateMap = new Map(pendingUpdates.map(({ id, updated }) => [id, updated]));
    return collections.map((col) => ({
        ...col,
        ...(updateMap.get(col.id) ?? {}),
    }));
    }, [collections, pendingUpdates]);

    const [visibilityMap, setVisibilityMap] = useState<Record<number, boolean>>({});
    const [allVisible, setAllVisible] = useState<boolean>(false);
    const [savedMap, setSavedMap] = useState<Record<number, boolean>>({});


    const [isSelecting, setIsSelecting] = useState<boolean>(false);

  return {
    mergedCollections,
    visibilityMap, setVisibilityMap,
    allVisible, setAllVisible,
    savedMap, setSavedMap,
    isSelecting, setIsSelecting,
   };
};
