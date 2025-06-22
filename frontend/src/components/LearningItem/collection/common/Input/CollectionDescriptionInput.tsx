import React from "react";
import BlockTextInput from "../../../../baseComponents/BlockTextInput";
import { SizeKey } from "../../../../../style/size";
import { RoundKey } from "../../../../../style/rounded";
import { CoreColorKey } from "../../../../../style/colorStyle";

interface Props {
  description?: string;
  onDescriptionInput: (input: string) => void;
}

const CollectionDescriptionInput: React.FC<Props> = ({
  description,
  onDescriptionInput
}) => {
  return (
    <BlockTextInput
      defaultValue={description}
      onChange={onDescriptionInput}
      placeholder="コレクションの説明を入力"
      style={{
        colorKey:CoreColorKey.Base,
        size: {
          sizeKey: SizeKey.LG,
        },
        roundKey:RoundKey.Md
      }}

    />
  );
};

export default CollectionDescriptionInput;
