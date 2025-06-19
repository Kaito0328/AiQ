import React from "react";
import InLineTextInput from "../../../baseComponents/InLineTextInput";
import { SizeKey } from "../../../../style/size";
import { RoundKey } from "../../../../style/rounded";
import { ColorKey } from "../../../../style/colorStyle";
interface Props {
    defaultValue?: string;
  placeholder: string;
  onInput: (input: string) => void;
}

const ItemInLineTextInput: React.FC<Props> = ({
  defaultValue, 
  placeholder,
  onInput
}) => {

  return (
    <InLineTextInput
        defaultValue={defaultValue}
        onChange={(text) => onInput(text)}
        placeholder={placeholder}
        style={{
          colorKey: ColorKey.Primary,
          size: {
            sizeKey: SizeKey.MD
          },
          roundKey: RoundKey.Md
        }}
    />
  );
};

export default ItemInLineTextInput;