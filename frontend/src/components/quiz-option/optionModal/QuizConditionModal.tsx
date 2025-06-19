import React, { useState } from "react";
import { FilterCondition, SortCondition } from "../../../types/quiz";
import SortSection from "../../../components/quiz-option/optionModal/sort/SortSection";
import FilterSection from "../../../components/quiz-option/optionModal/filter/FilterSection";
import LimitSection from "../../../components/quiz-option/optionModal/LimitSection";
import BaseLabel from "../../baseComponents/BaseLabel";
import { SizeKey } from "../../../style/size";
import ModalActionButtons from "./ModalActionButtons";
import BaseCard from "../../containerComponents/BaseCard";

type Props = {
    onCancel: () => void;
    handleStart: (filters: FilterCondition[], sorts: SortCondition[], limit: number) => void;
    loading: boolean;
}

const QuizConditionModal: React.FC<Props> = ({onCancel, handleStart, loading}) => {
  const [filters, setFilters] = useState<FilterCondition[]>([]);
  const [sorts, setSorts] = useState<SortCondition[]>([]);
  const [limit, setLimit] = useState(10);

  return (
    <>
      {/* 背景オーバーレイ */}
      <div
        className="fixed inset-0 bg-black opacity-60 backdrop-blur-sm z-40"
        onClick={onCancel}
      />

      {/* モーダル本体 */}
      <div className="fixed inset-0 flex justify-center items-center z-50">
        <div className="w-[90%] max-w-[600px]">
          <BaseCard>
            <BaseLabel
              label={"クイズ条件の設定"}
              style={{
                size: { sizeKey: SizeKey.LG }
              }}
            />
            <div className="space-y-5"> 
              <FilterSection filters={filters} setFilters={setFilters} />
              <SortSection sorts={sorts} setSorts={setSorts} />
              <LimitSection limit={limit} setLimit={setLimit} />
            </div>
            <div>
              <ModalActionButtons
                onCancel={onCancel}
                onConfirm={() => handleStart(filters, sorts, limit)}
                loading={loading}
              />
            </div>
          </BaseCard>
        </div>
      </div>
    </>
  );
};

export default QuizConditionModal;
