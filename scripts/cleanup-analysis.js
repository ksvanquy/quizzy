#!/usr/bin/env node

/**
 * Phase 10 Cleanup & Import Validation Script
 * Identifies duplicate code, old imports, and files for cleanup
 */

const fs = require('fs');
const path = require('path');

interface FileAnalysis {
  path: string;
  imports: string[];
  duplicates: string[];
  oldPatterns: string[];
}

const issues: {
  oldImports: Map<string, string[]>;
  duplicatePatterns: Map<string, number>;
  filesToRemove: string[];
} = {
  oldImports: new Map(),
  duplicatePatterns: new Map(),
  filesToRemove: [],
};

// Patterns to find and their replacements
const importPatterns = [
  {
    old: /from\s+['"]@\/lib\/client\/api['"]/g,
    new: "from '@/lib/client/api-services'",
    description: 'Old API file import',
  },
  {
    old: /from\s+['"]@\/hooks\/use/g,
    new: "from '@/lib/client/hooks'",
    description: 'Old hooks import',
  },
  {
    old: /from\s+['"]@\/utils\//g,
    new: "from '@/lib/client/utils'",
    description: 'Old utils import',
  },
];

// Duplicate code patterns to search for
const duplicatePatterns = [
  {
    pattern: /async\s+\w+\(.*\)\s*{[\s\S]*?try\s*{[\s\S]*?const\s+response/g,
    name: 'HTTP request try-catch pattern',
  },
  {
    pattern: /const\s+\[loading,\s*setLoading\][\s\S]*?useEffect/g,
    name: 'Loading state + useEffect pattern',
  },
  {
    pattern: /interface\s+\w*Response.*{[\s\S]*?success[\s\S]*?data/g,
    name: 'Response interface pattern',
  },
];

function scanDirectory(dir: string, ext: string[]): string[] {
  let files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') {
      continue;
    }

    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files = [...files, ...scanDirectory(fullPath, ext)];
    } else if (ext.some((e) => entry.name.endsWith(e))) {
      files.push(fullPath);
    }
  }

  return files;
}

function analyzeFile(filePath: string): FileAnalysis {
  const content = fs.readFileSync(filePath, 'utf-8');

  const imports: string[] = [];
  const duplicates: string[] = [];
  const oldPatterns: string[] = [];

  // Find all imports
  const importMatches = content.match(/import\s+.*from\s+['"][^'"]+['"]/g) || [];
  imports.push(...importMatches);

  // Check for old import patterns
  for (const pattern of importPatterns) {
    if (pattern.old.test(content)) {
      oldPatterns.push(pattern.description);
    }
  }

  // Check for duplicate patterns
  for (const dup of duplicatePatterns) {
    const matches = content.match(dup.pattern) || [];
    if (matches.length > 1) {
      duplicates.push(`${dup.name} (${matches.length} occurrences)`);
    }
  }

  return { path: filePath, imports, duplicates, oldPatterns };
}

console.log('🔍 Phase 10 Cleanup Analysis\n');
console.log('═'.repeat(60));

// Scan TypeScript/TSX files
console.log('\n📂 Scanning TypeScript files...\n');

const appFiles = scanDirectory('app', ['.ts', '.tsx']);
const libFiles = scanDirectory('lib', ['.ts', '.tsx']);
const srcFiles = scanDirectory('src', ['.ts']);

const allFiles = [...appFiles, ...libFiles, ...srcFiles];

let totalOldImports = 0;
let totalDuplicates = 0;

for (const file of allFiles) {
  const analysis = analyzeFile(file);

  if (analysis.oldPatterns.length > 0) {
    totalOldImports++;
    issues.oldImports.set(file, analysis.oldPatterns);
  }

  if (analysis.duplicates.length > 0) {
    totalDuplicates++;
    for (const dup of analysis.duplicates) {
      const current = issues.duplicatePatterns.get(dup) || 0;
      issues.duplicatePatterns.set(dup, current + 1);
    }
  }
}

// Report old imports
console.log(`🔴 OLD IMPORTS FOUND: ${totalOldImports} files\n`);

for (const [file, patterns] of issues.oldImports) {
  console.log(`  📄 ${file}`);
  for (const pattern of patterns) {
    console.log(`     └─ ${pattern}`);
  }
}

// Report duplicate code
console.log(`\n🟡 DUPLICATE CODE PATTERNS: ${totalDuplicates} files\n`);

for (const [pattern, count] of issues.duplicatePatterns) {
  console.log(`  ⚠️  ${pattern}`);
  console.log(`     Found in ${count} files`);
}

// Check for old files
console.log(`\n🗑️  CLEANUP OPPORTUNITIES\n`);

const possibleOldFiles = [
  'lib/client/api.ts',
  'lib/client/api.old.ts',
  'lib/old-hooks/',
  'lib/old-utils/',
  'hooks/',
  'utils/',
];

for (const file of possibleOldFiles) {
  if (fs.existsSync(file)) {
    console.log(`  🗑️  ${file} (candidate for removal)`);
    issues.filesToRemove.push(file);
  }
}

// Summary
console.log(`\n${'═'.repeat(60)}`);
console.log('\n📊 SUMMARY\n');
console.log(`   Total files scanned: ${allFiles.length}`);
console.log(`   Files with old imports: ${totalOldImports}`);
console.log(`   Files with duplicate patterns: ${totalDuplicates}`);
console.log(`   Candidate files for removal: ${issues.filesToRemove.length}`);

// Recommendations
console.log(`\n💡 RECOMMENDATIONS\n`);
console.log(`   1. Update ${totalOldImports} files with old imports`);
console.log(`   2. Review and consolidate ${totalDuplicates} files`);
console.log(`   3. Remove ${issues.filesToRemove.length} old files after verification`);
console.log(`   4. Run "npm test" to verify all tests pass`);
console.log(`   5. Run "npx eslint ." to check code quality`);

// Success exit
console.log(`\n✅ Analysis complete!\n`);
