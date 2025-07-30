import React, { useEffect, useRef } from 'react';
import BaseCard from '../../containerComponents/BaseCard';
import BaseButton from '../../common/button/BaseButton';
import BaseLabel from '../../baseComponents/BaseLabel';
import { FontWeightKey } from '../../../style/fontWeight';
import { CoreColorKey } from '../../../style/colorStyle';
import { SizeKey } from '../../../style/size';

interface ResultProps {
  isCorrect: boolean;
  correctAnswer: string;
  description?: string;
  onNext: () => void;
}

const Result: React.FC<ResultProps> = ({ isCorrect, correctAnswer, description, onNext }) => {
  const hasMovedRef = useRef(false);

  const moveNext = () => {
    if (!hasMovedRef.current) {
      hasMovedRef.current = true;
      onNext();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.repeat) {
      setTimeout(() => {
        moveNext();
      }, 0);

      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onNext]);

  return (
    <BaseCard
        style={{
            size: {
                sizeKey: SizeKey.XL
            }
        }}
    >
      <div className='flex flex-col justify-center items-center'>
        <div className='flex flex-col justify-center items-center'>
        <BaseLabel
            label={isCorrect  ? '正解！' : '不正解'}
            style={{
                fontWeightKey: FontWeightKey.Bold,
                color: {
                    colorKey: isCorrect ? CoreColorKey.Success : CoreColorKey.Danger
                },
                size: {
                    sizeKey: SizeKey.XL
                }
            }}
        />

        {/* 正しい答え */}
        <BaseLabel
            label={correctAnswer}
            style={{
                fontWeightKey: FontWeightKey.Semibold,
                size: {
                    sizeKey: SizeKey.LG
                }
            }}
        />

        {/* 説明文 */}
        {description && (
            <BaseLabel
                label={description}
                style={{
                    fontWeightKey: FontWeightKey.Normal,
                    color: {
                        colorKey: CoreColorKey.Secondary
                    }
                }}
            />
        )}
        </div>

        <BaseButton
            onClick={moveNext}
            label="次の問題へ"
            bg_color={true}
            style={{
                fontWeightKey: FontWeightKey.Bold,
                color: {
                    colorKey: CoreColorKey.Success
                },
                size: {
                    sizeKey: SizeKey.MD
                }
            }}
        />
      </div>
    </BaseCard>
  );
};

export default Result;
