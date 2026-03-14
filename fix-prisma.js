const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');
content = content.replace(/,\s*where:\s*raw\("[^"]+"\)/g, '');
fs.writeFileSync('prisma/schema.prisma', content);
