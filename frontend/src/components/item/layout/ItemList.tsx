import ActionButtons from "./ActionButtons";
import { FaArrowDown, FaArrowUp } from "react-icons/fa";
import { useEffect, useRef, useState } from "react";

interface EditableItemListProps<TItem, TInput> {
  items: TItem[];
  pendingCreations: TInput[];
  selectedIds: number[];
  isSelecting: boolean;
  isOwner: boolean;
  hasPendingUpsert: boolean;
  renderItem: (item: TItem, isNew: boolean) => React.ReactNode;
  renderPendingItem: (item: TInput, index: number) => React.ReactNode;
  onToggleSelectMode: () => void;
  toggleSelect: (id: number) => void;
  onAddPendingCreation: () => void;
  onBatchUpsert: () => void;
  onBatchDelete: () => void;
}

function EditableItemList<TItem extends { id: number }, TInput>({
  items,
  pendingCreations,
  selectedIds,
  isSelecting,
  isOwner,
  hasPendingUpsert,
  renderItem,
  renderPendingItem,
  onToggleSelectMode,
  toggleSelect,
  onAddPendingCreation,
  onBatchUpsert,
  onBatchDelete,
}: EditableItemListProps<TItem, TInput>) {
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative pb-40">
      <div ref={topRef} />
      <ul className="space-y-4">
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
      <div ref={bottomRef} className="pt-8" />
      
      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur border-t border-gray-200 shadow-md">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <ActionButtons
            isOwner={isOwner}
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
      
      {/* Scroll Navigation Buttons */}
      <div className="fixed bottom-24 right-4 flex flex-col gap-3 z-40">
        {showScrollTop && (
          <button
            onClick={() => topRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="p-3 rounded-full bg-white/80 backdrop-blur shadow hover:bg-white text-gray-800"
            aria-label="ページ上部へ"
          >
            <FaArrowUp />
          </button>
        )}
        <button
          onClick={() => bottomRef.current?.scrollIntoView({ behavior: "smooth" })}
          className="p-3 rounded-full bg-white/80 backdrop-blur shadow hover:bg-white text-gray-800"
          aria-label="ページ下部へ"
        >
          <FaArrowDown />
        </button>
      </div>
    </div>
  );  
}

export default EditableItemList;
