import React from "react";
import BaseLabel from "../../baseComponents/BaseLabel";
import { FontWeightKey } from "../../../style/fontWeight";
import InLineTextInput from "../../baseComponents/InLineTextInput";
import BaseRangeInput from "../../baseComponents/BaseRangeInput";

type Props = {
  limit: number;
  setLimit: (val: number) => void;
};

const LimitSection: React.FC<Props> = ({ limit, setLimit }) => {
  return (
    <div className="mb-6">
        <div className="flex space-x-3 border-b mb-3">
            <BaseLabel
                label="出題数: "
                style={{
                    fontWeightKey: FontWeightKey.Semibold,
                }}
            />
            <div>
                <InLineTextInput
                    defaultValue={limit.toString()}
                    value={limit.toString()}
                    onChange={(value: string) => setLimit(Number(value))}
                    
                />
            </div>
        </div>

      <BaseRangeInput
        min={0}
        max={100}
        value={limit}
        onChange={(value) => setLimit(value)}
      />

    </div>
  );
};

export default LimitSection;
