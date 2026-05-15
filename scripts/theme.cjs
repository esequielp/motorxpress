const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content
    .replace(/bg-\[#0A0A0C\]/g, 'bg-slate-950')
    .replace(/bg-\[#18181C\]/g, 'bg-slate-900')
    .replace(/bg-\[#1F1F24\]/g, 'bg-slate-800')
    .replace(/bg-\[#2A2A32\]/g, 'bg-slate-700')
    .replace(/border-\[#0A0A0C\]/g, 'border-slate-950')
    .replace(/border-\[#18181C\]/g, 'border-slate-900')
    .replace(/border-\[#1F1F24\]/g, 'border-slate-800')
    .replace(/border-\[#2A2A32\]/g, 'border-slate-700')
    .replace(/#0A0A0C/g, '#020617')
    .replace(/#18181C/g, '#0f172a')
    .replace(/#1F1F24/g, '#1e293b')
    .replace(/#2A2A32/g, '#334155');
    
  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      processDirectory(fullPath);
    } else if (entry.name.endsWith('.tsx') || entry.name.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

processDirectory('./src');
