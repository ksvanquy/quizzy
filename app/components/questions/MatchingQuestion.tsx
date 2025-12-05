'use client';

import { useState, useEffect } from 'react';

interface MatchingItem {
  id: string;
  text: string;
  imageUrl?: string;
}

interface MatchingQuestionProps {
  questionText: string;
  leftItems: MatchingItem[];
  rightItems: MatchingItem[];
  selectedAnswers: Record<string, string> | undefined;
  onAnswerChange: (pairs: Record<string, string>) => void;
}

export default function MatchingQuestion({
  questionText,
  leftItems,
  rightItems,
  selectedAnswers,
  onAnswerChange,
}: MatchingQuestionProps) {
  const [pairs, setPairs] = useState<Record<string, string>>(selectedAnswers || {});

  const handlePair = (leftId: string, rightId: string | null) => {
    const newPairs = { ...pairs };
    if (rightId === null) {
      delete newPairs[leftId];
    } else {
      newPairs[leftId] = rightId;
    }
    setPairs(newPairs);
    onAnswerChange(newPairs);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{questionText}</h2>

      <div className="space-y-3">
        {leftItems.map((leftItem) => (
          <div key={leftItem.id} className="flex gap-4 items-center">
            <div className="flex-1 p-3 bg-gray-100 rounded-lg border border-gray-300">
              <p className="font-medium text-gray-900">{leftItem.text}</p>
            </div>

            <select
              value={pairs[leftItem.id] || ''}
              onChange={(e) => handlePair(leftItem.id, e.target.value || null)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="">-- Chọn đáp án --</option>
              {rightItems.map((rightItem) => (
                <option key={rightItem.id} value={rightItem.id}>
                  {rightItem.text}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Show matches preview */}
      {Object.keys(pairs).length > 0 && (
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-semibold text-blue-900 mb-2">Các ghép cặp của bạn:</p>
          <ul className="text-sm text-blue-800 space-y-1">
            {Object.entries(pairs).map(([leftId, rightId]) => (
              <li key={leftId}>
                {leftItems.find((i) => i.id === leftId)?.text} →{' '}
                {rightItems.find((i) => i.id === rightId)?.text}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
