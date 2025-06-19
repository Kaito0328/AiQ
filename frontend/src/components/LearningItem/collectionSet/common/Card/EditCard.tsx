import React, { useState } from "react";
import { Collection, CollectionInput } from "../../../../../types/collection";
import SetNameInput from "../Input/SetNameInput";
import SetDescriptionInput from "../Input/SetDescriptionInput";
import EditCompleteDeleteButtons from "../../../common/Buttons/EditCompleteDeleteButtons";

interface Props {
  collection: Collection | CollectionInput;
  onEditComplete: (input: CollectionInput) => void;
  onDelete: () => void;
}

const EditCard: React.FC<Props> = ({
  collection,
  onEditComplete,
  onDelete
}) => {
  const [input, setInput] = useState<CollectionInput>({
    name: collection.name,
    open: collection.open,
    descriptionText: collection.descriptionText
  });

  const handleChange = (field: keyof CollectionInput, value: string | boolean) => {
    setInput((prev) => ({ ...prev, [field]: value }));
  };


  return (
    <div className="p-4 shadow-md rounded-xl hover:shadow-lg transition-all duration-200 w-full max-w-3xl mx-auto bg-white space-y-4">
      {/* 上部：名前・開閉・ボタン群 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* 左：名前入力 */}
        <div className="min-w-[200px] max-w-[400px] w-full flex-1">
          <SetNameInput
            name={input.name}
            onNameInput={(value) => handleChange("name", value)}
          />
        </div>

        {/* 右：編集完了・削除ボタン */}
        <div className="ml-auto flex-wrap">
          <EditCompleteDeleteButtons
            onEditComplete={() => onEditComplete(input)}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* 下部：説明入力 */}
      <div className="border-t pt-4">
        <SetDescriptionInput
          description={input.descriptionText}
          onDescriptionInput={(value) => handleChange("descriptionText", value)}
        />
      </div>
    </div>
  );
};

export default EditCard;
