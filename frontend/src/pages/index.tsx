import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLoginUser } from "../hooks/useLoginUser";
import { useOfficialUser } from "../hooks/useOfficialUser";
import Paths from "../routes/Paths";
import LoadingButton from "../components/common/button/LoadingButton";
import Page from "../components/containerComponents/Page";
import { CoreColorKey } from "../style/colorStyle";
import { SizeKey } from "../style/size";
import BaseLabel from "../components/baseComponents/BaseLabel";
import { FontWeightKey } from "../style/fontWeight";
import Text from "../components/baseComponents/Text";

const TopPage: React.FC = () => {
  const navigate = useNavigate();
  const { loading: loginLoading } = useLoginUser();
  const { loading: officialLoading } = useOfficialUser();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!loginLoading && !officialLoading) {
      setReady(true); // ローディング完了後、ボタンを有効にする
    }
  }, [loginLoading, officialLoading]);

  const handleStart = () => {
    if (ready) {
      navigate(Paths.HOME);
    }
  };

  return (
    <Page
  style={{
    colorKey: CoreColorKey.Base,
  }}
  full_height={true}
  header={false}
>
  {/* ここに注目: 新しいラッパーdivを追加、またはPageの内部構造を調整 */}
  <div className="flex flex-col items-center justify-center h-full w-full">
    <div className="flex flex-col w-full items-center justify-center h-max">
      {/* ロゴとアプリ名 */}
      <img src="/logo_black.png" alt="Logo" className="w-24 h-24 mb-4" />
      <BaseLabel
        label="AiQ"
        style={{
          size: {
            sizeKey: SizeKey.XL,
          },
          fontWeightKey: FontWeightKey.Bold,
          color: {
            colorKey: CoreColorKey.Primary
          }
        }}
      />
      <Text
        text="あなた専用のクイズ学習アプリ。"
        style={{
          sizeKey: SizeKey.LG,
          fontWeightKey: FontWeightKey.Normal,
          color: {
            colorKey: CoreColorKey.Base
          }
        }}
      />

      <div className="mt-20 flex justify-center w-full">
        <LoadingButton
          onClick={handleStart}
          loading={!ready}
          label="はじめる"
          loadingText="読み込み中..."
          bg_color={true}
          style={{
            size: {
              widthPercent: 20,
              full_width: true
            }
          }}
        />
      </div>
    </div>
  </div>
</Page>

  );
};

export default TopPage;
