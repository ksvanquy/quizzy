'use client';

import { useState, useEffect } from 'react';

interface OrderItem {
  id: string;
  text: string;
  imageUrl?: string;
}

interface OrderingQuestionProps {
  questionText: string;
  items: OrderItem[];
  selectedAnswer: string[] | undefined;
  onAnswerChange: (order: string[]) => void;
}

export default function OrderingQuestion({
  questionText,
  items,
  selectedAnswer,
  onAnswerChange,
}: OrderingQuestionProps) {
  const [orderedItems, setOrderedItems] = useState<OrderItem[]>([]);
  const [availableItems, setAvailableItems] = useState<OrderItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Initialize items
  useEffect(() => {
    if (selectedAnswer && selectedAnswer.length > 0) {
      const ordered = selectedAnswer
        .map((id) => items.find((item) => item.id === id))
        .filter((item) => item !== undefined) as OrderItem[];
      setOrderedItems(ordered);
      setAvailableItems(items.filter((item) => !selectedAnswer.includes(item.id)));
    } else {
      setAvailableItems(items);
      setOrderedItems([]);
    }
  }, [items, selectedAnswer]);

  const handleAddItem = (item: OrderItem) => {
    const newOrdered = [...orderedItems, item];
    setOrderedItems(newOrdered);
    setAvailableItems(availableItems.filter((i) => i.id !== item.id));
    onAnswerChange(newOrdered.map((i) => i.id));
  };

  const handleRemoveItem = (index: number) => {
    const item = orderedItems[index];
    const newOrdered = orderedItems.filter((_, i) => i !== index);
    setOrderedItems(newOrdered);
    setAvailableItems([...availableItems, item]);
    onAnswerChange(newOrdered.map((i) => i.id));
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newOrdered = [...orderedItems];
    [newOrdered[index], newOrdered[index - 1]] = [newOrdered[index - 1], newOrdered[index]];
    setOrderedItems(newOrdered);
    onAnswerChange(newOrdered.map((i) => i.id));
  };

  const handleMoveDown = (index: number) => {
    if (index === orderedItems.length - 1) return;
    const newOrdered = [...orderedItems];
    [newOrdered[index], newOrdered[index + 1]] = [newOrdered[index + 1], newOrdered[index]];
    setOrderedItems(newOrdered);
    onAnswerChange(newOrdered.map((i) => i.id));
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{questionText}</h2>

      <div className="grid grid-cols-2 gap-6">
        {/* Available Items */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Các lựa chọn</h3>
          <div className="space-y-2 border border-gray-300 rounded-lg p-4 bg-gray-50 min-h-64">
            {availableItems.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Tất cả các mục đã được chọn</p>
            ) : (
              availableItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleAddItem(item)}
                  className="w-full p-3 text-left bg-white border border-gray-300 rounded hover:bg-indigo-50 transition"
                >
                  {item.text}
                </button>
              ))
            )}
          </div>
        </div>

        {/* Ordered Items */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-3">Thứ tự của bạn</h3>
          <div className="space-y-2 border border-indigo-300 rounded-lg p-4 bg-indigo-50 min-h-64">
            {orderedItems.length === 0 ? (
              <p className="text-gray-400 text-center py-8">Kéo hoặc nhấp để thêm</p>
            ) : (
              orderedItems.map((item, index) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-white border border-indigo-200 rounded"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <span className="font-bold text-indigo-600 min-w-6">{index + 1}</span>
                    <span className="text-gray-900">{item.text}</span>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                      className="p-1 hover:bg-gray-100 disabled:text-gray-300 text-gray-600 rounded"
                      title="Lên"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => handleMoveDown(index)}
                      disabled={index === orderedItems.length - 1}
                      className="p-1 hover:bg-gray-100 disabled:text-gray-300 text-gray-600 rounded"
                      title="Xuống"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => handleRemoveItem(index)}
                      className="p-1 hover:bg-red-100 text-red-600 rounded"
                      title="Xóa"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
