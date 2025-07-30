import React, { PropsWithChildren, useRef } from "react";
import clsx from "clsx";
import { CoreColorKey, ColorPropertyKey, ColorStyle, getColorClass } from "../../style/colorStyle";
import { getSizeClass, SizeKey, SizeProperty, SizeStyle } from "../../style/size";
import { pageColorMap } from "../../styleMap/colorMap";
import { pageSizeMap } from "../../styleMap/sizeMap";
import { HEADER_HEIGHT } from "../Layout/Layout";
import BaseLabel from "../baseComponents/BaseLabel";
import { FontWeightKey } from "../../style/fontWeight";
import LoadingIndicator from "../common/Loading/loadingIndicator";
import BackButton from "./Page/BackButton";
import ScrollControls from "./Page/ScrollControls";

type PageStyle = {
  colorKey?: CoreColorKey;
  sizeKey?: SizeKey;
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
  full_height?: boolean;
  noPaddingElements?: React.ReactNode;
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
  full_height = false,
  noPaddingElements,
}) => {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const colorStyle: ColorStyle = {
    colorKey: style?.colorKey ?? CoreColorKey.Base,
    properties: [ColorPropertyKey.Bg],
  };

  const sizeStyle: SizeStyle = {
    sizeKey: style?.sizeKey ?? SizeKey.MD,
    properties: [SizeProperty.Padding],
    full_width: true,
  };
  const colorClassText = getColorClass(pageColorMap, colorStyle);
  const sizeClassText = getSizeClass(pageSizeMap, sizeStyle);
  return (
    <div
      style={header ? { paddingTop: `${HEADER_HEIGHT}vh` } : {}}
      className={clsx(full_height ? "h-screen" : "min-h-screen", "w-full", colorClassText)}
    >
      {/* padding外に配置する要素 */}
      {noPaddingElements}
      
      <div className={clsx(sizeClassText, "w-full h-full flex flex-col")}> {/* ← ここを変更: flex flex-col を追加 */}
        {withBackBUtton && <BackButton />}
        {title && (
          <div className="mb-6 flex justify-center">
            <BaseLabel
              label={title}
              style={{
                color: {
                  colorKey: CoreColorKey.Primary,
                },
                size: {
                  sizeKey: SizeKey.LG,
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
              color: { colorKey: CoreColorKey.Danger },
              size: { sizeKey: SizeKey.MD },
            }}
          />
        ) : (
          // ここを変更: items-center と justify-center を追加し、h-full を維持
          <div className="w-full h-full flex flex-col items-center justify-center">
            <div ref={topRef} />
            {children}
            <div ref={bottomRef} className="pt-8" />
            {withScrollControls && (
              <ScrollControls topRef={topRef} bottomRef={bottomRef} />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;