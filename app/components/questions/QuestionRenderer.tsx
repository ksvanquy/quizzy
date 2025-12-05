'use client';

import SingleChoiceQuestion from './SingleChoiceQuestion';
import MultiChoiceQuestion from './MultiChoiceQuestion';
import TrueFalseQuestion from './TrueFalseQuestion';
import FillBlankQuestion from './FillBlankQuestion';
import NumericInputQuestion from './NumericInputQuestion';
import OrderingQuestion from './OrderingQuestion';
import MatchingQuestion from './MatchingQuestion';

interface Option {
  _id: string;
  text: string;
  displayOrder: number;
}

interface OrderItem {
  id: string;
  text: string;
  imageUrl?: string;
}

interface MatchingItem {
  id: string;
  text: string;
  imageUrl?: string;
}

interface QuestionRendererProps {
  question: any;
  selectedAnswer: any;
  onAnswerChange: (value: any) => void;
}

export default function QuestionRenderer({
  question,
  selectedAnswer,
  onAnswerChange,
}: QuestionRendererProps) {
  if (!question) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-gray-500">Đang tải câu hỏi...</p>
      </div>
    );
  }

  // Determine question type
  let questionType = question.type;
  
  // If type is not set, try to infer from question structure
  if (!questionType || questionType === '') {
    if (question.items) {
      questionType = 'ordering';
    } else if (question.leftItems && question.rightItems) {
      questionType = 'matching';
    } else if (question.correctAnswers) {
      questionType = 'fill_blank';
    } else if (question.correctNumber !== undefined) {
      questionType = 'numeric_input';
    } else if (question.correctBoolean !== undefined) {
      questionType = 'true_false';
    } else if (question.correctOptionIds) {
      questionType = 'multi_choice';
    } else {
      questionType = 'single_choice'; // default
    }
  }

  switch (questionType) {
    case 'single_choice':
      return (
        <SingleChoiceQuestion
          questionText={question.text}
          options={question.optionIds || []}
          selectedAnswer={selectedAnswer}
          onAnswerChange={onAnswerChange}
        />
      );

    case 'multi_choice':
      return (
        <MultiChoiceQuestion
          questionText={question.text}
          options={question.optionIds || []}
          selectedAnswers={Array.isArray(selectedAnswer) ? selectedAnswer : []}
          onAnswerChange={onAnswerChange}
        />
      );

    case 'true_false':
      return (
        <TrueFalseQuestion
          questionText={question.text}
          selectedAnswer={selectedAnswer}
          onAnswerChange={onAnswerChange}
        />
      );

    case 'fill_blank':
      return (
        <FillBlankQuestion
          questionText={question.text}
          selectedAnswer={selectedAnswer}
          onAnswerChange={onAnswerChange}
        />
      );

    case 'numeric_input':
      return (
        <NumericInputQuestion
          questionText={question.text}
          unit={question.unit}
          selectedAnswer={selectedAnswer}
          onAnswerChange={onAnswerChange}
        />
      );

    case 'ordering':
      return (
        <OrderingQuestion
          questionText={question.text}
          items={question.items || []}
          selectedAnswer={selectedAnswer}
          onAnswerChange={onAnswerChange}
        />
      );

    case 'matching':
      return (
        <MatchingQuestion
          questionText={question.text}
          leftItems={question.leftItems || []}
          rightItems={question.rightItems || []}
          selectedAnswers={selectedAnswer}
          onAnswerChange={onAnswerChange}
        />
      );

    default:
      return (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800">
            Loại câu hỏi không được hỗ trợ: {question.type}
          </p>
        </div>
      );
  }
}
