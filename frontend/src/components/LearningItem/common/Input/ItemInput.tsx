import React from "react";
import InLineTextInput from "../../../baseComponents/InLineTextInput";
interface Props {
    defaultValue?: string;
  placeholder: string;
  onInput: (input: string) => void;
}

const ItemInput: React.FC<Props> = ({
  defaultValue, 
  placeholder,
  onInput

}) => {

  return (
    <InLineTextInput
        defaultValue={defaultValue}
        onChange={(text) => onInput(text)}
        placeholder={placeholder}
    />
  );
};

export default ItemInput;