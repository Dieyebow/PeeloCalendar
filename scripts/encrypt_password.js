const crypto = require('crypto');

const ENCRYPTION_KEY = 'mvdbNimbz2i3chIhy4MHaUPRa2PTO4tk'; // La clé que nous avons configurée
const PASSWORD_TO_ENCRYPT = 'liveyourdream';
const IV_LENGTH = 16;

function encrypt(text) {
  let iv = crypto.randomBytes(IV_LENGTH);
  let key = Buffer.from(ENCRYPTION_KEY, 'utf-8');
  let cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

const encryptedPassword = encrypt(PASSWORD_TO_ENCRYPT);

console.log('--- PASSWORD INFO ---');
console.log('Password:', PASSWORD_TO_ENCRYPT);
console.log('Key:', ENCRYPTION_KEY);
console.log('Encrypted String (for MongoDB):');
console.log(encryptedPassword);
console.log('---------------------');
