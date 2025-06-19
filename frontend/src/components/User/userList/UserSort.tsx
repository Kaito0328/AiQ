import React, { useState } from "react";
import { ChevronDownIcon } from "lucide-react";
import { UsersSortOption, UsersSortType } from "../../../types/user";
import UserSortButton from "./UserSortButton";
import BaseButton from "../../common/button/BaseButton";
import { SizeKey } from "../../../style/size";
import { ColorPropertyKey } from "../../../style/colorStyle";

const SORT_OPTIONS: UsersSortOption[] = [
  { type: UsersSortType.FollowerCountAsc, label: "フォロワー数 ↑" },
  { type: UsersSortType.FollowerCountDesc, label: "フォロワー数 ↓" },
  { type: UsersSortType.NameAsc, label: "名前順 ↑" },
  { type: UsersSortType.NameDsc, label: "名前順 ↓" },
];

interface Props {
  sort: UsersSortType;
  onSortChange: (option: UsersSortType) => void;
}

const UserSort: React.FC<Props> = ({ sort, onSortChange }) => {
  const [open, setOpen] = useState(false);
  const selected = SORT_OPTIONS.find(opt => opt.type === sort);

  return (
    <div className="relative">
      <BaseButton
        icon={<ChevronDownIcon />}
        label={selected?.label ?? "並び替え"}
        onClick={() => setOpen(!open)}
        iconRight={true}
        style={{
          size: {
            sizeKey: SizeKey.SM
          },
          color: {
            properties: [ColorPropertyKey.Label]
          }
        }}
      />

      {open && (
        <div className="absolute mt-2 ring-0 rounded-md shadow-lg bg-white z-10">
          <ul className="py-1">
            {SORT_OPTIONS.map(option => (
              <UserSortButton
                key={option.type}
                sortOption={option}
                isSelected={option.type === sort}
                onClick={() => {
                  onSortChange(option.type);
                  setOpen(false);
                }}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserSort;
