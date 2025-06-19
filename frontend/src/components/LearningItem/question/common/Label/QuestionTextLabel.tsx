import React from "react"; 
import { SizeKey } from "../../../../../style/size";
import { TextColorKey } from "../../../../../types/color";
import Text from "../../../../baseComponents/Text";

const QuestionLabel: React.FC<{ questionText?: string}> = ({ questionText }) => {
    return (
        <div className="min-w-[200px]" >
            <Text
                text = {questionText}
                sizeKey={SizeKey.LG}
                textColorKey={TextColorKey.Strong}
            />
        </div>
    );
};

export default QuestionLabel;
