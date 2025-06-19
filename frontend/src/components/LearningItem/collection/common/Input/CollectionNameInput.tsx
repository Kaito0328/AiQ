import React from "react";
import ItemInput from "../../../common/Input/ItemInput";

interface Props {
  name?: string;
  onNameInput: (input: string) => void;
}

const CollectionNameInput: React.FC<Props> = ({ name, onNameInput }) => {
  return (
    <ItemInput
      defaultValue={name}
      onInput={onNameInput}
      placeholder="新しいコレクション名"
    />
  );
};

export default CollectionNameInput;

