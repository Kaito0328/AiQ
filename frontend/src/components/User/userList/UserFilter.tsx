import React from "react";
import InLineTextInput from "../../baseComponents/InLineTextInput";
import { SizeKey } from "../../../style/size";


interface Props {
  searchText: string;
  onSearchChange: (text: string) => void;
}

const UserFilter: React.FC<Props> = ({
  searchText,
  onSearchChange
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-3 mb-4">
      <InLineTextInput
        placeholder="ユーザー名で検索"
        onChange={(value) => onSearchChange(value)}
        defaultValue={searchText}
        style={{
          size: {
            sizeKey: SizeKey.LG
          }
        }}
      />
    </div>
  );
};

export default UserFilter;
