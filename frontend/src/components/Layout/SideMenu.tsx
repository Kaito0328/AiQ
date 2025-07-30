import React from "react";
import clsx from "clsx";
import { X } from "lucide-react";
import { CoreColorKey, ColorPropertyKey } from "../../style/colorStyle";
import { SizeKey, SizeProperty } from "../../style/size";
import { FontWeightKey } from "../../style/fontWeight";
import { ComponentStyle, getClassByStyle, StyleMaps } from "../../style/style";
import { sideMenuColorMap } from "../../styleMap/colorMap";
import { sideMenuSizeMap } from "../../styleMap/sizeMap";
import Paths from "../../routes/Paths";
import BaseButton from "../common/button/BaseButton";
import BaseLabel from "../baseComponents/BaseLabel";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
  colorKey?: CoreColorKey;
  sizeKey?: SizeKey;
}

const defaultStyle: ComponentStyle = {
  color: {
    colorKey: CoreColorKey.Base,
    properties: [ColorPropertyKey.Bg],
  },
  size: {
    sizeKey: SizeKey.MD,
    properties: [SizeProperty.Padding],
    full_width: false
  },
};

const menuItems = [
  { label: "ホーム", path: Paths.HOME },
  { label: "アカウント", path: Paths.USER_PROFILE },
  { label: "中断したクイズ", path: Paths.RESUMABLE_QUIZZES_LIST },
];

const SideMenu: React.FC<Props> = ({
  isOpen,
  onClose,
  onNavigate,
  colorKey,
  sizeKey,
}) => {
  const classStyle = {
    color: {
      colorKey,
    },
    size: {
      sizeKey,
    },
  };

  const maps: Partial<StyleMaps> = {
    colorMap: sideMenuColorMap,
    sizeMap: sideMenuSizeMap,
  };

  const containerClass = getClassByStyle(maps, defaultStyle, classStyle);

  return (
    <div
      className={clsx(
        "fixed top-0 z-50 right-0 h-full w-64 transform transition-transform duration-300 ease-in-out shadow-2xl rounded-l-xl",
        isOpen ? "translate-x-0" : "translate-x-full",
        containerClass
      )}
    >
      <div className="flex justify-between items-center border-b">
        <BaseLabel
          label="MENU"
          style={{
            fontWeightKey: FontWeightKey.Semibold,
            color: {
              colorKey: CoreColorKey.Primary,
              properties: [ColorPropertyKey.Label],
            },
            size: {
                sizeKey: SizeKey.LG,
                properties: [SizeProperty.Text]
            }
          }}
          bg_color={true}
        />
        <BaseButton
          icon={<X />}
          onClick={onClose}
          style={{
            size: { sizeKey: SizeKey.XL,
                properties: [SizeProperty.Text]
             },
            color: {
              colorKey: CoreColorKey.Primary,
              properties: [ColorPropertyKey.Label],
            },
          }}
          bg_color={true}
        />
      </div>
      <nav className="flex flex-col mt-6 space-y-6">
        {menuItems.map((item) => (
          <BaseButton
            key={item.path}
            label={item.label}
            onClick={() => onNavigate(item.path)}
            style={{
              size: { sizeKey: SizeKey.LG, properties:[SizeProperty.Text] },
              color: {
                colorKey: CoreColorKey.Primary,
                properties: [ColorPropertyKey.Label],
              },
              fontWeightKey: FontWeightKey.Semibold
            }}
            bg_color={true}
            center={false}
          />
        ))}
      </nav>
    </div>
  );
};

export default SideMenu;
