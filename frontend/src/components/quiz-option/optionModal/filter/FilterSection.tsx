import React, { useState } from "react";
import { FaFilter } from "react-icons/fa";
import { FilterCondition, FilterType } from "../../../../types/quiz";
import BaseLabel from "../../../baseComponents/BaseLabel";
import { SizeKey, SizeProperty } from "../../../../style/size";
import { FontWeightKey } from "../../../../style/fontWeight";
import ArrowToggleButton from "../../../LearningItem/common/Toggle/ArrowToggleButton";
import FilterSelector from "./FilterSelector";
import FilterConditionItem from "./FilterConditionItem";
import BaseCard from "../../../containerComponents/BaseCard";
import { CoreColorKey, ColorPropertyKey, ColorVariantKey } from "../../../../style/colorStyle";

type Props = {
  filters: FilterCondition[];
  setFilters: React.Dispatch<React.SetStateAction<FilterCondition[]>>;
};

const FilterSection: React.FC<Props> = ({ filters, setFilters }) => {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const toggleVisible = () => setIsVisible(!isVisible);

  const updateFilterValue = (type: FilterType, value: number | undefined) => {
    setFilters(prev => prev.map(f => f.type === type ? { ...f, value } : f));
  };

  const removeFilter = (type: FilterType) => {
    setFilters(prev => prev.filter(f => f.type !== type));
  };

  return (
    <div>
      <label className="flex justify-between border-b mb-5">
        <BaseLabel icon={<FaFilter />} label="フィルター"
          style={{
            size: { properties: [SizeProperty.Text] },
            fontWeightKey: FontWeightKey.Bold
          }}
        />
        <ArrowToggleButton isVisible={isVisible} onToggle={toggleVisible} />
      </label>

      {isVisible && (
        <div className="pl-4 flex flex-col gap-3">
            <BaseLabel
                label="フィルタ条件 :"
                style={{
                  fontWeightKey: FontWeightKey.Medium,
                  size: {
                    properties: [SizeProperty.Text]
                  }
                }}
            />
            <div className="pl-3 mt-3">
                <FilterSelector filters={filters} setFilters={setFilters} />
            </div>
            <div className="mt-5">
                <BaseLabel
                label="フィルタリスト :"
                style={{
                    fontWeightKey: FontWeightKey.Medium,
                    size: {
                    properties: [SizeProperty.Text]
                    }
                }}
                />

                {filters.length > 0 && (
                    <div className="pl-3 mt-2">
                        <BaseCard
                        style={{
                            color: {
                            colorKey: CoreColorKey.Secondary,
                            properties: [ColorPropertyKey.Border, ColorPropertyKey.Ring],
                            variants: [ColorVariantKey.Focus]
                            },
                            size: {
                            sizeKey: SizeKey.SM,
                            }
                        }}
                        > 
                            <div className="space-y-1">
                                {filters.map(filter => (
                                    <FilterConditionItem
                                    key={filter.type}
                                    filter={filter}
                                    onValueChange={(value) => updateFilterValue(filter.type, value)}
                                    onRemove={() => removeFilter(filter.type)}
                                    />
                                ))} 
                            </div>
                        </BaseCard>
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default FilterSection;
