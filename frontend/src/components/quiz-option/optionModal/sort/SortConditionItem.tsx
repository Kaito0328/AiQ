import React from "react";
import { FaTimes } from "react-icons/fa";
import { SortCondition, SortDirection, sortKeyLabels } from "../../../../types/quiz";
import BaseCard from "../../../containerComponents/BaseCard";
import BaseLabel from "../../../baseComponents/BaseLabel";
import BaseButton from "../../../common/button/BaseButton";
import { CoreColorKey } from "../../../../style/colorStyle";
import { FontWeightKey } from "../../../../style/fontWeight";
import { RoundKey } from "../../../../style/rounded";
import { SizeKey } from "../../../../style/size";

type Props = {
  sort: SortCondition;
  onRemove: () => void;
  onDirectionChange: (dir: SortDirection) => void;
};

const SortConditionItem: React.FC<Props> = ({ sort, onRemove, onDirectionChange }) => {
  return (
    <BaseCard
        style={{
            size: {
                sizeKey: SizeKey.SM
            }
        }}
    >
      <div className="flex items-center justify-between">
        <BaseLabel label={sortKeyLabels[sort.key]}
            style={{
                fontWeightKey: FontWeightKey.Semibold,
                size: {sizeKey: SizeKey.SM}
            }}
        />
        <div className="flex items-center gap-2">
          <BaseButton
            label="昇順"
            onClick={() => onDirectionChange(SortDirection.ASC)}
            style={{
                color: {
                    colorKey: sort.direction === SortDirection.ASC ? CoreColorKey.Primary: CoreColorKey.Secondary
                },
                fontWeightKey: FontWeightKey.Medium
            }}
          />
          <BaseButton
            label="降順"
            onClick={() => onDirectionChange(SortDirection.DESC)}
            style={{
                color: {
                    colorKey: sort.direction === SortDirection.DESC ? CoreColorKey.Primary: CoreColorKey.Secondary
                },
                fontWeightKey: FontWeightKey.Medium
            }}
          />
          <BaseButton icon={<FaTimes />} onClick={onRemove}
            style={{
                color: {
                    colorKey: CoreColorKey.Secondary
                },
                size: {
                    sizeKey: SizeKey.SM
                },
                roundKey: RoundKey.Full
            }}

        />
        </div>
      </div>
    </BaseCard>
  );
};

export default SortConditionItem;
