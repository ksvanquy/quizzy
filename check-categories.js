const { MongoClient } = require('mongodb');

async function checkCategories() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('quizzy');
    const categories = await db.collection('categories').find({}).toArray();
    
    console.log('\n=== ALL CATEGORIES ===');
    console.log(JSON.stringify(categories, null, 2));
    
    console.log('\n=== PARENT CATEGORIES ===');
    const parents = categories.filter(c => c.parentId === null);
    console.log(parents.map(c => ({ _id: c._id, name: c.name, displayOrder: c.displayOrder, parentId: c.parentId })));
    
    console.log('\n=== CHILD CATEGORIES ===');
    const children = categories.filter(c => c.parentId !== null);
    console.log(children.map(c => ({ _id: c._id, name: c.name, displayOrder: c.displayOrder, parentId: c.parentId })));
    
  } finally {
    await client.close();
  }
}

checkCategories().catch(console.error);
