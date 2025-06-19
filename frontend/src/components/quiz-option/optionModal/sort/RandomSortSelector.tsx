import React from "react";
import BaseLabel from "../../../baseComponents/BaseLabel";
import { SortKey, SortCondition } from "../../../../types/quiz";
import { SizeProperty } from "../../../../style/size";
import { FontWeightKey } from "../../../../style/fontWeight";

type Props = {
  sorts: SortCondition[];
  setSorts: React.Dispatch<React.SetStateAction<SortCondition[]>>;
};

const RandomSortSelector: React.FC<Props> = ({ sorts, setSorts }) => {
  const isRandomActive = sorts.length === 1 && sorts[0].key === SortKey.RANDOM;

  const toggleRandom = () => {
    if (isRandomActive) {
      setSorts([]);
    } else {
      setSorts([{ key: SortKey.RANDOM }]);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <BaseLabel label="ランダム"
        style={{
            size: {
                properties: [SizeProperty.Text]
            },
            fontWeightKey: FontWeightKey.Medium
        }}
      />
      <input type="checkbox" checked={isRandomActive} onChange={toggleRandom} />
    </div>
  );
};

export default RandomSortSelector;
