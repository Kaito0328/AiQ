import { FailedItem } from "../../../../../types/batchResponse";
import { useCollectionUIState } from "../state/useCollectionUIState";

export const useUIAction = (
    uiState: ReturnType<typeof useCollectionUIState>
) => {
    const { mergedCollections, setVisibilityMap, setIsSelecting, setSavedMap, allVisible, setAllVisible } = uiState;
    
    const toggleVisibility = (id: number) => {
        setVisibilityMap((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    const setAllVisibility = () => {
        const newVisible = !allVisible
        const map: Record<number, boolean> = {};
        mergedCollections.forEach((col) => {
            map[col.id] = newVisible;
        });
        setVisibilityMap(map);
        setAllVisible(newVisible)
    };

    const toggleSelectMode = () => {
        setIsSelecting((prev) => !prev);
    };

    const markAsSaved = (failedItems: FailedItem[]) => {
    setSavedMap((prev) => {
        const newMap: Record<number, boolean> = {};
        failedItems.forEach((item) => {
        if (prev[item.id]) {
            newMap[item.id] = true;
        }
        });
        return newMap;
    });
    };

    const toUnSaved = (id: number) => {
    setSavedMap((prev) => {
        return {
        ...prev,
        [id]: false
        };
    });
    };



  return { toggleVisibility, setAllVisibility, toggleSelectMode, markAsSaved, toUnSaved };
};
