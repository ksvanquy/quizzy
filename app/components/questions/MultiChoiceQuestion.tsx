'use client';

interface Option {
  _id: string;
  text: string;
  displayOrder: number;
}

interface MultiChoiceQuestionProps {
  questionText: string;
  options: Option[];
  selectedAnswers: string[];
  onAnswerChange: (values: string[]) => void;
}

export default function MultiChoiceQuestion({
  questionText,
  options,
  selectedAnswers,
  onAnswerChange,
}: MultiChoiceQuestionProps) {
  const handleToggle = (optionId: string) => {
    if (selectedAnswers.includes(optionId)) {
      onAnswerChange(selectedAnswers.filter((id) => id !== optionId));
    } else {
      onAnswerChange([...selectedAnswers, optionId]);
    }
  };

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
              type="checkbox"
              checked={selectedAnswers.includes(option._id)}
              onChange={() => handleToggle(option._id)}
              className="mr-3 w-4 h-4 cursor-pointer"
            />
            <span className="text-gray-900">{option.text}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
