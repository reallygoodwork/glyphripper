#!/usr/bin/env node

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../dist');

async function* walk(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  for (const file of files) {
    const res = path.resolve(dir, file.name);
    if (file.isDirectory()) {
      yield* walk(res);
    } else if (file.name.endsWith('.js')) {
      yield res;
    }
  }
}

async function fixImports() {
  for await (const file of walk(distDir)) {
    let content = await fs.readFile(file, 'utf8');

    // Fix relative imports without extensions
    content = content.replace(
      /(from\s+['"])(\.[^'"]*?)(['"])/g,
      (match, start, importPath, end) => {
        // Only add .js if it doesn't already have an extension
        if (!path.extname(importPath)) {
          return `${start}${importPath}.js${end}`;
        }
        return match;
      }
    );

    await fs.writeFile(file, content, 'utf8');
  }
}

fixImports().catch(console.error);