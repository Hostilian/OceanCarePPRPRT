#!/usr/bin/env node
/**
 * Syncs the static marketing site under `public/` into `docs/` so
 * GitHub Pages can serve the same assets without any extra build step.
 */

const fs = require('fs');
const path = require('path');

const sourceDir = path.resolve(__dirname, '..', 'public');
const targetDir = path.resolve(__dirname, '..', 'docs');

async function emptyDirectory(dir) {
  await fs.promises.rm(dir, { recursive: true, force: true });
  await fs.promises.mkdir(dir, { recursive: true });
}

async function copyDirectory(src, dest) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else if (entry.isSymbolicLink()) {
      const linkTarget = await fs.promises.readlink(srcPath);
      await fs.promises.symlink(linkTarget, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

(async () => {
  try {
    console.log('➡️  Syncing public/ ➜ docs/ for GitHub Pages…');
    await emptyDirectory(targetDir);
    await copyDirectory(sourceDir, targetDir);
    console.log('✅ docs/ is now an exact copy of public/.');
    console.log('📤 Commit the docs/ changes before pushing to GitHub Pages.');
  } catch (error) {
    console.error('❌ Failed to sync docs directory:', error);
    process.exitCode = 1;
  }
})();
