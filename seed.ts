import { connectDB } from './lib/db';

/**
 * DEPRECATED: seed.ts has been replaced by infrastructure layer
 * 
 * Old models (lib/models/*) have been removed in Phase 10.
 * Use repositories from infrastructure/persistence/*/repository.impl.ts
 */

async function seed() {
  try {
    await connectDB();
    console.log('Connected to database');
    console.log('');
    console.log('NOTICE: seed.ts has been deprecated');
    console.log('Old models (lib/models/*) have been removed.');
    console.log('This is part of Phase 10 - Clean Architecture 4-Layer cleanup.');
    console.log('');
    console.log('For seeding, please use:');
    console.log('1. Repositories from infrastructure layer');
    console.log('2. Services from core modules');
    console.log('3. Or create a dedicated seed service');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seed();
