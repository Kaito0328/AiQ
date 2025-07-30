import React, { useState } from "react";
import { Collection, CollectionInput } from "../../../../../types/collection";
import EditCompleteDeleteButtons from "../../../common/Buttons/EditCompleteDeleteButtons";
import OpenButton from "../Button/OpenButton";
import CollectionNameInput from "../Input/CollectionNameInput";
import CollectionDescriptionInput from "../Input/CollectionDescriptionInput";

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

  const onOpenToggle = () => {
    setInput((prev) => ({ ...prev, ["open"]: !prev.open}))
  }

  return (
    <div>
      {/* 上部：名前・開閉・ボタン群 */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {/* 左：名前入力 */}
        <div className="min-w-[200px] max-w-[400px] w-full flex-1">
          <CollectionNameInput
            name={input.name}
            onNameInput={(value) => handleChange("name", value)}
          />
        </div>

        <div>
          <OpenButton
            open={input.open ?? false}
            onToggle={() => onOpenToggle()}
          />
        </div>

        {/* 右：編集完了・削除ボタン */}
        <div className="ml-auto">
          <EditCompleteDeleteButtons
            onEditComplete={() => onEditComplete(input)}
            onDelete={onDelete}
          />
        </div>
      </div>

      {/* 下部：説明入力 */}
      <div className="border-t mt-4 pt-4">
        <CollectionDescriptionInput
          description={input.descriptionText}
          onDescriptionInput={(value) => handleChange("descriptionText", value)}
        />
      </div>
    </div>
  );
};

export default EditCard;
