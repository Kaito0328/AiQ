import React, { useState } from 'react';
import ProgressBar from '../../common/ProgressBar';
import BaseCard from '../../containerComponents/BaseCard';
import ResumeButton from './ResumeButton';
import BaseLabel from '../../baseComponents/BaseLabel';
import { FaBook, FaFilter, FaSort } from 'react-icons/fa';
import { FontWeightKey } from '../../../style/fontWeight';
import { CoreColorKey } from '../../../style/colorStyle';
import { SizeKey, SizeProperty } from '../../../style/size';
import { CasualQuiz, filterTypeLabels, sortKeyLabels } from '../../../types/quiz';

interface ItemProps {
    quiz: CasualQuiz;
    disabled?: boolean;
    handleResumeQuiz: () => Promise<void>;
}

const ResumeItem: React.FC<ItemProps> = ({quiz, disabled, handleResumeQuiz}) => {
  const [resumeLoading, setResumeLoading] = useState<boolean>(false);

  const onClick = async () => {
    setResumeLoading(true);
    await handleResumeQuiz();
    setResumeLoading(false);
  };

    const answered = quiz.totalQuestions - quiz.remainingQuestions;
    const progressPercent = Math.round((answered / quiz.totalQuestions) * 100);
    const answeredText = `${answered} / ${quiz.totalQuestions} 問解答済み`;
    const filterText = quiz.filterTypes.map((f) => filterTypeLabels[f] ?? f).join('・');
    const sortText = quiz.sortKeys.map((s) => sortKeyLabels[s] ?? s).join('・');
  return (
    <BaseCard>
        <div className="flex justify-between items-center mb-4">
            <BaseLabel
                icon={<FaBook/>}
                label={quiz.collectionNames.join(', ')}
                style={{
                    fontWeightKey: FontWeightKey.Semibold,
                    color: {
                        colorKey: CoreColorKey.Primary
                    },
                    size: {
                        sizeKey: SizeKey.LG,
                        properties: [SizeProperty.Text]
                    }
                }}
            />
            <ResumeButton
                onClick={onClick}
                loading={resumeLoading}
                disabled={disabled}
            />
        </div>

        <div className="mb-2 text-sm text-gray-700 flex items-center gap-2">
            <BaseLabel
                label={answeredText}
                style={{
                    color: {
                        colorKey: CoreColorKey.Secondary,
                    },
                    size: {
                        sizeKey: SizeKey.SM
                    }
                }}
            />
        </div>

        <ProgressBar
            value={progressPercent}
        />

        <div>
            <div className="flex space-x-2">
                <BaseLabel
                    icon={<FaFilter/>}
                    label="フィルタ:"
                />
                <BaseLabel
                    label={filterText}
                    style={{
                        color: {
                            colorKey: CoreColorKey.Primary
                        },
                    }}
                />
            </div>
            <div className="flex space-x-2">
                <BaseLabel
                    icon={<FaSort/>}
                    label="ソート　:"
                />
                <BaseLabel
                    label={sortText}
                    style={{
                        color: {
                            colorKey: CoreColorKey.Primary
                        },
                    }}
                />
            </div>
        </div>
    </BaseCard>
  );
};

export default ResumeItem;
