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
  parentId: Schema.Types.Mixed, // null for parent, or parent category ID for child
  displayOrder: Number,
  isActive: Boolean,
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
    // Parent categories
    const categoryWeb = await Category.create({
      _id: 'cat-web',
      name: 'Web Development',
      slug: 'web-development',
      description: 'Web development technologies',
      parentId: null,
      displayOrder: 1,
      isActive: true,
      createdAt: new Date(),
    });

    const categoryMobile = await Category.create({
      _id: 'cat-mobile',
      name: 'Mobile Development',
      slug: 'mobile-development',
      description: 'Mobile development technologies',
      parentId: null,
      displayOrder: 2,
      isActive: true,
      createdAt: new Date(),
    });

    // Child categories for Web Development
    const categoryJavaScript = await Category.create({
      _id: 'cat-javascript',
      name: 'JavaScript',
      slug: 'javascript',
      description: 'JavaScript programming language',
      parentId: categoryWeb._id,
      displayOrder: 1,
      isActive: true,
      createdAt: new Date(),
    });

    const categoryTypeScript = await Category.create({
      _id: 'cat-typescript',
      name: 'TypeScript',
      slug: 'typescript',
      description: 'TypeScript programming language',
      parentId: categoryWeb._id,
      displayOrder: 2,
      isActive: true,
      createdAt: new Date(),
    });

    const categoryReact = await Category.create({
      _id: 'cat-react',
      name: 'React.js',
      slug: 'reactjs',
      description: 'React JavaScript library',
      parentId: categoryWeb._id,
      displayOrder: 3,
      isActive: true,
      createdAt: new Date(),
    });

    // Child categories for Mobile Development
    const categorySwift = await Category.create({
      _id: 'cat-swift',
      name: 'Swift',
      slug: 'swift',
      description: 'Swift programming for iOS',
      parentId: categoryMobile._id,
      displayOrder: 1,
      isActive: true,
      createdAt: new Date(),
    });

    const categoryKotlin = await Category.create({
      _id: 'cat-kotlin',
      name: 'Kotlin',
      slug: 'kotlin',
      description: 'Kotlin programming for Android',
      parentId: categoryMobile._id,
      displayOrder: 2,
      isActive: true,
      createdAt: new Date(),
    });

    console.log('✓ Categories seeded (1 parent, 2 parents, 5 children)');

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
    const q1 = await Question.create({
      _id: 'q-1',
      text: 'What is the correct way to declare a variable in JavaScript?',
      type: 'single_choice',
      difficulty: 'easy',
      points: 10,
      explanation: 'let and const are modern ways to declare variables in JavaScript',
      categoryIds: [categoryJavaScript._id],
      tags: ['variables', 'basics'],
      correctOptionId: 'opt-1',
      optionIds: ['opt-1', 'opt-2', 'opt-3', 'opt-4'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    
    const q2 = await Question.create({
      _id: 'q-2',
      text: 'Which of the following are valid TypeScript types?',
      type: 'multiple_choice',
      difficulty: 'medium',
      points: 15,
      explanation: 'TypeScript has many built-in types including string, number, boolean, and more',
      categoryIds: [categoryTypeScript._id],
      tags: ['types', 'typescript'],
      correctOptionIds: ['opt-5', 'opt-6', 'opt-7'],
      optionIds: ['opt-5', 'opt-6', 'opt-7', 'opt-8'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const q3 = await Question.create({
      _id: 'q-3',
      text: 'What is JSX in React?',
      type: 'single_choice',
      difficulty: 'easy',
      points: 10,
      explanation: 'JSX is a syntax extension to JavaScript that looks similar to HTML',
      categoryIds: [categoryReact._id],
      tags: ['jsx', 'react'],
      correctOptionId: 'opt-9',
      optionIds: ['opt-9', 'opt-10', 'opt-11', 'opt-12'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const q4 = await Question.create({
      _id: 'q-4',
      text: 'What is Swift primarily used for?',
      type: 'single_choice',
      difficulty: 'easy',
      points: 10,
      explanation: 'Swift is primarily used for iOS app development',
      categoryIds: [categorySwift._id],
      tags: ['ios', 'mobile'],
      correctOptionId: 'opt-13',
      optionIds: ['opt-13', 'opt-14', 'opt-15', 'opt-16'],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✓ Questions seeded (4 questions)');

    console.log('\n📚 Seeding quizzes...');
    const quiz1 = await Quiz.create({
      _id: 'quiz-1',
      title: 'JavaScript Basics Quiz',
      slug: 'javascript-basics-quiz',
      description: 'Test your knowledge of JavaScript fundamentals',
      categoryId: categoryJavaScript._id,
      createdById: user._id,
      difficulty: 'easy',
      duration: 30,
      totalPoints: 100,
      passingScore: 70,
      status: 'active',
      maxAttempts: 3,
      questionIds: [q1._id],
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
      categoryId: categoryTypeScript._id,
      createdById: user._id,
      difficulty: 'hard',
      duration: 60,
      totalPoints: 200,
      passingScore: 80,
      status: 'active',
      maxAttempts: 2,
      questionIds: [q2._id],
      shuffleQuestions: true,
      shuffleOptions: true,
      revealAnswersAfterSubmission: false,
      tags: ['typescript', 'advanced'],
      totalAttempts: 0,
      averageScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const quiz3 = await Quiz.create({
      _id: 'quiz-3',
      title: 'React Essential Quiz',
      slug: 'react-essential-quiz',
      description: 'Learn React fundamentals and best practices',
      categoryId: categoryReact._id,
      createdById: user._id,
      difficulty: 'medium',
      duration: 45,
      totalPoints: 150,
      passingScore: 75,
      status: 'active',
      maxAttempts: 5,
      questionIds: [q3._id],
      shuffleQuestions: false,
      shuffleOptions: true,
      revealAnswersAfterSubmission: true,
      tags: ['react', 'web'],
      totalAttempts: 0,
      averageScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const quiz4 = await Quiz.create({
      _id: 'quiz-4',
      title: 'iOS Swift Quiz',
      slug: 'ios-swift-quiz',
      description: 'Master Swift programming for iOS development',
      categoryId: categorySwift._id,
      createdById: user._id,
      difficulty: 'medium',
      duration: 50,
      totalPoints: 150,
      passingScore: 75,
      status: 'active',
      maxAttempts: 4,
      questionIds: [q4._id],
      shuffleQuestions: true,
      shuffleOptions: true,
      revealAnswersAfterSubmission: true,
      tags: ['swift', 'ios', 'mobile'],
      totalAttempts: 0,
      averageScore: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    console.log('✓ Quizzes seeded (4 quizzes)');

    console.log('\n✅ Database seeding completed successfully!');
    console.log(`\nCreated:`);
    console.log(`  - 7 categories (2 parents + 5 children)`);
    console.log(`  - 1 user (admin@quizzy.com / admin123)`);
    console.log(`  - 4 questions`);
    console.log(`  - 4 quizzes\n`);
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seed();
