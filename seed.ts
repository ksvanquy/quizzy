import { connectDB } from './lib/db';
import { User } from './lib/models/User';
import { Category } from './lib/models/Category';
import { Question } from './lib/models/Question';
import { Option } from './lib/models/Option';
import { Quiz } from './lib/models/Quiz';
import { Ordering } from './lib/models/Ordering';
import { Matching } from './lib/models/Matching';
import { FillBlank } from './lib/models/FillBlank';
import { NumericInput } from './lib/models/NumericInput';
import { Attempt } from './lib/models/Attempt';
import { Bookmark } from './lib/models/Bookmark';
import { Watchlist } from './lib/models/Watchlist';
import { hashPassword } from './lib/utils/password';

async function seed() {
  try {
    await connectDB();
    console.log('✓ Connected to database');

    // Clear existing data
    console.log('🗑️  Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Question.deleteMany({});
    await Option.deleteMany({});
    await Quiz.deleteMany({});
    await Ordering.deleteMany({});
    await Matching.deleteMany({});
    await FillBlank.deleteMany({});
    await NumericInput.deleteMany({});
    await Attempt.deleteMany({});
    await Bookmark.deleteMany({});
    await Watchlist.deleteMany({});

    // ==================== USERS ====================
    console.log('👥 Creating users...');
    const users = await User.insertMany([
      {
        username: 'admin',
        email: 'admin@example.com',
        password: await hashPassword('admin123'),
        name: 'Admin User',
        role: 'admin',
      },
      {
        username: 'teacher1',
        email: 'teacher@example.com',
        password: await hashPassword('teacher123'),
        name: 'John Teacher',
        role: 'teacher',
      },
      {
        username: 'student1',
        email: 'student@example.com',
        password: await hashPassword('student123'),
        name: 'Jane Student',
        role: 'student',
      },
    ]);
    console.log(`✓ Created ${users.length} users`);

    // ==================== HIERARCHICAL CATEGORIES ====================
    console.log('📚 Creating hierarchical categories...');
    const categories = await Category.insertMany([
      // Root - Mathematics
      {
        name: 'Mathematics',
        slug: 'mathematics',
        description: 'Math quizzes and tests',
        displayOrder: 1,
        parentId: null,
        icon: '📐',
        isActive: true,
      },
      // Child - Algebra (Mathematics > Algebra)
      {
        name: 'Algebra',
        slug: 'algebra',
        description: 'Algebraic equations and expressions',
        displayOrder: 1,
        parentId: 1, // Reference to Mathematics by displayOrder
        icon: '📊',
        isActive: true,
      },
      // Child - Geometry (Mathematics > Geometry)
      {
        name: 'Geometry',
        slug: 'geometry',
        description: 'Shapes, angles, and space',
        displayOrder: 2,
        parentId: 1,
        icon: '🔺',
        isActive: true,
      },
      // Root - Science
      {
        name: 'Science',
        slug: 'science',
        description: 'Science quizzes and tests',
        displayOrder: 2,
        parentId: null,
        icon: '🔬',
        isActive: true,
      },
      // Child - Physics (Science > Physics)
      {
        name: 'Physics',
        slug: 'physics',
        description: 'Physics concepts and problems',
        displayOrder: 1,
        parentId: 2,
        icon: '⚛️',
        isActive: true,
      },
      // Child - Biology (Science > Biology)
      {
        name: 'Biology',
        slug: 'biology',
        description: 'Biology and life sciences',
        displayOrder: 2,
        parentId: 2,
        icon: '🧬',
        isActive: true,
      },
      // Root - English
      {
        name: 'English',
        slug: 'english',
        description: 'English language quizzes',
        displayOrder: 3,
        parentId: null,
        icon: '🌍',
        isActive: true,
      },
    ]);
    console.log(`✓ Created ${categories.length} categories`);

    // ==================== QUESTIONS & OPTIONS ====================
    console.log('📝 Creating questions and options...');

    // Single Choice Question (Math)
    const q1 = await Question.create({
      text: 'What is 2 + 2?',
      imageUrl: null,
      type: 'single_choice',
      difficulty: 'easy',
      topic: 'Basic Arithmetic',
      categoryId: categories[1]._id, // Algebra
      shuffleOptions: true,
      caseSensitive: false,
      explanation: 'Adding two 2s together gives us 4',
      points: 1,
    });

    const opts1 = await Option.insertMany([
      { text: '3', questionId: q1._id, isCorrect: false, displayOrder: 1 },
      { text: '4', questionId: q1._id, isCorrect: true, displayOrder: 2 },
      { text: '5', questionId: q1._id, isCorrect: false, displayOrder: 3 },
      { text: '6', questionId: q1._id, isCorrect: false, displayOrder: 4 },
    ]);

    await Question.findByIdAndUpdate(q1._id, {
      optionIds: opts1.map(o => o._id),
      correctOptionId: opts1[1]._id,
    });

    // Multiple Choice Question (Physics)
    const q2 = await Question.create({
      text: 'Which of the following are SI base units? (Select all that apply)',
      type: 'multi_choice',
      difficulty: 'medium',
      topic: 'Physics Fundamentals',
      categoryId: categories[4]._id, // Physics
      shuffleOptions: true,
      caseSensitive: false,
      explanation: 'The SI base units are meter (m), kilogram (kg), second (s), ampere (A), kelvin (K), mole (mol), and candela (cd)',
      points: 2,
    });

    const opts2 = await Option.insertMany([
      { text: 'Meter (m)', questionId: q2._id, isCorrect: true, displayOrder: 1 },
      { text: 'Kilogram (kg)', questionId: q2._id, isCorrect: true, displayOrder: 2 },
      { text: 'Watt (W)', questionId: q2._id, isCorrect: false, displayOrder: 3 },
      { text: 'Joule (J)', questionId: q2._id, isCorrect: false, displayOrder: 4 },
    ]);

    await Question.findByIdAndUpdate(q2._id, {
      optionIds: opts2.map(o => o._id),
      correctOptionIds: [opts2[0]._id, opts2[1]._id],
    });

    // True/False Question (Biology)
    const q3 = await Question.create({
      text: 'Mitochondria is the powerhouse of the cell.',
      type: 'true_false',
      difficulty: 'easy',
      topic: 'Cell Biology',
      categoryId: categories[5]._id, // Biology
      shuffleOptions: false,
      caseSensitive: false,
      explanation: 'True - Mitochondria produces ATP through cellular respiration, providing energy for the cell',
      points: 1,
      correctBoolean: true,
    });

    // Fill Blank Question
    const fb1 = await FillBlank.create({
      text: 'The capital of France is _____.',
      difficulty: 'easy',
      topic: 'Geography',
      categoryId: categories[5]._id,
      shuffleLeft: false,
      shuffleRight: false,
      caseSensitive: false,
      explanation: 'Paris is the capital and largest city of France',
      points: 1,
      correctAnswers: ['Paris', 'paris', 'PARIS'],
    });

    // Numeric Input Question
    const ni1 = await NumericInput.create({
      text: 'If a triangle has sides of length 3cm, 4cm, and uses the Pythagorean theorem, what is the hypotenuse in cm?',
      difficulty: 'medium',
      topic: 'Geometry',
      categoryId: categories[2]._id, // Geometry
      explanation: 'Using a² + b² = c², we get 3² + 4² = 9 + 16 = 25, so c = 5',
      points: 2,
      correctNumber: 5,
      tolerance: 0.1,
      unit: 'cm',
    });

    // Ordering Question
    const ord1 = await Ordering.create({
      text: 'Arrange the steps of the scientific method in correct order:',
      difficulty: 'medium',
      topic: 'Research Methods',
      categoryId: categories[4]._id, // Physics
      shuffleItems: true,
      explanation: 'The correct order is: Observation, Question, Hypothesis, Experiment, Analysis, Conclusion',
      points: 3,
      items: [
        { id: '1', text: 'Make an observation', imageUrl: null },
        { id: '2', text: 'Ask a question', imageUrl: null },
        { id: '3', text: 'Form a hypothesis', imageUrl: null },
        { id: '4', text: 'Conduct experiment', imageUrl: null },
        { id: '5', text: 'Analyze data', imageUrl: null },
        { id: '6', text: 'Draw conclusion', imageUrl: null },
      ],
      correctOrder: ['1', '2', '3', '4', '5', '6'],
    });

    // Matching Question
    const match1 = await Matching.create({
      text: 'Match the following biological terms with their definitions:',
      difficulty: 'medium',
      topic: 'Biology Vocabulary',
      categoryId: categories[5]._id, // Biology
      shuffleLeft: true,
      shuffleRight: true,
      explanation: 'These are fundamental biological terms and their correct definitions',
      points: 4,
      leftItems: [
        { id: 'L1', text: 'Photosynthesis', imageUrl: null },
        { id: 'L2', text: 'Osmosis', imageUrl: null },
        { id: 'L3', text: 'Enzyme', imageUrl: null },
        { id: 'L4', text: 'Chlorophyll', imageUrl: null },
      ],
      rightItems: [
        { id: 'R1', text: 'Process of converting light energy to chemical energy', imageUrl: null },
        { id: 'R2', text: 'Movement of water across semipermeable membrane', imageUrl: null },
        { id: 'R3', text: 'Protein that speeds up chemical reactions', imageUrl: null },
        { id: 'R4', text: 'Green pigment found in plants', imageUrl: null },
      ],
      correctPairs: {
        'L1': 'R1',
        'L2': 'R2',
        'L3': 'R3',
        'L4': 'R4',
      },
    });

    console.log('✓ Created 7 questions (6 regular + 1 special type each)');

    // ==================== QUIZZES ====================
    console.log('🎯 Creating quizzes...');

    // Manual selection quiz (specific questions)
    const quiz1 = await Quiz.create({
      title: 'Basic Math Quiz',
      slug: 'basic-math-quiz',
      description: 'Test your basic mathematics skills with fundamental arithmetic problems',
      category: categories[1]._id, // Algebra
      createdBy: users[1]._id, // Teacher
      difficulty: 'easy',
      duration: 10,
      totalPoints: 1,
      passingScore: 1,
      maxAttempts: 0, // Unlimited
      questionIds: [q1._id],
      status: 'active',
      questionSelection: {
        mode: 'manual',
        manualQuestionIds: [q1._id],
      },
      shuffleOptions: true,
      revealAnswersAfterSubmission: true,
      tags: ['math', 'basic', 'arithmetic'],
      isPublished: true,
      totalAttempts: 0,
      averageScore: 0,
    });

    // Random selection quiz (select from topic)
    const quiz2 = await Quiz.create({
      title: 'Physics Fundamentals',
      slug: 'physics-fundamentals',
      description: 'Learn and test your understanding of basic physics concepts',
      category: categories[4]._id, // Physics
      createdBy: users[1]._id,
      difficulty: 'medium',
      duration: 20,
      totalPoints: 2,
      passingScore: 1,
      maxAttempts: 3,
      questionIds: [q2._id],
      status: 'active',
      questionSelection: {
        mode: 'random',
        sourceTopics: ['Physics Fundamentals'],
        randomCounts: {
          easy: 1,
          medium: 1,
          hard: 0,
        },
      },
      shuffleOptions: true,
      revealAnswersAfterSubmission: false,
      tags: ['physics', 'science', 'fundamentals'],
      isPublished: true,
      totalAttempts: 5,
      averageScore: 75.5,
    });

    // Comprehensive quiz with multiple question types
    const quiz3 = await Quiz.create({
      title: 'Comprehensive Biology Test',
      slug: 'comprehensive-biology-test',
      description: 'Complete assessment of biology knowledge covering cells, genetics, and evolution',
      category: categories[5]._id, // Biology
      createdBy: users[1]._id,
      difficulty: 'hard',
      duration: 60,
      totalPoints: 12,
      passingScore: 7,
      maxAttempts: 2,
      questionIds: [q1._id, q2._id, q3._id],
      status: 'active',
      questionSelection: {
        mode: 'manual',
        manualQuestionIds: [q1._id, q2._id, q3._id],
      },
      shuffleOptions: true,
      revealAnswersAfterSubmission: true,
      tags: ['biology', 'comprehensive', 'science'],
      isPublished: true,
      totalAttempts: 12,
      averageScore: 82.3,
    });

    // Advanced quiz with all question types
    const quiz4 = await Quiz.create({
      title: 'Advanced Mixed Question Types',
      slug: 'advanced-mixed-types',
      description: 'Test your knowledge with all 7 question types: Single Choice, Multi Choice, True/False, Fill Blank, Numeric Input, Ordering, and Matching',
      category: categories[5]._id, // Biology
      createdBy: users[1]._id,
      difficulty: 'hard',
      duration: 120,
      totalPoints: 13,
      passingScore: 8,
      maxAttempts: 3,
      questionIds: [q1._id, q2._id, q3._id, fb1._id, ni1._id, ord1._id, match1._id],
      status: 'active',
      questionSelection: {
        mode: 'manual',
        manualQuestionIds: [q1._id, q2._id, q3._id, fb1._id, ni1._id, ord1._id, match1._id],
      },
      shuffleOptions: false,
      revealAnswersAfterSubmission: true,
      tags: ['advanced', 'mixed', 'comprehensive', 'all-types'],
      isPublished: true,
      totalAttempts: 3,
      averageScore: 65.2,
    });
    
    console.log(`✓ Quiz4 saved with ${quiz4.questionIds.length} questions`);

    console.log(`✓ Created 4 quizzes`);

    // ==================== ATTEMPTS (Sample Data) ====================
    console.log('🏆 Creating sample attempts...');

    const attempt1 = await Attempt.create({
      userId: users[2]._id, // Student
      quizId: quiz1._id,
      status: 'submitted',
      startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // 24 hours ago
      submittedAt: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000),
      totalScore: 1,
      isPassed: true,
      answers: [
        {
          questionId: q1._id,
          userAnswer: opts1[1]._id.toString(),
          isCorrect: true,
          pointsEarned: 1,
        },
      ],
    });

    console.log(`✓ Created sample attempt`);

    // ==================== BOOKMARKS ====================
    console.log('🔖 Creating bookmarks...');

    const bookmark1 = await Bookmark.create({
      userId: users[2]._id,
      quizId: quiz1._id,
      createdAt: new Date(),
    });

    console.log(`✓ Created bookmark`);

    // ==================== WATCHLIST ====================
    console.log('👀 Creating watchlist...');

    const watchlist1 = await Watchlist.create({
      userId: users[2]._id,
      quizId: quiz2._id,
      createdAt: new Date(),
    });

    console.log(`✓ Created watchlist`);

    // ==================== SUMMARY ====================
    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   Users: ${users.length}`);
    console.log(`   Categories: ${categories.length} (hierarchical)`);
    console.log(`   Questions: 3 + 4 special types = 7 total`);
    console.log(`   Quizzes: 4 (basic, physics, biology with mixed types, advanced special types)`);
    console.log(`   Attempts: 1`);
    console.log(`   Bookmarks: 1`);
    console.log(`   Watchlist: 1`);
    console.log('\n💡 Test Credentials:');
    console.log(`   Admin:   admin / admin123`);
    console.log(`   Teacher: teacher1 / teacher123`);
    console.log(`   Student: student1 / student123\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
