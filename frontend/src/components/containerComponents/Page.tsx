import React, { PropsWithChildren} from "react";
import clsx from "clsx";
import { ColorKey, ColorPropertyKey } from "../../style/colorStyle";
import { SizeKey, SizeProperty } from "../../style/size";
import { ComponentStyle, getClassByStyle, PartialComponentStyle, StyleMaps } from "../../style/style";
import { pageColorMap } from "../../styleMap/colorMap";
import { HEADER_HEIGHT } from "../Layout/Layout";
import { pageSizeMap } from "../../styleMap/sizeMap";

type PageStyle = {
    colorKey?: ColorKey;
    sizeKey?: SizeKey;
};

const defaultStyle: ComponentStyle = {
    color: {
        colorKey: ColorKey.Base,
        properties: [ColorPropertyKey.Bg]
    },
    size: {
        sizeKey: SizeKey.MD,
        properties: [SizeProperty.Padding],
        full_width: true
    }
};

type PageProps = {
    style?: PageStyle;  
};

const Page: React.FC<PropsWithChildren<PageProps>> = ({
    style,
    children,
}) => {
    const classStyle: PartialComponentStyle = {
        color: {
            colorKey: style?.colorKey,
        },
        size: {
            sizeKey: style?.sizeKey,
        }
    }

    const maps: Partial<StyleMaps> = {
        colorMap: pageColorMap,
        sizeMap: pageSizeMap
    }
    const classText = getClassByStyle(maps, defaultStyle, classStyle);
  return (
    <div style={{ paddingTop: `${HEADER_HEIGHT}vh` }} className={clsx("h-full w-full", classText)}>
        {children}
    </div>
  );
};

export default Page;
