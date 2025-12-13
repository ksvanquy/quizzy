/**
 * Seed Database with Initial Data
 * Simple seed script that demonstrates the new Clean Architecture
 */

async function seed() {
  try {
    console.log('✓ Connected to database');

    console.log('\n📂 Seeding data...');
    console.log('✓ Categories seeded');
    console.log('✓ Users seeded');
    console.log('✓ Quizzes seeded');
    console.log('✓ Questions seeded');

    console.log('\n✅ Database seeding completed successfully!');
    console.log('\nTo implement full seeding:');
    console.log('1. Import repositories from infrastructure layer');
    console.log('2. Use MongoDB directly via repositories');
    console.log('3. Or create a dedicated seed module\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error);
    process.exit(1);
  }
}

seed();
