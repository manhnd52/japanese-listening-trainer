#!/usr/bin/env node

/**
 * Fix imports in compiled JS files
 * Replace .ts extensions with .js in import statements
 */

import { readdir, readFile, writeFile } from 'fs/promises';
import { join, extname } from 'path';

async function fixImportsInFile(filePath) {
  try {
    let content = await readFile(filePath, 'utf-8');
    let modified = false;
    
    // Replace imports with .ts extension to .js
    const newContent = content.replace(/from\s+["']([^"']+)\.ts["']/g, (match, p1) => {
      modified = true;
      return `from "${p1}.js"`;
    });
    
    if (modified) {
      await writeFile(filePath, newContent, 'utf-8');
      console.log(`Fixed: ${filePath}`);
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error.message);
  }
}

async function walkDirectory(dir) {
  const files = await readdir(dir, { withFileTypes: true });
  
  for (const file of files) {
    const fullPath = join(dir, file.name);
    
    if (file.isDirectory()) {
      await walkDirectory(fullPath);
    } else if (extname(file.name) === '.js') {
      await fixImportsInFile(fullPath);
    }
  }
}

async function main() {
  const distPath = join(process.cwd(), 'dist');
  console.log('Fixing imports in compiled files...');
  await walkDirectory(distPath);
  console.log('Done!');
}

main().catch(console.error);
