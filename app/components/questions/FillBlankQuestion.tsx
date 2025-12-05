'use client';

import { useState } from 'react';

interface FillBlankQuestionProps {
  questionText: string;
  selectedAnswer: string | undefined;
  onAnswerChange: (value: string) => void;
}

export default function FillBlankQuestion({
  questionText,
  selectedAnswer,
  onAnswerChange,
}: FillBlankQuestionProps) {
  const [inputValue, setInputValue] = useState(selectedAnswer || '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputValue(value);
    onAnswerChange(value);
  };

  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{questionText}</h2>
      <div>
        <input
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder="Nhập câu trả lời của bạn..."
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
        />
      </div>
    </div>
  );
}
