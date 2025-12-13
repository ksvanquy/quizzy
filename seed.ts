import mongoose, { Schema } from 'mongoose';

/**
 * Seed Database with Sample Data
 * Creates initial data for testing and development using Mongoose models directly
 */

// Define schemas
const CategorySchema = new Schema({
  _id: String,
  name: String,
  slug: String,
  description: String,
  createdAt: Date,
});

const UserSchema = new Schema({
  _id: String,
  username: String,
  email: String,
  password: String,
  name: String,
  role: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
});

const QuestionSchema = new Schema({
  _id: String,
  text: String,
  type: String,
  difficulty: String,
  points: Number,
  explanation: String,
  categoryIds: [String],
  tags: [String],
  correctOptionId: String,
  correctOptionIds: [String],
  optionIds: [String],
  createdAt: Date,
  updatedAt: Date,
});

const QuizSchema = new Schema({
  _id: String,
  title: String,
  slug: String,
  description: String,
  categoryId: String,
  createdById: String,
  difficulty: String,
  duration: Number,
  totalPoints: Number,
  passingScore: Number,
  status: String,
  maxAttempts: Number,
  questionIds: [String],
  shuffleQuestions: Boolean,
  shuffleOptions: Boolean,
  revealAnswersAfterSubmission: Boolean,
  tags: [String],
  totalAttempts: Number,
  averageScore: Number,
  createdAt: Date,
  updatedAt: Date,
});

// Create models
const Category = mongoose.model('Category', CategorySchema);
const User = mongoose.model('User', UserSchema);
const Question = mongoose.model('Question', QuestionSchema);
const Quiz = mongoose.model('Quiz', QuizSchema);

async function connectDB() {
  const mongoUri = process.env.DATABASE_URL || 'mongodb://localhost:27017/quizzy';
  await mongoose.connect(mongoUri);
  console.log('✓ Connected to database');
}

async function seed() {
  try {
    await connectDB();

    // Clear existing data
    console.log('\n🗑️  Clearing existing data...');
    await Category.deleteMany({});
    await User.deleteMany({});
    await Question.deleteMany({});
    await Quiz.deleteMany({});
    console.log('✓ Cleared');

    console.log('\n📂 Seeding categories...');
    const category1 = await Category.create({
      _id: 'cat-1',
      name: 'JavaScript',
      slug: 'javascript',
      description: 'JavaScript programming language',
      createdAt: new Date(),
    });
    const category2 = await Category.create({
      _id: 'cat-2',
      name: 'TypeScript',
      slug: 'typescript',
      description: 'TypeScript programming language',
      createdAt: new Date(),
    });
    console.log('✓ Categories seeded');

    console.log('\n👥 Seeding users...');
    const user = await User.create({
      _id: 'user-1',
      username: 'admin',
      email: 'admin@quizzy.com',
      password: '$2a$10$yhieEaZVJTxMF2PRBVtDAel0fkw9SXLNpZaTkbTSF2bZaoSnd1Nwq', // password: admin123
      name: 'Admin User',
      role: 'admin',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✓ Users seeded');

    console.log('\n📝 Seeding questions...');
    const question1 = await Question.create({
      _id: 'q-1',
      text: 'What is the correct way to declare a variable in JavaScript?',
      type: 'single_choice',
      difficulty: 'easy',
      points: 10,
      explanation: 'let and const are modern ways to declare variables in JavaScript',
      categoryIds: [category1._id],
      tags: ['variables', 'basics'],
      correctOptionId: 'opt-1',
      optionIds: ['opt-1', 'opt-2', 'opt-3', 'opt-4'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    const question2 = await Question.create({
      _id: 'q-2',
      text: 'Which of the following are valid TypeScript types?',
      type: 'multiple_choice',
      difficulty: 'medium',
      points: 15,
      explanation: 'TypeScript has many built-in types including string, number, boolean, and more',
      categoryIds: [category2._id],
      tags: ['types', 'typescript'],
      correctOptionIds: ['opt-5', 'opt-6', 'opt-7'],
      optionIds: ['opt-5', 'opt-6', 'opt-7', 'opt-8'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✓ Questions seeded');

    console.log('\n📚 Seeding quizzes...');
    const quiz1 = await Quiz.create({
      _id: 'quiz-1',
      title: 'JavaScript Basics Quiz',
      slug: 'javascript-basics-quiz',
      description: 'Test your knowledge of JavaScript fundamentals',
      categoryId: category1._id,
      createdById: user._id,
      difficulty: 'easy',
      duration: 30,
      totalPoints: 100,
      passingScore: 70,
      status: 'active',
      maxAttempts: 3,
      questionIds: [question1._id],
      shuffleQuestions: false,
      shuffleOptions: true,
      revealAnswersAfterSubmission: true,
      tags: ['javascript', 'basics'],
      totalAttempts: 0,
      averageScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const quiz2 = await Quiz.create({
      _id: 'quiz-2',
      title: 'TypeScript Advanced Quiz',
      slug: 'typescript-advanced-quiz',
      description: 'Advanced TypeScript concepts and patterns',
      categoryId: category2._id,
      createdById: user._id,
      difficulty: 'hard',
      duration: 60,
      totalPoints: 200,
      passingScore: 80,
      status: 'active',
      maxAttempts: 2,
      questionIds: [question2._id],
      shuffleQuestions: true,
      shuffleOptions: true,
      revealAnswersAfterSubmission: false,
      tags: ['typescript', 'advanced'],
      totalAttempts: 0,
      averageScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log('✓ Quizzes seeded');

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\nCreated:`);
    console.log(`  - 2 categories`);
    console.log(`  - 1 user (admin@quizzy.com / admin123)`);
    console.log(`  - 2 questions`);
    console.log(`  - 2 quizzes\n`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
