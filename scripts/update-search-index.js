/**
 * Search Index Generator
 * Parses all HTML files in the project and extracts category cards + sub-items.
 * Output: public/search-index.json
 *
 * Usage: node scripts/update-search-index.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Files to scan for indexable content
const HTML_FILES = [
  path.join(ROOT, 'index.html'),
  path.join(ROOT, 'pages', 'ai-models.html'),
  path.join(ROOT, 'pages', 'brand-guidelines.html')
];

// Output path
const OUTPUT_PATH = path.join(ROOT, 'public', 'search-index.json');

/**
 * Parse a single HTML file and extract searchable items.
 */
function parseHTML(filePath) {
  const html = fs.readFileSync(filePath, 'utf-8');
  const items = [];
  const relPath = '/' + path.relative(ROOT, filePath).replace(/\\/g, '/');

  // Extract category cards
  const cardRegex = /<div\s+class="category-card[^"]*"[^>]*\s+data-category="([^"]*)"\s+data-title-en="([^"]*)"\s+data-title-cn="([^"]*)"\s+data-desc-en="([^"]*)"[^>]*>([\s\S]*?)<\/div>\s*(?=<\/div>\s*$|<div class="sub-panel")/g;

  let match;
  while ((match = cardRegex.exec(html)) !== null) {
    items.push({
      title: match[2],
      description: match[4],
      section: match[1],
      url: match[1] ? `./pages/${match[1]}.html` : relPath,
      icon: extractIcon(match[5]),
      type: match[0].includes('expandable') ? 'expandable' : 'link'
    });
  }

  // Extract sub-items within sub-panels
  const subItemRegex = /<a[^>]+class="sub-item"[^>]*>[\s\S]*?<div class="sub-title" data-en="([^"]*)"[^>]*>[^<]*<\/div>[\s\S]*?<div class="sub-desc" data-en="([^"]*)"[^>]*>[^<]*<\/div>/g;

  while ((match = subItemRegex.exec(html)) !== null) {
    items.push({
      title: match[1],
      description: match[2],
      section: '',
      url: relPath,
      icon: 'fa-link',
      type: 'sub-item'
    });
  }

  return items;
}

/**
 * Extract the Font Awesome icon name from a card's inner HTML.
 */
function extractIcon(html) {
  const iconMatch = html.match(/class="fas fa-(\S+?)"/);
  return iconMatch ? `fa-${iconMatch[1]}` : 'fa-folder';
}

/**
 * Main: scan all files, deduplicate, and write JSON.
 */
function main() {
  console.log('🔍 Building search index...\n');

  let allItems = [];

  for (const filePath of HTML_FILES) {
    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  Skipping (not found): ${path.relative(ROOT, filePath)}`);
      continue;
    }
    const items = parseHTML(filePath);
    allItems.push(...items);
    console.log(`✅ ${items.length} items from ${path.relative(ROOT, filePath)}`);
  }

  // Deduplicate by title + section key
  const seen = new Set();
  allItems = allItems.filter(item => {
    const key = `${item.title}|${item.section}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Ensure output directory exists
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(allItems, null, 2), 'utf-8');

  console.log(`\n✅ Done! ${allItems.length} total items → ${path.relative(ROOT, OUTPUT_PATH)}`);
}

main();
