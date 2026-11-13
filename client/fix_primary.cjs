const fs = require('fs');
const path = require('path');
const dir = './src/pages';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.tsx'));

for (const file of files) {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  content = content.replace(/background:\s*'var\(--primary\)',([^>]*?)color:\s*'var\(--text-main\)'/g, "background: 'var(--primary)',$1color: '#fff'");

  fs.writeFileSync(filePath, content, 'utf8');
}
console.log('Fixed primary buttons');
