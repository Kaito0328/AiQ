import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import SortConditionItem from "./SortConditionItem";
import { SortCondition, SortDirection } from "../../../../types/quiz";
import { FaGripVertical } from "react-icons/fa6";
import BaseLabel from "../../../baseComponents/BaseLabel";
import { SizeKey } from "../../../../style/size";
import { ColorKey } from "../../../../style/colorStyle";

type Props = {
  sort: SortCondition;
  setSorts: React.Dispatch<React.SetStateAction<SortCondition[]>>;
};

const DraggableSortItem: React.FC<Props> = ({ sort, setSorts }) => {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: sort.key });

  const style = { transform: CSS.Transform.toString(transform), transition };

  const updateDirection = (direction: SortDirection) => {
    setSorts(prev => prev.map(s => s.key === sort.key ? { ...s, direction } : s));
  };

  const removeItem = () => {
    setSorts(prev => prev.filter(s => s.key !== sort.key));
  };

  return (
    <div ref={setNodeRef} style={style} className="flex items-center">
      <div {...attributes} {...listeners} className="cursor-grab p-2">
        <BaseLabel
          icon={<FaGripVertical />}
          style={{
            size: {
              sizeKey: SizeKey.SM,
              properties: []
            },
            color: {
              colorKey: ColorKey.Primary
            },

          }}
        />

      </div>
      <div className="flex-1">
        <SortConditionItem
          sort={sort}
          onDirectionChange={updateDirection}
          onRemove={removeItem}
        />
      </div>
    </div>
  );
};

export default DraggableSortItem;
