import React from "react";
import ItemInput from "../../../common/Input/ItemInput";

interface Props {
  description?: string;
  onDescriptionInput: (input: string) => void;
}

const SetDescriptionInput: React.FC<Props> = ({
  description,
  onDescriptionInput

}) => {

  return (
    <ItemInput
      placeholder="コレクションセットの説明を入力"
      defaultValue={description}
      onInput={onDescriptionInput}
    />
  );
};

export default SetDescriptionInput;
