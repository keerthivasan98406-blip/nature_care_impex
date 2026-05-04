const fs = require('fs');
const path = require('path');
const content = fs.readFileSync(path.join(__dirname, '..', 'server', 'routes', 'products.js'), 'utf8');
console.log(content);
