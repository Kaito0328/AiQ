import React from "react";
import InLineTextInput from "../../baseComponents/InLineTextInput";
import { SizeKey } from "../../../style/size";

type Props = {
  value: string;
  onChange: (value: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
};

const AnswerInput: React.FC<Props> = ({ value, onChange,  inputRef }) => (
  <InLineTextInput
    inputRef={inputRef}
    value={value}
    onChange={(value) => onChange(value)}
    placeholder="答えを入力..."
    style={{ size: { sizeKey: SizeKey.LG } }}
  />
);

export default AnswerInput;
