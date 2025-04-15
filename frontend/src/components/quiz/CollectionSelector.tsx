import React, { useState, useEffect } from "react";
import { getCollectionsByCollectionSetId } from "../../api/CollectionAPI";
import { getCollectionSetsByUserId } from "../../api/CollectionSetAPI";
import { CollectionSet } from "../../types/collectionSet";
import { Collection } from "../../types/collection";

type Props = {
  userId: number; // "user" の場合は必須
  onSelectionChange: (selected: number[]) => void;
};

const CollectionSelector: React.FC<Props> = ({ userId, onSelectionChange }) => {
  const [collectionSets, setCollectionSets] = useState<CollectionSet[]>([]);
  const [selectedCollections, setSelectedCollections] = useState<number[]>([]);
  const [selectedSetIds, setSelectedSetIds] = useState<number[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      let sets: CollectionSet[] = [];

      sets = await getCollectionSetsByUserId(userId);

      // 各コレクションセットのコレクションを取得
      const collectionSetsWithCollections: CollectionSet[] = [];
      for (const set of sets) {
        const collectionsInSet: Collection[] = await getCollectionsByCollectionSetId(set.id);
        collectionSetsWithCollections.push({
          ...set,
          collections: collectionsInSet
        });
      }
      setCollectionSets(collectionSetsWithCollections);
    };

    fetchData();
  }, [userId]);

  useEffect(() => {
    onSelectionChange(selectedCollections);
  }, [selectedCollections, onSelectionChange]);

  const isCollectionSelected = (id: number) => selectedCollections.includes(id);

  const handleSetChange = (set: CollectionSet) => {
    if (selectedSetIds.includes(set.id)) {
      setSelectedSetIds(selectedSetIds.filter((id) => id !== set.id));
      setSelectedCollections(selectedCollections.filter((id) => !set.collections.map((c) => c.id).includes(id)));
    } else {
      setSelectedSetIds([...selectedSetIds, set.id]);
      setSelectedCollections([...selectedCollections, ...set.collections.map((c) => c.id)]);
    }
  };

  const handleCollectionChange = (id: number) => {
    setSelectedCollections(
      isCollectionSelected(id)
        ? selectedCollections.filter((colId) => colId !== id)
        : [...selectedCollections, id]
    );
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-3">コレクションセットを選択</h2>
      {collectionSets.map((set) => (
        <div key={set.id} className="mb-4 p-3 border border-gray-300 rounded-lg bg-white">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-5 h-5 text-blue-600 border-gray-300 rounded"
              checked={selectedSetIds.includes(set.id)}
              onChange={() => handleSetChange(set)}
            />
            <span className="text-lg font-medium">{set.name}</span>
          </label>
          <div className="ml-6 mt-2 space-y-1">
            {set.collections.map((collection) => (
              <label
                key={collection.id}
                className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded-md"
              >
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded"
                  checked={isCollectionSelected(collection.id)}
                  onChange={() => handleCollectionChange(collection.id)}
                />
                <span className="text-gray-800">{collection.name}</span>
              </label>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CollectionSelector;
