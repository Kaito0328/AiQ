import React, { useEffect, useState } from "react";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import BaseButton from "../../common/button/BaseButton";
import { ColorKey } from "../../../style/colorStyle";
import { RoundKey } from "../../../style/rounded";
import { ShadowKey } from "../../../style/shadow";

interface Props {
  topRef: React.RefObject<HTMLDivElement | null>;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

const ScrollControls: React.FC<Props> = ({ topRef, bottomRef }) => {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="fixed bottom-6 left-3 flex flex-col gap-3 z-40 items-end">
      {showScrollTop && (
        <BaseButton
          onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth" })}
          title="ページ上部へ"
          icon={<FaArrowUp/>}
          style={{
            color: {colorKey: ColorKey.Base},
            roundKey: RoundKey.Full,
            shadow: {
                shadowKey: ShadowKey.MD
            }
          }}
          bg_color={true}
        />
      )}
      <BaseButton
        onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
        title={"ページ下部へ"}
        icon={<FaArrowDown/>}
        style={{
            color: {colorKey: ColorKey.Base},
            roundKey: RoundKey.Full,
            shadow: {
                shadowKey: ShadowKey.MD
            }
          }}
          bg_color={true}
      />
    </div>
  );
};

export default ScrollControls;
