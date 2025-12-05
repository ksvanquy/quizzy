'use client';

interface Option {
  _id: string;
  text: string;
  displayOrder: number;
}

interface SingleChoiceQuestionProps {
  questionText: string;
  options: Option[];
  selectedAnswer: string | undefined;
  onAnswerChange: (value: string) => void;
}

export default function SingleChoiceQuestion({
  questionText,
  options,
  selectedAnswer,
  onAnswerChange,
}: SingleChoiceQuestionProps) {
  return (
    <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">{questionText}</h2>
      <div className="space-y-3">
        {options.map((option) => (
          <label
            key={option._id}
            className="flex items-center p-4 border border-gray-300 rounded-lg hover:bg-indigo-50 cursor-pointer transition"
          >
            <input
              type="radio"
              name="single-choice"
              value={option._id}
              checked={selectedAnswer === option._id}
              onChange={() => onAnswerChange(option._id)}
              className="mr-3 w-4 h-4 cursor-pointer"
            />
            <span className="text-gray-900">{option.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
