import React, { useState } from 'react';
import { AnswerHistory } from '../../../types/answerHistory';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import BaseCard from '../../containerComponents/BaseCard';
import { ColorKey } from '../../../style/colorStyle';
import { SizeKey, SizeProperty } from '../../../style/size';
import BaseLabel from '../../baseComponents/BaseLabel';
import { FontWeightKey } from '../../../style/fontWeight';
import ArrowToggleButton from '../../LearningItem/common/Toggle/ArrowToggleButton';

interface AnswerItemProps {
  answer: AnswerHistory;
  index: number;
}

const AnswerItem: React.FC<AnswerItemProps> = ({ answer, index }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const onToggle = () => {
    setIsVisible(!isVisible);
  }
  return (
    <BaseCard
      style={{
        color: {
          colorKey: answer.correct ? ColorKey.Success : ColorKey.Danger
        },
        size: {
          sizeKey: SizeKey.LG
        }
      }}
    >
      <div>
        <div className="flex justify-between gap-2">
          <BaseLabel
            label={`Q${index}.   ${answer.question.questionText}`}
            style={{fontWeightKey: FontWeightKey.Semibold,
              size: {properties: [SizeProperty.Text]}
            }}
          />

          <BaseLabel
            icon={answer.correct
          ? <FaCheckCircle/>
          : <FaTimesCircle/>}
          style={{
            color: {
              colorKey: answer.correct ? ColorKey.Success : ColorKey.Danger
            }
          }}
          />
        </div>

        <div className="gap-3">
          {!answer.correct && (
            <div className='flex gap-3'>
            <BaseLabel
              label={"あなたの回答:"}
              style={{
                size: {
                  properties: [SizeProperty.Text]
                }
              }}
            />
            <BaseLabel
              label={answer.userAnswer || "(なし)"}
              style={{
                size: {
                  properties: [SizeProperty.Text]
                },
                fontWeightKey: FontWeightKey.Semibold
              }}
            />
          </div>
          )}

          <div className='flex gap-3'>
            <BaseLabel
              label={"正しい解答　:"}
              style={{
                size: {
                  properties: [SizeProperty.Text]
                }
              }}
            />
            <BaseLabel
              label={answer.question.correctAnswer}
              style={{
                fontWeightKey: FontWeightKey.Semibold,
                size: {
                  properties: [SizeProperty.Text]
                }
              }}
            />
          </div>
        </div>
        {answer.question.descriptionText && (
          <div className="mt-2">
            <ArrowToggleButton
              label='解説'
              isVisible={isVisible}
              onToggle={onToggle}

            />
            {isVisible && (
              <BaseLabel
                label={answer.question.descriptionText}
                style={{
                  color: {
                    colorKey: ColorKey.Secondary
                  }
                }}
              />
            )}
          </div>
        )}
      </div>  
    </BaseCard>
  );
};

export default AnswerItem;
