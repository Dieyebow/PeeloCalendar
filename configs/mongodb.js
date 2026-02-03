const path = require('path')

// --- ANCIENNE BASE DE DONNEES (DOWN) ---
 const MONGO_USERNAME =  'PeeloAdmin'
 const MONGO_PASSWORD =   '794pNKg3O0Ef51x8'//'ZidicusZulzorAnd3r'
 const DATABASE_NAME  =  'peelo'
 exports.uri = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@peelo-ee003264.mongo.ondigitalocean.com/${DATABASE_NAME}?replicaSet=${DATABASE_NAME}&tls=true&authSource=admin`

  
 /*
const MONGO_USERNAME =  'PeeloAdmin'
const MONGO_PASSWORD =   'ZidicusZulzorAnd3r'//'ZidicusZulzorAnd3r'
const DATABASE_NAME  =  'peelo'

exports.uri = 'mongodb://'+MONGO_USERNAME+':'+MONGO_PASSWORD+'@ec2-18-119-60-110.us-east-2.compute.amazonaws.com:27017/'+DATABASE_NAME;

*/
 