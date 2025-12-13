import { connectDB } from './lib/db';

// DEPRECATED: seed.ts has been replaced by infrastructure layer with repositories
// This file is kept for backward compatibility but no longer actively used.
// Clean Architecture 4-Layer is now in effect (Phase 10 cleanup).
// Old models (lib/models/*) have been removed.
// Use repositories from infrastructure/persistence/*/repository.impl.ts instead.


async function seed() {
  try {
    await connectDB();
    console.log('✓ Connected to database');

    console.log('NOTICE: seed.ts has been deprecated\n');
    console.log('Old models (lib/models/*) have been removed.');
    console.log('This is part of Phase 10 - Clean Architecture 4-Layer cleanup.\n');
    console.log('Clean Architecture 4-Layer Structure:');
    console.log('- DOMAIN LAYER: core/*');
    console.log('- INFRASTRUCTURE LAYER: infrastructure/persistence/*');
    console.log('- APPLICATION LAYER: Services in core/*/service.ts');
    console.log('- PRESENTATION LAYER: app/api and app/(pages)\n');
    console.log('For future seeding, please use:');
    console.log('1. Repositories from infrastructure layer');
    console.log('2. Services from core modules');
    console.log('3. Or dedicated seed service\n');

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

seed();
