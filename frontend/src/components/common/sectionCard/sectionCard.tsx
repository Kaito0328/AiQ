import React from "react";
import clsx from "clsx";
import { colorMap, ThemeColor } from "../../../style/color";

type Props = {
  icon: React.ReactNode;
  label: string;
  color: ThemeColor;
  onClick: () => void;
};

const SectionCard: React.FC<Props> = ({ icon, label, color, onClick }) => {
    const colorClass = colorMap[color];
  return (
    <button
      onClick={onClick}
      className={clsx(
        colorClass.base,
        colorClass.hover,
        colorClass.text,
        "flex flex-col items-center justify-center p-6 text-white rounded-xl shadow-lg hover:shadow-2xl",
        "transform hover:scale-105 transition-all duration-300 ease-out"
      )}
    >
      <div className="text-5xl mb-2">{icon}</div>
      <span className="text-lg font-semibold">{label}</span>
    </button>
  );
};

export default SectionCard;
