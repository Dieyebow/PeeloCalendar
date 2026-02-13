const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

let uri;

if (isProduction) {
    // Production Configuration (DigitalOcean)
    const MONGO_USERNAME = 'PeeloAdmin';
    const MONGO_PASSWORD = '794pNKg3O0Ef51x8';
    const DATABASE_NAME = 'peelo';
    
    uri = process.env.MONGODB_URI || `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@peelo-ee003264.mongo.ondigitalocean.com/${DATABASE_NAME}?replicaSet=${DATABASE_NAME}&tls=true&authSource=admin`;
} else {
    // Local Development Configuration
    uri = 'mongodb://localhost:27017/peelo';
}

exports.uri = uri; 