import React from "react";
import BaseLabel from "../../baseComponents/BaseLabel";
import { SizeKey } from "../../../style/size";
import { FontWeightKey } from "../../../style/fontWeight";

interface Props {
  questionText: string;
}

const QuestionText: React.FC<Props> = ({ questionText }) => {
  return (
    <BaseLabel
      label={questionText}
      style={{
        size: { sizeKey: SizeKey.LG },
        fontWeightKey: FontWeightKey.Bold,
      }}
    />
  );
};

export default QuestionText;
