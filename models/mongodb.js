 
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

let _ = require("lodash");
const {
    find
} = require("lodash")

let config = require("./../configs/mongodb");

 
 


async function listDatabases(client) {
    const databasesList = await client.db().admin().listDatabases();
    databasesList.databases.forEach((db, i) => {
        console.log("-" + db.name);
    });
}

async function createOrder(database, table, client, newListing) {
    const result = await client
        .db(database)
        .collection(table)
        .insertOne(newListing);
    console.log(
        `New listing created with the following createMeme =>  id: ${result.insertedId}`
    );
    return result;
}





async function findLastBy(database, table, client, id1) {
    var mysort = {
        _id: -1
    };

    //res.write(JSON.stringify({"_idnew Object":{$in: [id1]} }));
    var resultbi = await client
        .db(database)
        .collection(table)
        .find(id1)
        .sort(mysort).limit(1);
    const rak = await resultbi.toArray();

    return rak;
}

async function findBy2(database, table, client, id1, id2) {

    console.log('database == ', database);
    console.log('collections == ', table);

    console.log('comparaison', id1, id2);
    //res.write(JSON.stringify({"_idnew Object":{$in: [id1]} }));
    var resultbi = await client
        .db(database)
        .collection(table)
        .find(id1, id2)
    const rak = await resultbi.toArray();

    return rak;
}

async function dropIt(database, table, client) {

    var resultbi = await client.db(database).collection(table)
        .drop(function (err, delOK) {
            if (err) {
                console.log('Impossible de supprimer');
            }
            //throw err;
            if (delOK) console.log("Collection deleted");
            //db.close();
        });
    /*.collection(table)
    .drop();*/

    return resultbi;

}


async function deleteOne(database, table, client, id1) {


    //res.write(JSON.stringify({"_idnew Object":{$in: [id1]} }));
    return await client
        .db(database)
        .collection(table)
        .deleteOne(id1);

    /*
    .deleteOne(id1, (err, result) => {
       if (err) {
        return err;
      } else {
        return result;
      }
    });*/

    return resultbi

}

async function findBy(database, table, client, id1) {
    var mysort = {
        _id: -1
    };
    /*
    console.log('database == ', database);
    console.log('collections == ', table);
    console.log('comparaison', id1);
    */
    //res.write(JSON.stringify({"_idnew Object":{$in: [id1]} }));
    var resultbi = await client
        .db(database)
        .collection(table)
        .find(id1)
        .sort(mysort);
    const rak = await resultbi.toArray();

    return rak;
}


async function findAnyBlockAsync(database, client, id1) {

    let record;
    var mysort = {
        _id: -1
    };
    try {
        // Search in the "block" document
        record = await await client.db(database).collection('block').find(id1).sort(mysort);
        var rak = await record.toArray();

        if (!rak || Object.keys(rak).length === 0) {
            // Search in the "GET_STARTED" collection
            record = await await client.db(database).collection('GET_STARTED').find(id1).sort(mysort);
            rak = await record.toArray();
        }
    } catch (error) {
        // If not found, search in the "GET_STARTED" document
        console.log('nous avons une erreur inside findAnyBlockAsync in mongodb.js', error)
    }
    return rak;
}


async function findParms(database, table, client, id1, id2) {
    var mysort = {
        _id: -1
    };
    /*
    console.log('database == ', database);
    console.log('collections == ', table);
    console.log('comparaison', id1);
    */
    //res.write(JSON.stringify({"_idnew Object":{$in: [id1]} }));
    var resultbi = await client
        .db(database)
        .collection(table)
        .find(id1, id2)
        .sort(mysort);
    const rak = await resultbi.toArray();

    return rak;
}

async function findAll(database, table, client) {

    var mysort = {
        _id: -1
    };
    /*
    console.log('database == ', database);
    console.log('collections == ', table);
    console.log('comparaison', id1);
    */
    //res.write(JSON.stringify({"_idnew Object":{$in: [id1]} }));
    var resultbi = await client
        .db(database)
        .collection(table)
        .find()
        .sort(mysort);
    const rak = await resultbi.toArray();
    return rak;

}


async function findbyaggreate(database, table, client, aggregateit) {

    var resultbi = await client
        .db(database)
        .collection(table)
        .aggregate(aggregateit)
    const rak = await resultbi.toArray();

    return rak;
}



async function update(database, table, client, condition, newListing) {

    const result = await client
        .db(database)
        .collection(table)
        .updateOne(condition,
            newListing);

    return result;

}



async function updateOrder(database, table, client, condition, newListing) {
    var changement = Object.assign(newListing, {
        $currentDate: {
            update_date: true
        }
    });

    console.log('changement doneee updateOrder', changement);

    const result = await client
        .db(database)
        .collection(table)
        .updateOne(condition,
            changement);
    console.log(
        `New listing created with the following createMeme =>  id: ${result.insertedId}`
    );
    return result;
}


class Mongobot {

    constructor() {
        this.client = null
    }


    connect() {

        return new Promise((resolve, reject) => {
            console.log('config.uri', config.uri);
            MongoClient.connect(config.uri, (err, result) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    this.client = result;
                    resolve(result);
                }
            });
        });

    }


    disconnect(){
        return this.client.close();
     }

    
    findOrCreatetokenCalendarUser(profil, tokens) {
        console.log('findOrCreatetokenCalendarUser(tokens)',tokens);

        return new Promise((resolve, reject) => {
            this.findUserToken({ email: profil.email })
            .then((user) => {
                console.log('User Found',user);
                console.log('condition and chagement ===> ',[{
                    email : user[0]['email']
           },{
            access_token : tokens.access_token,
            refresh_token: tokens.refresh_token
           }]);
           
                if (user.length) {
                   this.updateUserToken({
                            email : user[0]['email']
                   },{
                    access_token : tokens.access_token,
                    refresh_token: tokens.refresh_token
                   })
                    resolve({
                        type: "current_user_updated",
                        datas: user[0]
                    });                   

                } else {
                    console.log('User Created ==>')
                    this.createNewUserToken(profil, tokens).then((newuser) => {
                        this.findUserToken({ email: profil.email })
                            .then((newuserit) => {
                                let params = newuserit[0];
                                Object.assign(params, { _id: newuser.insertedId })
                                resolve({
                                    type: "new_user",
                                    datas: params
                                });
                            })

                    }).catch((error_zer) => {
                        reject(new Error(error_zer));
                    })
                }

            }).catch((error) => {
                //return false;
                reject(new Error(error_zer));
            });

        });

    }

    findUserToken(params) {
        return findBy("peelo", "calendar_chatbot", this.client, params);
    }

    createNewUserToken(profil, token) {
        let datas = {
            idbot: null,
            tel: null,
            idusergoogle: profil.id,
            email: profil.email,
            profil: profil.picture,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            scope: token.scope,
            token_type: token.token_type,
            id_token: token.id_token,
            expiry_date: new Date(token.expiry_date),
            verified_email: profil.verified_email,
            created_at: new Date(),
            update_date: new Date()
        };

        return createOrder("peelo", "calendar_chatbot", this.client, datas);

    }

    updateUserToken(condition,changements){
      
        return update("peelo", 'calendar_chatbot', this.client, condition, { $set: changements });

      }





}
module.exports = new Mongobot();