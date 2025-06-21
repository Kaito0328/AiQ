import React, { useState, useMemo, useEffect } from "react";
import CollectionSetCard from "./CollectionSetCard";
import NavigatePageButton from "./NavigatePageButton";
import SelectedCountText from "./SelectedCountText";
import SelectedCollectionList from "./SelectedCollectionList";
import FixSelectButton from "./FixSelectButton";
import { Collection } from "../../../types/collection";
import CollectionSelectTabButton from "./CollectionSelectTabButton";
import { CollectionSet } from "../../../types/collectionSet";
import { getCollectionSetsByUserId } from "../../../api/CollectionSetAPI";
import { getCollectionsByCollectionSetId, getFavoriteCollections } from "../../../api/CollectionAPI";
import LoadingIndicator from "../../common/Loading/loadingIndicator";


type Props = {
  userId: number;
  isOfficial?: boolean;
  onSelectionChange: (selected: number[]) => void;
};

enum TabType {
  SET = "SET",
  FAVORITE = "FAVORITE",
}

const CollectionSelector: React.FC<Props> = ({
  userId,
  isOfficial,
  onSelectionChange,
}) => {
const [collectionSets, setCollectionSets] = useState<CollectionSet[]>([]);
const [favoriteCollections, setFavoriteCollections] = useState<Collection[]>([]);
const [allCollectionsMap, setAllCollectionsMap] = useState<Map<number, Collection>>(new Map());
const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
const [loading, setLoading] = useState<boolean>(true);
const [activeTab, setActiveTab] = useState<TabType>(TabType.SET);

  
useEffect(() => {
  (async () => {
    setLoading(true);
    try {
      const sets = await getCollectionSetsByUserId(userId);
      const withCols = await Promise.all(
        sets.map(async (s) => ({
          ...s,
          collections: await getCollectionsByCollectionSetId(s.id),
        }))
      );
      const validSets = withCols.filter((set) => set.collections.length > 0);
      setCollectionSets(validSets);

      let favorites: Collection[] = [];
      if (!isOfficial) {
        favorites = await getFavoriteCollections(userId);
        setFavoriteCollections(favorites);
      }

      // Map 作成
      const map = new Map<number, Collection>();
      for (const set of withCols) {
        for (const col of set.collections) {
          map.set(col.id, col);
        }
      }
      for (const col of favorites) {
        map.set(col.id, col); // 重複はここで自然に排除
      }

      setAllCollectionsMap(map);
    } finally {
      setLoading(false);
    }
  })();
}, [userId, isOfficial]);



  // 選択のトグル
  const toggleCollection = (collectionId: number) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(collectionId)) {
        newSet.delete(collectionId);
      } else {
        newSet.add(collectionId);
      }
      return newSet;
    });
  };

  // セット単位の一括選択/解除
  const toggleSet = (collections: Collection[]) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      const allSelected = collections.every(c => newSet.has(c.id));
      collections.forEach(c => {
        if (allSelected) {
          newSet.delete(c.id);
        } else {
          newSet.add(c.id);
        }
      });
      return newSet;
    });
  };

  const navigateFavoriteCollectionPage = () => {
    
  };


  const selectedCollections = useMemo(() => {
    return Array.from(selectedIds)
      .map(id => allCollectionsMap.get(id))
      .filter((c) => (c != undefined));
  }, [selectedIds, allCollectionsMap]);


  return (
    <div className="space-y-4 flex flex-col justify-center">

      {/* タブ */}
      <div className="flex space-x-2 justify-center">
        <div className="flex gap-3 justify-center mr-5">
        <CollectionSelectTabButton
          label="コレクションセット"
          isActive={activeTab === TabType.SET}
          onClick={() => setActiveTab(TabType.SET)}
        />
        <CollectionSelectTabButton
          label="お気に入り"
          isActive={activeTab === TabType.FAVORITE}
          onClick={() => setActiveTab(TabType.FAVORITE)}
        />

        </div>

        <NavigatePageButton 
            title={ (activeTab === TabType.SET ? "コレクションセットページへ" : "お気に入り子レクションページへ")}
            navigatePage={navigateFavoriteCollectionPage}
        />
      </div>

      {/* コンテンツ */}
      { loading ? (
        <LoadingIndicator
          text="コレクションを取得中..."
        />
      ) : (
        <div className="space-y-4 flex-col items-center justify-center">
          {activeTab === TabType.SET &&
            collectionSets.map(set => (
              <CollectionSetCard
                key={set.id}
                setName={set.name}
                collections={set.collections}
                selectedIds={selectedIds}
                onToggleCollection={toggleCollection}
                onToggleSet={() => toggleSet(set.collections)}
                allSelected={set.collections.every(c => selectedIds.has(c.id))}
              />
            ))}
          {activeTab === TabType.FAVORITE && (
              <div className="space-y-2">
                  <CollectionSetCard                
                    setName={"お気に入りコレクション"}
                    collections={favoriteCollections}
                    selectedIds={selectedIds}
                    onToggleCollection={toggleCollection}
                    onToggleSet={() => toggleSet(favoriteCollections)}
                    allSelected={favoriteCollections.every(c => selectedIds.has(c.id))}
                  />
              </div>
          )}
        </div>
      )}


      {/* 選択状況 */}
      <div className="space-y-2">
        <SelectedCountText count={selectedIds.size} />
        {selectedIds.size > 0 && (
          <SelectedCollectionList
            selectedCollections={selectedCollections}
            onRemove={(collection) => toggleCollection(collection.id)}
          />
        )}

      </div>

        <div className="flex justify-center">
                  <FixSelectButton fixSelect={() => onSelectionChange([...selectedIds])} />

        </div>

    </div>
  );
};

export default CollectionSelector;
