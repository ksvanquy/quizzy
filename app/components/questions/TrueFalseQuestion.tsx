'use client';

interface TrueFalseQuestionProps {
  questionText: string;
  selectedAnswer: string | undefined;
  onAnswerChange: (value: string) => void;
}

export default function TrueFalseQuestion({
  questionText,
  selectedAnswer,
  onAnswerChange,
}: TrueFalseQuestionProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{questionText}</h2>
      <div className="space-y-3">
        {[
          { label: 'Đúng', value: 'true' },
          { label: 'Sai', value: 'false' },
        ].map(({ label, value }) => (
          <label
            key={value}
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-indigo-50 cursor-pointer transition"
          >
            <input
              type="radio"
              name="true-false"
              value={value}
              checked={selectedAnswer === value}
              onChange={() => onAnswerChange(value)}
              className="mr-3 w-4 h-4 cursor-pointer"
            />
            <span className="text-gray-900 font-medium">{label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
