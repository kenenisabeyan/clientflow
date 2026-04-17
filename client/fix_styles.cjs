const fs = require('fs');
const path = require('path');
const dir = './src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/rgba\(255,255,255,0\.[01][0-9]?\)/g, 'var(--surface-border)');
  content = content.replace(/rgba\(255,\s*255,\s*255,\s*0\.[01][0-9]?\)/g, 'var(--surface-border)');
  content = content.replace(/rgba\(15,23,42,0\.[45]\)/g, 'var(--surface)');
  content = content.replace(/rgba\(15,\s*23,\s*42,\s*0\.[45]\)/g, 'var(--surface)');
  content = content.replace(/color:\s*'(?:#fff|white)'/g, "color: 'var(--text-main)'");
  
  // Revert tooltip text color to white for contrast
  content = content.replace(/contentStyle={{ background: '#1e293b', border: '1px solid var\(--surface-border\)', borderRadius: '8px', color: 'var\(--text-main\)' }}/g, "contentStyle={{ background: '#1e293b', border: '1px solid var(--surface-border)', borderRadius: '8px', color: '#fff' }}");

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('updated pages');
