import { Schema, model, models, Document, Types } from 'mongoose';

export interface IQuestionSchema extends Document {
  _id: Types.ObjectId;
  text: string;
  type:
    | 'single_choice'
    | 'multiple_choice'
    | 'true_false'
    | 'fill_blank'
    | 'cloze_test'
    | 'numeric_input'
    | 'ordering'
    | 'matching';
  difficulty: 'easy' | 'medium' | 'hard';
  points: number;
  explanation?: string;
  categoryIds: Types.ObjectId[];
  tags: string[];

  // single_choice & multiple_choice
  options?: Array<{ id: string; text: string; imageUrl?: string }>;
  correctOptionId?: string;
  correctOptionIds?: string[];

  // true_false
  correctAnswer?: boolean;

  // fill_blank & cloze_test
  blanks?: string[];
  passage?: string;
  acceptPartialCredit?: boolean;

  // numeric_input
  correctNumber?: number;
  tolerance?: number;

  // ordering
  items?: string[];
  correctOrder?: number[];

  // matching
  pairs?: Array<{ left: string; right: string }>;

  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestionSchema>(
  {
    text: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        'single_choice',
        'multiple_choice',
        'true_false',
        'fill_blank',
        'cloze_test',
        'numeric_input',
        'ordering',
        'matching',
      ],
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    points: {
      type: Number,
      default: 1,
      min: 0,
    },
    explanation: {
      type: String,
      default: null,
    },
    categoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // single_choice & multiple_choice
    options: [
      {
        id: String,
        text: String,
        imageUrl: String,
      },
    ],
    correctOptionId: String,
    correctOptionIds: [String],

    // true_false
    correctAnswer: Boolean,

    // fill_blank & cloze_test
    blanks: [String],
    passage: String,
    acceptPartialCredit: Boolean,

    // numeric_input
    correctNumber: Number,
    tolerance: Number,

    // ordering
    items: [String],
    correctOrder: [Number],

    // matching
    pairs: [
      {
        left: String,
        right: String,
      },
    ],
  },
  {
    timestamps: true,
    collection: 'questions',
    strict: 'throw', // Ensure only defined fields are stored
  }
);

// Indexes for performance
questionSchema.index({ type: 1, difficulty: 1 });
questionSchema.index({ categoryIds: 1 });
questionSchema.index({ tags: 1 });

export const QuestionModel = models.Question || model<IQuestionSchema>('Question', questionSchema);
export { questionSchema };
