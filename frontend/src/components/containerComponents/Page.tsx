import React, { PropsWithChildren, useRef } from "react";
import clsx from "clsx";
import { ColorKey, ColorPropertyKey } from "../../style/colorStyle";
import { SizeKey, SizeProperty } from "../../style/size";
import {
  ComponentStyle,
  getClassByStyle,
  PartialComponentStyle,
  StyleMaps,
} from "../../style/style";
import { pageColorMap } from "../../styleMap/colorMap";
import { pageSizeMap } from "../../styleMap/sizeMap";
import { HEADER_HEIGHT } from "../Layout/Layout";
import BaseLabel from "../baseComponents/BaseLabel";
import { FontWeightKey } from "../../style/fontWeight";
import LoadingIndicator from "../common/Loading/loadingIndicator";
import BackButton from "./Page/BackButton";
import ScrollControls from "./Page/ScrollControls";

type PageStyle = {
  colorKey?: ColorKey;
  sizeKey?: SizeKey;
};

const defaultStyle: ComponentStyle = {
  color: {
    colorKey: ColorKey.Base,
    properties: [ColorPropertyKey.Bg],
  },
  size: {
    sizeKey: SizeKey.MD,
    properties: [SizeProperty.Padding],
    full_width: true,
  },
};

type PageProps = {
  title?: string;
  loading?: boolean;
  loadingText?: string;
  errorMessage?: string;
  style?: PageStyle;
  header?: boolean;
  withScrollControls?: boolean;
  withBackBUtton?: boolean;
};

const Page: React.FC<PropsWithChildren<PageProps>> = ({
  title,
  loading,
  loadingText = "読み込み中です…",
  errorMessage,
  style,
  children,
  header = true,
  withScrollControls = false,
  withBackBUtton = false,
}) => {
    const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const classStyle: PartialComponentStyle = {
    color: {
      colorKey: style?.colorKey,
    },
    size: {
      sizeKey: style?.sizeKey,
    },
  };

  const maps: Partial<StyleMaps> = {
    colorMap: pageColorMap,
    sizeMap: pageSizeMap,
  };

  const classText = getClassByStyle(maps, defaultStyle, classStyle);
  return (
    <div
      style={ header ? { paddingTop: `${HEADER_HEIGHT}vh` } : {}}
      className={clsx("min-h-screen h-full w-full", classText)}
    >
    {withBackBUtton && <BackButton/>}
      {title && (
        <div className="mb-6 flex justify-center">
            <BaseLabel
            label={title}
            style={{
                color: {
                colorKey: ColorKey.Primary,
                },
                size: {
                sizeKey: SizeKey.XL,
                },
                fontWeightKey: FontWeightKey.Bold,
            }}
            />
        </div>
      )}

      {loading ? (
        <LoadingIndicator
            text={loadingText}
            colorKey={style?.colorKey}
            sizeKey={SizeKey.XL}
        />
      ) : errorMessage ? (
        <BaseLabel
            label={errorMessage}
            style={{
            color: { colorKey: ColorKey.Danger },
            size: { sizeKey: SizeKey.MD },
            }}
        />
    ) : (
        <div>
            <div ref={topRef} />
            {children}
            <div ref={bottomRef} className="pt-8" />
            {withScrollControls && (
            <ScrollControls topRef={topRef} bottomRef={bottomRef} />
            )}
        </div>
    )}
    </div>
  );
};

export default Page;
