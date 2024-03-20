
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectID;

let _ = require("lodash");
const {
    find
} = require("lodash")

let config = require("./../configs/mongodb");




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
            if (delOK) console.log("Collection deleted");
        });
    return resultbi;

}

//countAutoEcole
async function countElements(database, table, client, data = null) {
    const count = await client.db(database).collection(table).countDocuments(data);
    console.log(` Nombre d'éléments dans le document : ${count}`);
    return count;
}


async function deleteOne(database, table, client, id1) {

    return await client
        .db(database)
        .collection(table)
        .deleteOne(id1);
    return resultbi
}




async function findBy(database, table, client, id1) {
    var mysort = {
        _id: -1
    };
    var resultbi = await client
        .db(database)
        .collection(table)
        .find(id1)
        .sort(mysort);
    const rak = await resultbi.toArray();
    return rak;
}


async function updatElement(database, table, client, condition, newListing) {

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

async function createElement(database, table, client, newListing) {

    newListing.created_at = new Date(),
        newListing.update_date = new Date()

    const result = await client
        .db(database)
        .collection(table)
        .insertOne(newListing);
    console.log(
        `New listing created with the following createMeme =>  id: ${result.insertedId}`
    );
    return result;
}


async function findbyaggreate(database, table, client, aggregateit) {

    var resultbi = await client
        .db(database)
        .collection(table)
        .aggregate(aggregateit)
    const rak = await resultbi.toArray();

    return rak;
}





class Mongobot {

    constructor() {
        this.client = null
    }


    connect() {
        return new Promise((resolve, reject) => {
            if (this.client !== null) {
                console.log('Using existing connection');
                resolve(this.client);
                return;
            }

            console.log('config.uri', config.uri);
            MongoClient.connect(config.uri, (err, result) => {
                if (err) {
                    reject(new Error(err));
                } else {
                    console.log('New connection created');
                    this.client = result;
                    resolve(result);
                }
            });
        });
    }

    disconnect() {
        return this.client.close();
    }

    findUser(params) {
        return findBy("peelo", "autoecole_user", this.client, params);
    }
    findAutoEcole(params) {

        return findBy("peelo", "autoecoles", this.client, params);

    }
    createAutoEcole(userData) {
        return createElement("peelo", "autoecoles", this.client, userData);

    }

    countAllAutoEcole() {
        return countElements("peelo", "autoecoles", this.client)
    }

    countAutoEcole(data = null) {
        return countElements("peelo", "autoecoles", this.client, data)
    }

    countQuizz(data = null) {
        return countElements("peelo", "autoecoles_quizz", this.client, data)

    }

    countElevesAutoEcole(data = null) {
        console.log('countAllAutoEcole')
        return countElements("peelo", "autoecoles_current_user", this.client, data)
    }

    listAutoEcole(params) {
        return findBy("peelo", "autoecoles", this.client, params);
    }

    listQuizz(data = null) {
        return findBy("peelo", "autoecoles_quizz", this.client, data);
    }



    findAutoEcoleStudent(params) {

        return findBy("peelo", "autoecoles_current_user", this.client, params);

    }

    createAutoEcoleStudent(userData) {
        return createElement("peelo", "autoecoles_current_user", this.client, userData);
    }

    createQuizz(userData) {
        return createElement("peelo", "autoecoles_quizz", this.client, userData)
    }

    addQuestionToQuizz(idquizz, newQuestion) {
        return updatElement("peelo", "autoecoles_quizz", this.client, { _id: ObjectId(idquizz) }, { $push: { "list_quizz": newQuestion } })
    }





    async updateQuestionToQuizz(idquizz, keyquizz, newQuestion) {

        let question = await findBy("peelo", "autoecoles_quizz", this.client, { _id: ObjectId(idquizz) });

        if (question.length) {
            let list_quizz = question[0]['list_quizz'];
            let oldQuestion = list_quizz[keyquizz];

            oldQuestion.buttons = newQuestion.buttons;
            oldQuestion.text = newQuestion.text;
            oldQuestion.textAnswer = newQuestion.textAnswer

            if (newQuestion.hasOwnProperty('image')) {
                oldQuestion.image = newQuestion.image;
            }

            if (newQuestion.hasOwnProperty('audio')) {
                oldQuestion.audio = newQuestion.audio;
            }

            if (newQuestion.hasOwnProperty('audioanswer')) {
                oldQuestion.answer.audio = newQuestion.audioanswer;
            }
            return updatElement("peelo", "autoecoles_quizz", this.client, { _id: ObjectId(idquizz) }, { $set: { [`list_quizz.${keyquizz}`]: oldQuestion } });
        }

    }

    findLiteListQuizz() {
        var aggregate = [
            {
                $addFields: {
                    number_quizz: { $size: "$list_quizz" }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    number_quizz: 1
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 10 }
        ];

        return findbyaggreate("peelo", "autoecoles_quizz", this.client, aggregate)
        //return findBy("peelo", "VARIABLES_VALUE", this.client, datas)
    }



}






module.exports = new Mongobot();