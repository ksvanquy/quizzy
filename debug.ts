import { connectDB } from './lib/db';
import { Quiz } from './lib/models/Quiz';

async function debug() {
  try {
    await connectDB();
    
    const quiz = await Quiz.findOne({ slug: 'advanced-mixed-types' });
    console.log('Quiz found:', quiz?.title);
    console.log('Question IDs count:', quiz?.questionIds.length);
    console.log('Question IDs:', quiz?.questionIds);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

debug();
