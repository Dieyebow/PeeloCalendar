const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const isProduction = process.env.NODE_ENV === 'production';

// --- ANCIENNE BASE DE DONNEES ET BASE ACTUELLE (AVEC FALLBACK) ---
const MONGO_USERNAME = 'PeeloAdmin';
const MONGO_PASSWORD = '794pNKg3O0Ef51x8';
const MONGO_PASSWORD_BACKUP = 'ZidicusZulzorAnd3r';
const DATABASE_NAME = 'peelo';

if (isProduction) {
    // On définit un tableau de serveurs par ordre de priorité
    exports.DB_SERVERS = [
        process.env.MONGODB_URI || `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@peelo-ee003264.mongo.ondigitalocean.com/${DATABASE_NAME}?replicaSet=${DATABASE_NAME}&tls=true&authSource=admin`,
        `mongodb://${MONGO_USERNAME}:${MONGO_PASSWORD_BACKUP}@ec2-18-119-60-110.us-east-2.compute.amazonaws.com:27017/${DATABASE_NAME}`
    ];
} else {
    exports.DB_SERVERS = [
        'mongodb://localhost:27017/peelo'
    ];
}

// On garde l'export uri sur le serveur principal par mesure de rétrocompatibilité (si utilisé ailleurs)
exports.uri = exports.DB_SERVERS[0];