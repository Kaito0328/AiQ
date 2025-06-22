import React from 'react';
import { FaHome, FaRedo, FaRedoAlt } from 'react-icons/fa';
import BaseButton from '../../common/button/BaseButton';
import { CoreColorKey } from '../../../style/colorStyle';
import { FontWeightKey } from '../../../style/fontWeight';
import { RoundKey } from '../../../style/rounded';
import BaseLabel from '../../baseComponents/BaseLabel';
import { SizeKey } from '../../../style/size';
import BaseCard from '../../containerComponents/BaseCard';
import ProgressBar from '../../common/ProgressBar';

interface ScoreSummaryProps {
  correctCount: number;
  total: number;
  correctRate: string;
  onGoHome: () => void;
  onRetryIncorrect: () => void;
  onRetryAll: () => void;
}

const ScoreSummary: React.FC<ScoreSummaryProps> = ({
  correctCount,
  total,
  correctRate,
  onGoHome,
  onRetryIncorrect,
  onRetryAll,
}) => {
  const resultText = `${total}問中 ${correctCount}問正解 — 正答率 ${correctRate}%`;
  return (
    <BaseCard
      style={{
        size: {
          sizeKey: SizeKey.XL
        }
      }}
    >
      <div className='flex flex-col items-center justify-center'>
        <BaseLabel
          label="結果発表"
          style={{
            fontWeightKey: FontWeightKey.Bold,
            size: {
              sizeKey: SizeKey.XL
            }
          }}
        />
        <BaseLabel
          label={resultText}
        />

        <ProgressBar
          value={correctCount / total * 100}
          style={{
            sizeKey: SizeKey.LG
          }}
        />

        <div className="flex justify-center flex-wrap gap-4">
          <BaseButton
          icon={<FaHome/>}
            label="ホーム"
            onClick={onGoHome}
            style={{
              color: {
                colorKey: CoreColorKey.Secondary,
              },
              fontWeightKey: FontWeightKey.Semibold,
              roundKey: RoundKey.Lg
            }}
          />
          <BaseButton
          icon={<FaRedo/>}
            label="間違いだけ再挑戦"
            onClick={onRetryIncorrect}
            style={{
              color: {
                colorKey: CoreColorKey.Danger,
              },
              roundKey: RoundKey.Lg
            }}
          />
          <BaseButton
          icon={<FaRedoAlt/>}
            label="全問再挑戦"
            onClick={onRetryAll}
            style={{
              color: {
                colorKey: CoreColorKey.Primary,
              },
              roundKey: RoundKey.Lg
            }}
          />
        </div>
                
      </div>
    </BaseCard>
  );
};

export default ScoreSummary;
