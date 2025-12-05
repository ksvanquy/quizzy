'use client';

import { useState } from 'react';

interface NumericInputQuestionProps {
  questionText: string;
  unit?: string;
  selectedAnswer: number | undefined;
  onAnswerChange: (value: number) => void;
}

export default function NumericInputQuestion({
  questionText,
  unit,
  selectedAnswer,
  onAnswerChange,
}: NumericInputQuestionProps) {
  const [inputValue, setInputValue] = useState(
    selectedAnswer !== undefined ? selectedAnswer.toString() : ''
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    
    // Convert to number, only update if valid
    if (value === '' || !isNaN(Number(value))) {
      onAnswerChange(value === '' ? 0 : Number(value));
    }
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{questionText}</h2>
      <div className="flex gap-2">
        <input
          type="number"
          value={inputValue}
          onChange={handleChange}
          placeholder="Nhập số..."
          step="any"
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
        />
        {unit && (
          <div className="px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg flex items-center font-medium text-gray-700">
            {unit}
          </div>
        )}
      </div>
    </div>
  );
}
