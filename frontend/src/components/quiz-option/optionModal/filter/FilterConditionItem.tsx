import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { FilterCondition, FilterType } from "../../../../types/quiz";
import BaseCard from "../../../containerComponents/BaseCard";
import BaseLabel from "../../../baseComponents/BaseLabel";
import BaseButton from "../../../common/button/BaseButton";
import { ColorKey } from "../../../../style/colorStyle";
import { FontWeightKey } from "../../../../style/fontWeight";
import { RoundKey } from "../../../../style/rounded";
import { SizeKey } from "../../../../style/size";

type Props = {
  filter: FilterCondition;
  onRemove: () => void;
  onValueChange: (value: number | undefined) => void;
};

const typeLabels: Record<FilterType, string> = {
  NOT_SOLVED: "未解答のみ",
  WRONG_COUNT: "指定回数以上間違えた",
};

const FilterConditionItem: React.FC<Props> = ({ filter, onRemove, onValueChange }) => {
  const [inputValue, setInputValue] = useState<string>(filter.value?.toString() ?? "1");

  useEffect(() => {
    setInputValue(filter.value?.toString() ?? "1");
  }, [filter.value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*$/.test(value)) {
      setInputValue(value);
    }
  };

  const handleBlur = () => {
    const num = inputValue === "" ? undefined : Number(inputValue);
    onValueChange(num);
  };

  return (
    <BaseCard
        style={{
            size: { sizeKey: SizeKey.SM }
        }}
    >
      <div className="flex items-center justify-between">
        <BaseLabel label={typeLabels[filter.type]}
          style={{ fontWeightKey: FontWeightKey.Semibold, size:{sizeKey: SizeKey.SM} }}
        />
        <div className="flex items-center gap-2">
          {filter.type === FilterType.WRONG_COUNT && (
            <input
              type="text"
              defaultValue={1}
              value={inputValue}
              onChange={handleChange}
              onBlur={handleBlur}
              className="w-20 px-2 py-1 border rounded"
            />
          )}
          <BaseButton
            icon={<FaTimes />}
            onClick={onRemove}
            style={{
              color: { colorKey: ColorKey.Secondary },
              size: { sizeKey: SizeKey.SM },
              roundKey: RoundKey.Full
            }}
          />
        </div>
      </div>
    </BaseCard>
  );
};

export default FilterConditionItem;
