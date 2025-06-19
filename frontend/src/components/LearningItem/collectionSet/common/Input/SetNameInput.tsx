import React from "react";
import ItemInput from "../../../common/Input/ItemInput";

interface Props {
  name?: string;
  onNameInput: (input: string) => void;
}

const SetNameInput: React.FC<Props> = ({
  name,
  onNameInput

}) => {

  return (
    <ItemInput
      defaultValue={name}
      placeholder="コレクションセット名を入力"
      onInput={onNameInput}
    />
  );
};

export default SetNameInput;
