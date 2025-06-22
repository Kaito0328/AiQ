import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu} from "lucide-react";
import clsx from "clsx";
import Paths from "../../routes/Paths";
import {
  ComponentStyle,
  getClassByStyle,
  PartialComponentStyle,
  StyleMaps,
} from "../../style/style";
import {
  CoreColorKey,
  ColorPropertyKey,
  ColorVariantKey,
} from "../../style/colorStyle";
import { SizeKey, SizeProperty } from "../../style/size";
import { ShadowKey } from "../../style/shadow";
import { headerColorMap } from "../../styleMap/colorMap";
import { headerSizeMap } from "../../styleMap/sizeMap";
import { HEADER_HEIGHT } from "./Layout";
import BaseLabel from "../baseComponents/BaseLabel";
import { FontWeightKey } from "../../style/fontWeight";
import BaseButton from "../common/button/BaseButton";
import SideMenu from "./SideMenu";

type HeaderStyle = {
  colorKey?: CoreColorKey;
  sizeKey?: SizeKey;
};

interface Props {
  style?: HeaderStyle;
}

const defaultStyle: ComponentStyle = {
  color: {
    colorKey: CoreColorKey.Primary,
    properties: [ColorPropertyKey.Bg, ColorPropertyKey.Label],
    variants: [ColorVariantKey.Hover],
  },
  size: {
    sizeKey: SizeKey.MD,
    properties: [SizeProperty.Padding],
    full_width: true,
  },
  shadow: {
    shadowKey: ShadowKey.None,
  },
};

const HeaderWithHamburgerMenu = ({ style }: Props) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  const classStyle: PartialComponentStyle = {
    color: {
      colorKey: style?.colorKey,
    },
    size: {
      sizeKey: style?.sizeKey,
    },
  };

  const maps: Partial<StyleMaps> = {
    colorMap: headerColorMap,
    sizeMap: headerSizeMap,
  };

  const headerClass = getClassByStyle(maps, defaultStyle, classStyle);

  return (
    <header style={{height:  `${HEADER_HEIGHT}vh` }} className={clsx("fixed top-0 left-0 w-full z-40 flex justify-between items-center", headerClass)}>
      {/* ロゴ */}
      <div className="flex items-center">
        <img
          src="/logo.png"
          alt="Logo"
          className="h-10 w-10 mr-2 cursor-pointer"
          onClick={() => handleNavigate(Paths.HOME)}
        />
      </div>

      <div
        className="absolute left-1/2 transform -translate-x-1/2"
      >
        <BaseLabel
          label="AiQ"
          style={{
            fontWeightKey: FontWeightKey.Bold,
            size: {
              sizeKey: SizeKey.XL
            },
            color: {
              colorKey: CoreColorKey.Primary,
              properties: [ColorPropertyKey.Label]
            }
          }}
          bg_color={true}
        />
      </div>


      <BaseButton
        icon={<Menu/>}
        style={{
          color: {colorKey: CoreColorKey.Primary,
            properties: [ColorPropertyKey.Label]
          },
          size: {
            sizeKey: SizeKey.XL,
            properties: [SizeProperty.Text]
          }
        }}
        bg_color={true}
        onClick={() => setIsOpen(true)}
      />

        <SideMenu
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onNavigate={handleNavigate}
        />

      {/* 背景オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black z-40 opacity-60"
          onClick={() => setIsOpen(false)}
        />
      )}
    </header>
  );
};

export default HeaderWithHamburgerMenu;
