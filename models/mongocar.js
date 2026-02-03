
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


async function findByPagination(database, table, client, id1, skipy, limit) {

    var resultbi = await client
    .db(database)
    .collection(table)
    .find(id1).sort({ created_at: -1 }).skip(skipy)
    .limit(limit);

const rak = await resultbi.toArray();
return rak;

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


async function findLastOne(database, table, client, id1) {
    var mysort = {
        _id: -1
    };
    var resultbi = await client
        .db(database)
        .collection(table)
        .findOne(id1)
        .sort(mysort);
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
  
  

async function updatElement(database, table, client, condition, newListing) {

    var changement = Object.assign(newListing, {
        $currentDate: {
            update_date: true
        }
    });
    console.log(' => condition', condition);

    console.log(' => changement doneee updateOrder', changement);

    const result = await client
        .db(database)
        .collection(table)
        .updateOne(condition,
            changement);
    console.log(
        `New listing created with the following createMeme =>  id: ${result.insertedId}`
    );
    console.log('result sdfqsdfqdfqdfqdfqdfqsdfqsdfs', result)
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


async function findbyaggreatePagination(database, table, client, aggregateit,skipy,limit) {
  var resultbi = await client
      .db(database)
      .collection(table)
      .aggregate(aggregateit)
      .skip(skipy)
      .limit(limit);
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

    createQuizTest(userData) {
        return createElement("peelo", "autoecoles_quizz_test", this.client, userData);

    } 

    getLastTestRecord(params) {
        return findLastBy("peelo", "autoecoles_quizz_test", this.client, params);
    }

    findTestRecordCurrent(params) {
        return findBy("peelo", "autoecoles_quizz_test", this.client, params);
    }


     async pushAnswerToTest(lastRecord, answer) {
       console.log('pushAnswerToTest :::::> lastRecord', lastRecord, 'answer', answer);
        const pushIT = { $push: { answers: answer } } ;
        if (answer.answer === 'true') {
            pushIT.$inc = { score: 1 };
        }
        const condition = { _id: ObjectId(lastRecord._id) };
        const newupdated = await updatElement("peelo", "autoecoles_quizz_test", this.client, condition,  pushIT  );
        console.log('newupdated ===>', newupdated);
        return findBy("peelo", "autoecoles_quizz_test", this.client, condition);

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

    numberOfexchangePerUser(paramsit){

      let aggregationExchange = [
        // Match the specific document
        {
          $match:  paramsit 
        },
        // Unwind the flow array to work with individual messages
        {
          $unwind: "$flow"
        },
        // Group by date (converting sent_at to date string)
        {
          $group: {
            _id: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$flow.sent_at"
              }
            },
            count: { $sum: 1 }
          }
        },
        // Sort by date
        {
          $sort: {
            "_id": 1
          }
        }
      ];


      return findbyaggreate("peelo", "DIALOGS", this.client, aggregationExchange);
    }
  

    numberOfexchangePerDate(idbot,skipy,defaultLimit){

      /*   const aggregationExchange  = [
            {
              // Filtrer les documents pour l'utilisateur spécifique et un idbot spécifique
              $match: {
                "user_phone_number": numberUser,
                "idbot": ObjectId(idbot)
              }
            },
            {
              // Décomposer les éléments du champ "flow"
              $unwind: "$flow"
            },
            {
              // Filtrer uniquement les messages envoyés par l'utilisateur
              $match: {
                "flow.from": "user"
              }
            },
            {
              // Convertir "sent_at" en date sans les heures
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$flow.sent_at"
                  }
                }
              }
            },
            {
              // Grouper par date, idbot et user_phone_number et compter les messages
              $group: {
                _id: {
                  date: "$date",
                  idbot: "$idbot",
                  user_phone_number: "$user_phone_number"
                },
                messageCount: { $sum: 1 }
              }
            },
            {
              // Formater l'affichage des résultats
              $project: {
                _id: 0,
                date: "$_id.date",
                idbot: "$_id.idbot",
                user_phone_number: "$_id.user_phone_number",
                messageCount: "$messageCount"
              }
            },
            {
              // Trier les résultats par date (croissant)
              $sort: { date: 1 }
            }
          ];*/
    
         /* const  aggregationExchange = [
            {
              // Filtrer les documents pour l'utilisateur spécifique et un idbot spécifique
              $match: {
                "idbot": ObjectId(idbot)
              }
            },
            {
              // Décomposer les éléments du champ "flow"
              $unwind: "$flow"
            },
            {
              // Filtrer uniquement les messages envoyés par l'utilisateur
              $match: {
                "flow.from": "user"
              }
            },
            {
              // Convertir "sent_at" en date sans les heures
              $addFields: {
                date: {
                  $dateToString: {
                    format: "%Y-%m-%d",
                    date: "$flow.sent_at"
                  }
                }
              }
            },
            {
              // Grouper par date, idbot et user_phone_number et compter les messages
              $group: {
                _id: {
                  date: "$date",
                  idbot: "$idbot",
                  user_phone_number: "$user_phone_number"
                },
                messageCount: { $sum: 1 }
              }
            },
            {
              // Formater l'affichage des résultats
              $project: {
                _id: 0,
                date: "$_id.date",
                idbot: "$_id.idbot",
                user_phone_number: "$_id.user_phone_number",
                messageCount: "$messageCount"
              }
            },
            {
              // Grouper par user_phone_number pour obtenir le total des messages et les détails des jours actifs
              $group: {
                _id: "$user_phone_number",
                totalMessages: { $sum: "$messageCount" },
                activeDays: {
                  $push: {
                    date: "$date",
                    messageCount: "$messageCount"
                  }
                }
              }
            },
            {
              // Trier par totalMessages en ordre décroissant pour voir les utilisateurs les plus actifs en premier
              $sort: {
                totalMessages: -1
              }
            }
          ];  */
         let aggregationExchange = [
          {
            // Filtrer les documents pour l'utilisateur spécifique et un idbot spécifique
            $match: {
              "idbot": ObjectId(idbot)
            }
          },
          {
            // Décomposer les éléments du champ "flow"
            $unwind: "$flow"
          },
          {
            // Filtrer uniquement les messages envoyés par l'utilisateur
            $match: {
              "flow.from": "user"
            }
          },
          {
            // Convertir "sent_at" en date sans les heures
            $addFields: {
              date: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$flow.sent_at"
                }
              }
            }
          },
          {
            // Grouper par date, idbot et user_phone_number et compter les messages
            $group: {
              _id: {
                date: "$date",
                idbot: "$idbot",
                user_phone_number: "$user_phone_number"
              },
              messageCount: { $sum: 1 }
            }
          },
          {
            // Formater l'affichage des résultats
            $project: {
              _id: 0,
              date: "$_id.date",
              idbot: "$_id.idbot",
              user_phone_number: "$_id.user_phone_number",
              messageCount: "$messageCount"
            }
          },
          {
            // Grouper par user_phone_number pour obtenir le total des messages et les détails des jours actifs
            $group: {
              _id: "$user_phone_number",
              totalMessages: { $sum: "$messageCount" },
              activeDays: {
                $push: {
                  date: "$date",
                  messageCount: "$messageCount"
                }
              }
            }
          },
          {
            // Ajouter une jointure avec autoecoles_current_user
            $lookup: {
              from: "autoecoles_current_user",
              localField: "_id", // Correspond au champ user_phone_number
              foreignField: "tel", // Correspond au champ tel dans autoecoles_current_user
              as: "autoecole_details"
            }
          },
          {
            // Formater les résultats pour inclure les détails des auto-écoles
            $project: {
              _id: 0,
              user_phone_number: "$_id",
              totalMessages: 1,
              activeDays: 1,
              autoecole_details: {
                $arrayElemAt: ["$autoecole_details", 0] // Extraire le premier élément (si plusieurs correspondances)
              }
            }
          },
          {
            // Ajouter les détails des auto-écoles dans le résultat final
            $addFields: {
              fullname: "$autoecole_details.fullname",
              id_autoecole: "$autoecole_details.id_autoecole",
              tel_autoecole: "$autoecole_details.tel_autoecole",
              name_autoecole: "$autoecole_details.name_autoecole"
            }
          },
          {
            // Retirer le champ intermédiaire autoecole_details
            $project: {
              autoecole_details: 0
            }
          },
          {
            // Trier par totalMessages en ordre décroissant pour voir les utilisateurs les plus actifs en premier
            $sort: {
              totalMessages: -1
            }
          }
        ];

        
      // console.log('aggregationExchange ==>',aggregationExchange)
      return findbyaggreatePagination("peelo", "DIALOGS", this.client, aggregationExchange,skipy,defaultLimit);
    }
   
    countDailynewUser(){
     
      let aggregation = [
        {
          $group: {
            _id: {
              year: { $year: "$created_at" },
              month: { $month: "$created_at" },
              day: { $dayOfMonth: "$created_at" }
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: {
                  $dateFromParts: {
                    year: "$_id.year",
                    month: "$_id.month",
                    day: "$_id.day"
                  }
                }
              }
            },
            count: 1
          }
        },
        {
          $sort: { date: 1 }
        }
      ]

      return findbyaggreate("peelo", "autoecoles_current_user", this.client, aggregation);
    }


    countDailyActiveUser(){
      
        const dailyactiveuser =  [
            // Étape 1: Filtrer les documents des 3 derniers jours et pour le chatbot spécifique
            {
              $match: {
                "flow.sent_at": {
                  $gte: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1000)
                },
                "idbot": ObjectId("659816a89f5a6dc6bc104da5")
              }
            },
            // Étape 2: Dégrouper le flux pour avoir un document par message
            {
              $unwind: "$flow"
            },
            // Étape 3: Regrouper par jour et utilisateur
            {
              $group: {
                _id: {
                  date: { $dateToString: { format: "%Y-%m-%d", date: "$flow.sent_at" } },
                  user: "$user_phone_number"
                }
              }
            },
            // Étape 4: Compter les utilisateurs uniques par jour
            {
              $group: {
                _id: "$_id.date",
                activeUsers: { $sum: 1 }
              }
            },
            // Étape 5: Trier par date décroissante
            {
              $sort: { _id: -1 }
            }
          ];

      return findbyaggreate("peelo", "DIALOGS", this.client, dailyactiveuser);

    }

    findDialogOfUser(params){
      return findBy("peelo", "DIALOGS", this.client, params);
    }




    checkEnquete(){

     const biaggregate  = [
      {
        $lookup: {
          from: "VARIABLES_VALUE", // Collection à joindre
          localField: "tel", // Champ de correspondance dans autoecoles_current_user
          foreignField: "infos.tel", // Champ de correspondance dans VARIABLES_VALUE
          as: "variables" // Alias pour les résultats liés
        }
      },
      {
        $addFields: {
          variables_filtered: {
            $filter: {
              input: "$variables", // Filtrer uniquement les variables q1car, q2car, q3car
              as: "variable",
              cond: {
                $in: ["$$variable.idvariable", ["q1car", "q2car", "q3car"]]
              }
            }
          }
        }
      },
      {
        $match: {
          "variables_filtered.idvariable": "q1car" // S'assurer que q1car existe dans variables_filtered
        }
      },
      {
        $project: {
          fullname: 1, // Inclure le nom complet
          tel: 1,      // Inclure le téléphone de l'utilisateur
          name_autoecole: 1, // Inclure le nom de l'auto-école
          "variables_filtered.idvariable": 1, // Inclure les variables correspondantes
          "variables_filtered.value.text.body": 1 // Inclure les valeurs des réponses
        }
      }
    ];

    return findbyaggreate("peelo", "autoecoles_current_user", this.client, biaggregate);
    }

    checkNonSubscribedUser(){

      const aggregation =  [
        {
          $match: {
            idbot: ObjectId("659816a89f5a6dc6bc104da5") // Condition sur idbot
          }
        },
        {
          $lookup: {
            from: "autoecoles_current_user", // Nom de la collection cible
            localField: "tel",              // Champ de la collection `users`
            foreignField: "tel",            // Champ correspondant dans `autoecoles_current_user`
            as: "autoecole_info"            // Alias pour le résultat de la jointure
          }
        },
        {
          $match: {
            autoecole_info: { $size: 0 }    // Filtrer les utilisateurs sans correspondance
          }
        },
        {
          $project: {
            _id: 1,
            full_name: 1,
            tel: 1,
            idbot:1                         // Garder uniquement les champs nécessaires
          }
        }
      ];
      return findbyaggreate("peelo", "users", this.client, aggregation);

    }

    countUserAutoecole(data=null){
        return countElements("peelo", "users", this.client, data)
    }

    countElevesAutoEcole(data = null) {
    
        return countElements("peelo", "autoecoles_current_user", this.client, data)
    }
    countElevesNonPermis(){

  const aggregate  = [
  {
    $match: {
      idvariable: "permis",
      "value.interactive.button_reply.id": "non"
    }
  },
  {
    $group: {
      _id: "$infos.tel",
      count: { $sum: 1 }
    }
  },
  {
    $group: {
      _id: null,
      uniqueCount: { $sum: 1 }
    }
  }
];

return findbyaggreate("peelo", "VARIABLES_VALUE", this.client, aggregate)

    }

    listAutoEcole(params) {
        return findBy("peelo", "autoecoles", this.client, params);
    }

    listQuizz(data = null) {
        return findBy("peelo", "autoecoles_quizz", this.client, data);
    }

    listCourses(data = null) {
        return findBy("peelo", "autoecoles_courses", this.client, data);
    }

    deleteCours(params){
        return deleteOne("peelo", "autoecoles_courses", this.client, params);
    }

    findAutoEcolePagination( skipy, limit, params ){
     
        return findByPagination("peelo", "autoecoles_current_user", this.client ,params ,skipy ,limit);
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

   async createCours(userData) {
        let courses = await createElement("peelo", "autoecoles_courses", this.client, userData)
        return this.listCourses({_id: ObjectId(courses.insertedId)});
    }

    addQuestionToQuizz(idquizz, newQuestion) {
        return updatElement("peelo", "autoecoles_quizz", this.client, { _id: ObjectId(idquizz) }, { $push: { "list_quizz": newQuestion } })
    }

    updateCurrentUser(idEleve,changements){

      return updatElement("peelo", "autoecoles_current_user", this.client, { _id: ObjectId(idEleve) },  { $set: changements } )
    }

    updateCourseSection(cours) {

        console.log(' ===> updateCourseSection', cours)
        //cours._id, cours.Sections
        let idcourse = cours._id;
        delete cours._id;
        console.log('idcourse', idcourse);
        //{ $push: { "Sections": Sections } }
        console.log('after removing', cours);
       
        return updatElement("peelo", "autoecoles_courses", this.client, { _id: ObjectId(idcourse) },  { $set: changements } )
    }

    async udpateCourses(cours) {
        let  conditions = { _id: ObjectId(cours._id) };
        delete cours._id;
         
        return await update("peelo", "autoecoles_courses", this.client, conditions, { $set: cours });
         
    }


    findQuizz(params) {
        return findBy("peelo", "autoecoles_quizz", this.client, params);
    }

    
    finduserSubscribed(){


    }

    findPremiumStudent(monitor_tel){
      
      let params  = { "tel_autoecole": monitor_tel};
      return findBy("peelo", "autoecoles_current_user", this.client, params);
    }

    findNonpermis(){
       // return findBy("peelo", "VARIABLES_VALUE", this.client, params);
        
        var aggregate = [
            {
                $match: {
                  idvariable: "permis",
                  "value.interactive.button_reply.id": "non"
                }
              },
              {
                $project: {
                  _id: 0,
                  "infos.tel": 1
                }
              }
        ];
        
        /*[
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
        ];*/

        return findbyaggreate("peelo", "VARIABLES_VALUE", this.client, aggregate)
        
    
    }




    async updateQuestionToQuizz(idquizz, keyquizz, newQuestion) {

        let question = await findBy("peelo", "autoecoles_quizz", this.client, { _id: ObjectId(idquizz) });

        if (question.length) {
            let list_quizz = question[0]['list_quizz'];
            let oldQuestion = list_quizz[keyquizz];

            oldQuestion.buttons = newQuestion.buttons;
            oldQuestion.text = newQuestion.text;
            oldQuestion.answer.text = newQuestion.answer.text

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
   
    findagregation(aggregate){

    
        return findbyaggreate("peelo", "DIALOGS", this.client, aggregate)

    }


    getDialogFlowSize(botnum, usernum) {
      let aggregate = [
        {
          $match: {
            bot_phone_number: botnum,
            user_phone_number: usernum
          }
        },
        {
          $project: {
            _id: 1,
            bot_name: 1,
            user_full_name: 1,
            idbot: 1,
            bot_phone_number: 1,
            user_phone_number: 1,
            flowCount: { $size: "$flow" }
          }
        }
      ]
      return findbyaggreate("peelo", "DIALOGS", this.client,
        aggregate);
    }


    getValueVariableByName(idbot,iduser,idvariable) {

      let aggregateit = [
        // Filtrer les documents avec idbot, id_user et idvariable spécifiés
        { 
          $match: { 
            "infos.idbot": ObjectId(idbot), 
            "infos.id_user": ObjectId(iduser),
            "idvariable": idvariable
          } 
        },
        // Trier par date de mise à jour (descendant)
        { 
          $sort: { "update_date": -1 } 
        },
        // Grouper par id_user, idvariable et idbot
        { 
          $group: { 
            _id: { 
              id_user: "$infos.id_user", 
              idvariable: "$idvariable", 
              idbot: "$infos.idbot" 
            },
            valueCount: { $sum: 1 }, // Compter les occurrences
            lastValue: { $first: "$value" } // Obtenir la dernière valeur
          } 
        },
        // Grouper par id_user et idbot, et regrouper les variables dans un tableau
        { 
          $group: { 
            _id: { 
              id_user: "$_id.id_user", 
              idbot: "$_id.idbot" 
            },
            variables: { 
              $push: { 
                idvariable: "$_id.idvariable", 
                count: "$valueCount", 
                lastValue: "$lastValue" 
              } 
            } 
          } 
        },
        // Renommer les champs pour plus de clarté
        { 
          $project: { 
            _id: 0, 
            id_user: "$_id.id_user", 
            idbot: "$_id.idbot", 
            variables: 1 
          } 
        }
      ];
      return findbyaggreate("peelo", "VARIABLES_VALUE", this.client,
        aggregateit);
    }

  
    findLiteListCours() {
        var aggregate = [
            {
                $addFields: {
                    number_chapter: { $size: "$Sections" }
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    number_chapter: 1
                }
            },
            { $sort: { _id: -1 } },
            { $limit: 10 }
        ];

        return findbyaggreate("peelo", "autoecoles_courses", this.client, aggregate)
        //return findBy("peelo", "VARIABLES_VALUE", this.client, datas)
    }

    countTrueAnswersAndScore(documentId) {
    
        const aggregate = [
            { $match: { _id: ObjectId(documentId) } },
            { $unwind: '$answers' },
            { $match: { 'answers.answer': 'true' } },
            { $group: { _id: null, trueAnswersCount: { $sum: 1 }, score: { $first: '$score' } } }
        ];
       
       
        return findbyaggreate("peelo", "autoecoles_quizz_test", this.client, aggregate)

        //const result = await collection.aggregate(pipeline).toArray();
        //return result[0] || { trueAnswersCount: 0, score: 0 };
    }

    // Alias method for count (calls countElements)
    // Signature: count(database, table, client, data = null)
    count(database, table, client, data = null) {
        return countElements(database, table, client, data);
    }

    // Count admin users
    countUsers(data = null) {
        return countElements("peelo", "autoecole_user", this.client, data);
    }

    // Count courses
    countCourses(data = null) {
        return countElements("peelo", "autoecoles_courses", this.client, data);
    }

    // Count tests
    countTests(data = null) {
        return countElements("peelo", "autoecoles_quizz_test", this.client, data);
    }

    // Alias method for findbyaggregate (calls findbyaggreate with correct spelling)
    findbyaggregate(database, table, client, aggregateit) {
        return findbyaggreate(database, table, client, aggregateit);
    }

    // Delete a quiz by ID
    deleteQuizz(idquizz) {
        return deleteOne("peelo", "autoecoles_quizz", this.client, { _id: ObjectId(idquizz) });
    }

    // Delete a specific question from a quiz
    async deleteQuestionFromQuizz(idquizz, questionIndex) {
        const quiz = await findBy("peelo", "autoecoles_quizz", this.client, { _id: ObjectId(idquizz) });

        if (quiz.length && quiz[0].list_quizz && quiz[0].list_quizz[questionIndex]) {
            // Remove the question at the specified index
            quiz[0].list_quizz.splice(questionIndex, 1);

            // Update the quiz with the modified list_quizz array
            return updatElement("peelo", "autoecoles_quizz", this.client,
                { _id: ObjectId(idquizz) },
                { $set: { list_quizz: quiz[0].list_quizz } }
            );
        }
        throw new Error('Quiz or question not found');
    }

    // Update quiz metadata (title, etc.)
    updateQuizz(idquizz, updates) {
        // updatElement already adds update_date via $currentDate, so we don't need to include it in updates
        return updatElement("peelo", "autoecoles_quizz", this.client,
            { _id: ObjectId(idquizz) },
            { $set: updates }
        );
    }


}


module.exports = new Mongobot();