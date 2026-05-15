const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/bg-slate-950/g, 'bg-theme-base')
    .replace(/bg-slate-900/g, 'bg-theme-card')
    .replace(/bg-slate-800/g, 'bg-theme-element')
    .replace(/bg-slate-700/g, 'bg-theme-element-hover')
    
    .replace(/border-slate-950/g, 'border-theme-base')
    .replace(/border-slate-900/g, 'border-theme-card')
    .replace(/border-slate-800/g, 'border-theme-border')
    .replace(/border-slate-700/g, 'border-theme-border-hover')
    .replace(/border-gray-700/g, 'border-theme-border-hover')
    
    .replace(/text-\[#E31C25\]/g, 'text-theme-primary')
    .replace(/bg-\[#E31C25\]\/10/g, 'bg-theme-primary/10')
    .replace(/bg-\[#E31C25\]\/80/g, 'bg-theme-primary/80')
    .replace(/bg-\[#E31C25\]/g, 'bg-theme-primary')
    .replace(/border-\[#E31C25\]/g, 'border-theme-primary')
    
    .replace(/hover:bg-red-700/g, 'hover:bg-theme-primary-hover')
    .replace(/hover:bg-red-600/g, 'hover:bg-theme-primary-hover')
    .replace(/hover:text-\[#E31C25\]/g, 'hover:text-theme-primary')
    .replace(/focus:border-\[#E31C25\]/g, 'focus:border-theme-primary')
    .replace(/accent-\[#E31C25\]/g, 'accent-theme-primary')
    .replace(/selection:bg-\[#E31C25\]/g, 'selection:bg-theme-primary')
    
    // Convert hardcoded chart colors
    .replace(/#E31C25/g, 'var(--theme-primary)')
    
    // If any old hex colors are still around
    .replace(/bg-\[#020617\]/g, 'bg-theme-base')
    .replace(/bg-\[#0f172a\]/g, 'bg-theme-card')
    .replace(/bg-\[#1e293b\]/g, 'bg-theme-element')
    .replace(/bg-\[#334155\]/g, 'bg-theme-element-hover')
    
    .replace(/border-\[#020617\]/g, 'border-theme-base')
    .replace(/border-\[#0f172a\]/g, 'border-theme-card')
    .replace(/border-\[#1e293b\]/g, 'border-theme-border')
    .replace(/border-\[#334155\]/g, 'border-theme-border-hover');

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    // Exclude index.css
    if (fullPath.endsWith('index.css')) continue;

    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

processDirectory('./src');
