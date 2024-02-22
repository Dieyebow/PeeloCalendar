const path = require('path')

const MONGO_USERNAME =  'PeeloAdmin'
const MONGO_PASSWORD =  'ZidicusZulzorAnd3r'
const DATABASE_NAME  =  'peelo'

exports.uri ='mongodb://'+MONGO_USERNAME+':'+MONGO_PASSWORD+'@localhost:27017/'+DATABASE_NAME;

