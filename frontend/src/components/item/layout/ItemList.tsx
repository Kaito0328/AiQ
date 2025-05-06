import ActionButtons from "./ActionButtons";
import LoadingIndicator from "./LoadingIndicator";

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
        <ul className="space-y-4 mb-10 grid gap-6 lg:grid-cols-2 mr-4">
          {items.map((item) => (
            <li key={`existing-${item.id}`} className="relative">
              <div
                className={`transition p-3 md:p-4 rounded-xl bg-white/60 hover:bg-white/80 backdrop-blur-sm shadow-sm ${
                  isSelecting && selectedIds.includes(item.id) ? "ring-2 ring-blue-400" : ""
                }`}
              >
                <div className="flex items-start gap-4">
                  {isSelecting && (
                    <input
                      type="checkbox"
                      className="mt-1.5 accent-blue-500 scale-125"
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
              <div className="transition p-3 md:p-4 rounded-xl bg-yellow-50/60 backdrop-blur-sm shadow-sm">
                {renderPendingItem(item, index)}
              </div>
            </li>
          ))}
        </ul>

        {/* アクションボタン */}
        {isOwner && (
          <div className="sticky bottom-0 z-10 bg-white/90 backdrop-blur border-t border-gray-200 shadow-md">
            <div className="w-full px-4 py-3">
              <ActionButtons
                isSelecting={isSelecting}
                toggleSelectMode={onToggleSelectMode}
                handleAddPendingCreation={onAddPendingCreation}
                handleBatchUpsert={onBatchUpsert}
                handleBatchDelete={onBatchDelete}
                hasPendingChanges={pendingCreations.length > 0 || hasPendingUpsert}
                hasSelectedIds={selectedIds.length > 0}
              />
            </div>
          </div>
        )}
      </>
  </div>
  );
}

export default ItemList;
