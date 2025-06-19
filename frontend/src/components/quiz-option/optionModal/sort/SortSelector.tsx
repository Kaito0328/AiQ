import React from "react";
import { SortCondition, SortKey, SortDirection } from "../../../../types/quiz";
import BaseButton from "../../../common/button/BaseButton";
import { FaPlus } from "react-icons/fa";
import { ColorKey, ColorPropertyKey, ColorVariantKey } from "../../../../style/colorStyle";
import { SizeKey } from "../../../../style/size";
import BaseCard from "../../../containerComponents/BaseCard";

type Props = {
  sorts: SortCondition[];
  setSorts: React.Dispatch<React.SetStateAction<SortCondition[]>>;
  isRandomActive: boolean;
};

const options: { label: string, key: SortKey }[] = [
  { label: "間違い回数", key: SortKey.WRONG },
  { label: "正答率", key: SortKey.ACCURACY },
];



const SortSelector: React.FC<Props> = ({ sorts, setSorts, isRandomActive }) => {
  const remainOptions = options.filter((opt) => !sorts.some(s => s.key === opt.key));
  const addSort = (key: SortKey) => {
    if (sorts.some(s => s.key === key)) return;
    setSorts([...sorts, { key, direction: SortDirection.ASC }]);
  };

  if (remainOptions.length  == 0) return;

  return (
    <BaseCard
      style={{
        color: {
          colorKey: ColorKey.Secondary,
          properties: [ColorPropertyKey.Border, ColorPropertyKey.Ring],
          variants: [ColorVariantKey.Focus]
        },
        size: {
          sizeKey: SizeKey.SM,
        }
      }}
    >
      <div className="space-x-2">
        {remainOptions.map(opt => {
          const selected = sorts.some(s => s.key === opt.key);
          return (
            <BaseButton
              key={opt.key}
              label={opt.label}
              icon={<FaPlus />}

              onClick={() => addSort(opt.key)}
              disabled={selected || isRandomActive}
              style={{
                color: {
                  colorKey:ColorKey.Secondary
                },
                size: {
                  sizeKey: SizeKey.SM
                }
              }}
              bg_color={true}
            />
          );
        })}

      </div>
      
    </BaseCard>
  );
};

export default SortSelector;
