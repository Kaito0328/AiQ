import React, { useState } from "react";
import { FaSortAmountDown } from "react-icons/fa";
import { SortCondition, SortKey } from "../../../../types/quiz";
import SortSelector from "./SortSelector";
import RandomSortSelector from "./RandomSortSelector";
import BaseLabel from "../../../baseComponents/BaseLabel";
import { closestCenter, DndContext, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import DraggableSortItem from "./DraggableSortItem";
import { restrictToFirstScrollableAncestor, restrictToVerticalAxis } from "@dnd-kit/modifiers";
import BaseCard from "../../../containerComponents/BaseCard";
import { CoreColorKey, ColorPropertyKey, ColorVariantKey } from "../../../../style/colorStyle";
import { SizeKey, SizeProperty } from "../../../../style/size";
import ArrowToggleButton from "../../../LearningItem/common/Toggle/ArrowToggleButton";
import { FontWeightKey } from "../../../../style/fontWeight";


type Props = {
  sorts: SortCondition[];
  setSorts: React.Dispatch<React.SetStateAction<SortCondition[]>>;
};

const SortSection: React.FC<Props> = ({ sorts, setSorts }) => {
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = sorts.findIndex((s) => s.key === active.id);
      const newIndex = sorts.findIndex((s) => s.key === over?.id);
      setSorts(arrayMove(sorts, oldIndex, newIndex));
    }
  };

  const isRandomActive = sorts.length === 1 && sorts[0].key === SortKey.RANDOM;
  const normalSorts = sorts.filter(s => s.key !== SortKey.RANDOM);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  const ChangeVisible = () => {
    setIsVisible(!isVisible);
  }

  return (
    <div>
      <label className="flex justify-between border-b mb-4">
        <BaseLabel icon={<FaSortAmountDown />} label="並び替え" 
          style={{
            size: {
              properties: [SizeProperty.Text]
            },
            fontWeightKey: FontWeightKey.Bold
          }}
        />
        <ArrowToggleButton
          isVisible={isVisible}
          onToggle={ChangeVisible}
        />
      </label>
      {isVisible && (
        <div className="pl-4">
          <RandomSortSelector sorts={sorts} setSorts={setSorts}/>

          {!isRandomActive && (
            <div>
              <BaseLabel
                label="ソート条件 :"
                style={{
                  fontWeightKey: FontWeightKey.Medium,
                  size: {
                    properties: [SizeProperty.Text]
                  }
                }}
              />
              <div className="pl-3 mt-3">
                <SortSelector sorts={normalSorts} setSorts={setSorts} isRandomActive={isRandomActive} />
              </div>
              <div className="mt-5">
                  <BaseLabel
                    label="ソートリスト :"
                    style={{
                      fontWeightKey: FontWeightKey.Medium,
                      size: {
                        properties: [SizeProperty.Text]
                      }
                    }}
                  />
                {sorts.length > 0 && (
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
                      <DndContext
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                        modifiers={[restrictToVerticalAxis, restrictToFirstScrollableAncestor]}
                      >
                        <SortableContext items={normalSorts.map(s => s.key)} strategy={verticalListSortingStrategy}>
                          <div  className="space-y-1">
                            {normalSorts.map((sort) => (
                              <DraggableSortItem key={sort.key} sort={sort} setSorts={setSorts} />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </BaseCard>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SortSection;
