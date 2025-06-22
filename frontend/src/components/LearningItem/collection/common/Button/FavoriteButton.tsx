// components/FavoriteButton.tsx
import React from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { RoundKey } from "../../../../../style/rounded";
import BaseButton from "../../../../common/button/BaseButton";
import { SpecialColorKey } from "../../../../../style/colorStyle";

interface Props {
  isFavorite: boolean;
  onToggle: () => void;
}

const FavoriteButton: React.FC<Props> = ({ isFavorite, onToggle }) => {
  return (
    <BaseButton
      onClick={onToggle}
      title={isFavorite ? "お気に入り解除" : "お気に入り登録"}
      icon = {isFavorite ? <FaHeart /> : <FaRegHeart />}
      style = {{
        color: {
          colorKey: SpecialColorKey.Heart,
        },
        roundKey: RoundKey.Full
      }}
    />

  );
};

export default FavoriteButton;
