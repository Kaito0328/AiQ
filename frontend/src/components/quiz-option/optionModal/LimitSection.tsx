import React from "react";
import BaseLabel from "../../baseComponents/BaseLabel";
import { FontWeightKey } from "../../../style/fontWeight";
import InLineTextInput from "../../baseComponents/InLineTextInput";

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

      <input
        type="range"
        min="1"
        max="100"
        value={limit}
        onChange={(e) => setLimit(Number(e.target.value))}
        className="w-full accent-blue-600"
      />
    </div>
  );
};

export default LimitSection;
