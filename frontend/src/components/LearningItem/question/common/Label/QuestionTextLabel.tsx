import React from "react"; 
import BaseLabel from "../../../../baseComponents/BaseLabel";
import { FontWeightKey } from "../../../../../style/fontWeight";
import { CoreColorKey } from "../../../../../style/colorStyle";

const QuestionLabel: React.FC<{ questionText?: string}> = ({ questionText }) => {
    return (
        <div className="min-w-[200px]" >
            <BaseLabel
                label={questionText}
                style={{
                    fontWeightKey: FontWeightKey.Semibold,
                    color: {
                        colorKey: CoreColorKey.Primary
                    }
                }}

            />
        </div>
    );
};

export default QuestionLabel;
