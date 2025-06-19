import React from "react";
import { FilterCondition, FilterType } from "../../../../types/quiz";
import BaseButton from "../../../common/button/BaseButton";
import { FaPlus } from "react-icons/fa";
import { ColorKey, ColorPropertyKey, ColorVariantKey } from "../../../../style/colorStyle";
import { SizeKey } from "../../../../style/size";
import BaseCard from "../../../containerComponents/BaseCard";

type Props = {
  filters: FilterCondition[];
  setFilters: React.Dispatch<React.SetStateAction<FilterCondition[]>>;
};

const options: { label: string, type: FilterType, defaultValue?: number }[] = [
  { label: "未解答のみ", type: FilterType.NOT_SOLVED },
  { label: "指定回数以上間違えた", type: FilterType.WRONG_COUNT, defaultValue: 2 },
];

const FilterSelector: React.FC<Props> = ({ filters, setFilters }) => {
  const remainOptions = options.filter(opt => !filters.some(f => f.type === opt.type));

  const addFilter = (type: FilterType, defaultValue?: number) => {
    setFilters(prev => [...prev, { type, value: defaultValue }]);
  };

  if (remainOptions.length === 0) return null;

  return (
    <BaseCard
      style={{
        color: {
          colorKey: ColorKey.Secondary,
          properties: [ColorPropertyKey.Border, ColorPropertyKey.Ring],
          variants: [ColorVariantKey.Focus]
        },
        size: { sizeKey: SizeKey.SM }
      }}
    >
        <div className="space-x-2">
            {remainOptions.map(opt => (
            <BaseButton
            key={opt.type}
            label={opt.label}
            icon={<FaPlus />}
            onClick={() => addFilter(opt.type, opt.defaultValue)}
            style={{
                color: { colorKey: ColorKey.Secondary },
                size: { sizeKey: SizeKey.SM }
            }}
            bg_color={true}
            />
        ))}

        </div>

    </BaseCard>
  );
};

export default FilterSelector;
