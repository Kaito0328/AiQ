import ActionButtons from "./Buttons/ActionButtons";
import BaseCard from "../../containerComponents/BaseCard";
import { ShadowKey } from "../../../style/shadow";
import { SizeKey } from "../../../style/size";
import { RoundKey } from "../../../style/rounded";
import LoadingIndicator from "../../common/Loading/loadingIndicator";

interface ItemListProps<TItem, TInput> {
  items: TItem[];
  pendingCreations: TInput[];
  selectedIds: number[];
  isSelecting: boolean;
  isOwner: boolean;
  hasPendingUpsert: boolean;
  loading: boolean;
  errorMessage?: string;
  renderItem: (item: TItem, isNew: boolean) => React.ReactNode;
  renderPendingItem: (item: TInput, index: number) => React.ReactNode;
  onToggleSelectMode: () => void;
  toggleSelect: (id: number) => void;
  onAddPendingCreation: () => void;
  onBatchUpsert: () => void;
  onBatchDelete: () => void;
}

function ItemList<TItem extends { id: number }, TInput>({
  items,
  pendingCreations,
  selectedIds,
  isSelecting,
  isOwner,
  hasPendingUpsert,
  loading,
  errorMessage,
  renderItem,
  renderPendingItem,
  onToggleSelectMode,
  toggleSelect,
  onAddPendingCreation,
  onBatchUpsert,
  onBatchDelete,
}: ItemListProps<TItem, TInput>) {

  if (loading) return (
    <LoadingIndicator />
  );

  return (
    <div className="relative space-y-6">
      {/* エラーメッセージ表示 */}
      {errorMessage && (
        <div className="px-4 py-3 rounded-lg bg-red-100 text-red-800 border border-red-300">
          {errorMessage}
        </div>
      )}
      <>
        <ul className="space-y-4 mb-7 grid gap-6 lg:grid-cols-2">
          {items.map((item) => (
            <li key={`existing-${item.id}`} className="relative">
              <div
                className={`transition rounded-xl   ${
                  isSelecting && selectedIds.includes(item.id) ? "ring-2 ring-blue-400" : ""
                }`}
              >
                <div className="flex items-center">
                  {isSelecting && (
                    <input
                      type="checkbox"
                      className="m-2 accent-blue-500 scale-125"
                      checked={selectedIds.includes(item.id)}
                      onChange={() => toggleSelect(item.id)}
                    />
                  )}
                  {renderItem(item, false)}
                </div>
              </div>
            </li>
          ))}
          {pendingCreations.map((item, index) => (
            <li key={`new-${index}`}>
              <div className="">
                {renderPendingItem(item, index)}
              </div>
            </li>
          ))}
        </ul>

        {/* アクションボタン */}
        {isOwner && (
          <div className="sticky bottom-0 z-10  bg-white/90 backdrop-blur border-t border-gray-200 shadow-md">
            <BaseCard
              style={{
                shadow: {
                  shadowKey: ShadowKey.LG
                },
                size: {
                  sizeKey: SizeKey.LG
                },
                roundKey: RoundKey.Lg
              }}
            >
              <ActionButtons
                isSelecting={isSelecting}
                toggleSelectMode={onToggleSelectMode}
                handleAddPendingCreation={onAddPendingCreation}
                handleBatchUpsert={onBatchUpsert}
                handleBatchDelete={onBatchDelete}
                hasPendingChanges={pendingCreations.length > 0 || hasPendingUpsert}
                hasSelectedIds={selectedIds.length > 0}
              />
            </BaseCard>
            </div>

        )}
      </>
  </div>
  );
}

export default ItemList;
