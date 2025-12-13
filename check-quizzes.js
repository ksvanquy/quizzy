const { MongoClient } = require('mongodb');

async function checkQuizzes() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('quizzy');
    const quizzes = await db.collection('quizzes').find({}).toArray();
    
    console.log('\n=== QUIZZES WITH CATEGORIES ===');
    quizzes.forEach(q => {
      console.log({
        _id: q._id,
        title: q.title,
        category: q.category
      });
    });
    
    console.log('\n=== CATEGORY COUNTS ===');
    const counts = {};
    quizzes.forEach(q => {
      const cat = q.category || 'null';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    console.log(counts);
    
  } finally {
    await client.close();
  }
}

checkQuizzes().catch(console.error);
