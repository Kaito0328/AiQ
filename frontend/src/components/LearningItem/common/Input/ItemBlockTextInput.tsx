import React from "react";
import { SizeKey } from "../../../../style/size";
import { RoundKey } from "../../../../style/rounded";
import BlockTextInput from "../../../baseComponents/BlockTextInput";
import { CoreColorKey } from "../../../../style/colorStyle";
interface Props {
    defaultValue?: string;
  placeholder: string;
  onInput: (input: string) => void;
}

const ItemBlockTextInput: React.FC<Props> = ({
  defaultValue, 
  placeholder,
  onInput
}) => {

  return (
    <BlockTextInput
        defaultValue={defaultValue}
        onChange={(text) => onInput(text)}
        placeholder={placeholder}
        style={{
          colorKey: CoreColorKey.Primary,
          size: {
            sizeKey: SizeKey.MD,
          },
          roundKey: RoundKey.Md
        }}
    />
  );
};

export default ItemBlockTextInput;