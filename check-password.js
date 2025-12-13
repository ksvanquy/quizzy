const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/quizzy')
  .then(async () => {
    console.log('Connected to MongoDB');
    
    // Find the admin user
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }), 'users');
    const user = await User.findOne({ email: 'admin@quizzy.com' });
    
    if (!user) {
      console.log('❌ Admin user not found');
      process.exit(1);
    }
    
    console.log('\nUser found:');
    console.log('Email:', user.email);
    console.log('Username:', user.username);
    console.log('Password hash:', user.password);
    
    // Test password comparison
    const testPassword = 'admin123';
    const isMatch = await bcrypt.compare(testPassword, user.password);
    
    console.log('\nPassword test:');
    console.log('Testing password:', testPassword);
    console.log('Match:', isMatch ? '✅ YES' : '❌ NO');
    
    if (!isMatch) {
      // Generate correct hash
      console.log('\nGenerating new hash...');
      const newHash = await bcrypt.hash(testPassword, 10);
      console.log('New hash:', newHash);
      
      // Update user
      await User.updateOne(
        { email: 'admin@quizzy.com' },
        { $set: { password: newHash } }
      );
      console.log('✅ Password updated in database');
    }
    
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
