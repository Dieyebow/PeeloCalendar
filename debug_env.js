const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

console.log('--- DEBUG ENVIRONMENT VARIABLES ---');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('BASE_URL:', process.env.BASE_URL);
console.log('PORT:', process.env.PORT);
console.log('--- END DEBUG ---');
