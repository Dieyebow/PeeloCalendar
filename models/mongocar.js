
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


    async connect() {
        try {
            console.log('Vérification de la connexion existante...');

            // Vérifier si une connexion existe déjà
            if (this.client) {
                try {
                    console.log('Test de la connexion existante (Ping)...');
                    
                    // Timeout de 5 secondes pour le ping
                    const pingPromise = this.client.db().command({ ping: 1 });
                    const timeoutPromise = new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Ping timeout')), 5000)
                    );

                    await Promise.race([pingPromise, timeoutPromise]);
                    
                    console.log('Connexion MongoDB déjà établie et active.');

                    const stats = await this.client.db().command({ dbStats: 1 });
                    console.log('Current database:', stats.db);
                    if(stats.db == 'peelo') {
                        return this.client;
                    }
                } catch (error) {
                    console.log('⚠️ La connexion existante n\'est plus valide (Erreur ou Timeout):', error.message);
                    try { await this.client.close(); } catch(e) {} // Essayer de fermer proprement
                    this.client = null;
                }
            }

            // Serveurs de base de données (tableau ou URI unique fallback)
            const servers = config.DB_SERVERS || [config.uri];
            let lastError = null;

            for (let i = 0; i < servers.length; i++) {
                const currentUri = servers[i];
                console.log(`Tentative de connexion à la base de données ${i + 1}/${servers.length}...`);
                try {
                    this.client = await MongoClient.connect(currentUri, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true,
                        serverSelectionTimeoutMS: 5000, // Timeout de 5s pour ne pas bloquer si le serveur est down
                        connectTimeoutMS: 10000 // 10 secondes max pour établir la TCP connection
                    });
                    console.log(`✅ Connexion MongoDB réussie sur le serveur ${i + 1}.`);
                    return this.client;
                } catch (err) {
                    console.error(`❌ Échec de connexion sur le serveur ${i + 1}:`, err.message);
                    lastError = err;
                }
            }

            // Si on arrive ici, tous les serveurs ont échoué
            console.error('💥 Impossible de se connecter à aucun des serveurs MongoDB configurés.');
            throw lastError || new Error("All database connections failed.");

        } catch (error) {
            console.error('Erreur dans connect() :', error);
            throw error;
        }
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

    findAdminPeeloAcademy(params) {
        console.log('🔍 [Mongo] findAdminPeeloAcademy appelé avec:', JSON.stringify(params));
        return findBy("peelo", "admin_peelo_academy", this.client, params)
            .then(res => {
                console.log('🔍 [Mongo] findAdminPeeloAcademy résultat count:', res ? res.length : 0);
                return res;
            });
    }

    createAdminPeeloAcademy(userData) {
        return createElement("peelo", "admin_peelo_academy", this.client, userData);
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

    countQuizz(data = null, collection = "autoecoles_quizz") {
        return countElements("peelo", collection, this.client, data)

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

    listQuizz(data = null, collection = "autoecoles_quizz") {
        return findBy("peelo", collection, this.client, data);
    }

    listCourses(data = null, collection = "autoecoles_courses") {
        // Use aggregation to lookup formation details
        let matchStage = {};
        if (data) {
            matchStage = data;
        }

        var aggregate = [
            { $match: matchStage },
            {
                $addFields: {
                    number_chapter: { $size: { "$ifNull": ["$Sections", []] } },
                    formationIdObj: { $toObjectId: "$formation_id" }
                }
            },
            {
                $lookup: {
                    from: "formations_peelo_academy",
                    localField: "formationIdObj",
                    foreignField: "_id",
                    as: "formation"
                }
            },
            {
                $unwind: {
                    path: "$formation",
                    preserveNullAndEmptyArrays: true
                }
            },
             {
                $addFields: {
                    formation_title: "$formation.title"
                }
            }
        ];

        return findbyaggreate("peelo", collection, this.client, aggregate);
    }

    deleteCours(params, collection = "autoecoles_courses"){
        return deleteOne("peelo", collection, this.client, params);
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

    createQuizz(userData, collection = "autoecoles_quizz") {
        return createElement("peelo", collection, this.client, userData)
    }

   async createCours(userData, collection = "autoecoles_courses") {
        let courses = await createElement("peelo", collection, this.client, userData)
        return this.listCourses({_id: ObjectId(courses.insertedId)}, collection);
    }

    addQuestionToQuizz(idquizz, newQuestion, collection = "autoecoles_quizz") {
        return updatElement("peelo", collection, this.client, { _id: ObjectId(idquizz) }, { $push: { "list_quizz": newQuestion } })
    }

    updateCurrentUser(idEleve,changements){

      return updatElement("peelo", "autoecoles_current_user", this.client, { _id: ObjectId(idEleve) },  { $set: changements } )
    }

    updateCourseSection(cours, collection = "autoecoles_courses") {

        console.log(' ===> updateCourseSection', cours)
        //cours._id, cours.Sections
        let idcourse = cours._id;
        delete cours._id;
        console.log('idcourse', idcourse);
        //{ $push: { "Sections": Sections } }
        console.log('after removing', cours);
       
        return updatElement("peelo", collection, this.client, { _id: ObjectId(idcourse) },  { $set: changements } ) // Note: changements is undefined in original code? Assuming it exists in scope or is a bug but keeping strict replacement.
    }

    async udpateCourses(cours, collection = "autoecoles_courses") {
        let  conditions = { _id: ObjectId(cours._id) };
        delete cours._id;
         
        return await update("peelo", collection, this.client, conditions, { $set: cours });
         
    }


    findQuizz(params, collection = "autoecoles_quizz") {
        return findBy("peelo", collection, this.client, params);
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




    async updateQuestionToQuizz(idquizz, keyquizz, newQuestion, collection = "autoecoles_quizz") {

        let question = await findBy("peelo", collection, this.client, { _id: ObjectId(idquizz) });

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
            return updatElement("peelo", collection, this.client, { _id: ObjectId(idquizz) }, { $set: { [`list_quizz.${keyquizz}`]: oldQuestion } });
        }

    }

    findLiteListQuizz(collection = "autoecoles_quizz", query = {}, limit = 10) {
        var aggregate = [
            { $match: query },
            {
                $addFields: {
                    number_quizz: { $size: "$list_quizz" },
                    // Add formation info lookup for quizzes too
                     formationIdObj: { $toObjectId: "$formation_id" }
                }
            },
            {
                $lookup: {
                    from: "formations_peelo_academy",
                    localField: "formationIdObj",
                    foreignField: "_id",
                    as: "formation"
                }
            },
            {
                $unwind: {
                    path: "$formation",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    number_quizz: 1,
                    formation_id: 1,
                    formation_title: { $ifNull: ["$formation.title", "$formation_title"] } // Use lookup or existing field
                }
            },
            { $sort: { _id: -1 } },
            { $limit: limit }
        ];

        return findbyaggreate("peelo", collection, this.client, aggregate)
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

  
    async findLiteListCours(collection = "autoecoles_courses", query = {}, limit = 10) {
        var aggregate = [
            { $match: query },
            {
                $addFields: {
                    number_chapter: { $size: { "$ifNull": ["$Sections", []] } },
                    formationIdObj: { $toObjectId: "$formation_id" }
                }
            },
            {
                $lookup: {
                    from: "formations_peelo_academy",
                    localField: "formationIdObj",
                    foreignField: "_id",
                    as: "formation"
                }
            },
            {
                $unwind: {
                    path: "$formation",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    number_chapter: 1,
                    formation_id: 1,
                     image: 1, // Include image for frontend
                    formation_title: { $ifNull: ["$formation.title", "$formation_title"] } // Use lookup or existing field
                }
            },
            { $sort: { _id: -1 } },
            { $limit: limit }
        ];

        try {
            return await findbyaggreate("peelo", collection, this.client, aggregate);
        } catch (error) {
            console.error(`[Mongo] Error in findLiteListCours for collection ${collection}:`, error);
            return [];
        }
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
    countCourses(data = null, collection = "autoecoles_courses") {
        return countElements("peelo", collection, this.client, data);
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
    deleteQuizz(idquizz, collection = "autoecoles_quizz") {
        return deleteOne("peelo", collection, this.client, { _id: ObjectId(idquizz) });
    }

    // Delete a specific question from a quiz
    async deleteQuestionFromQuizz(idquizz, questionIndex, collection = "autoecoles_quizz") {
        const quiz = await findBy("peelo", collection, this.client, { _id: ObjectId(idquizz) });

        if (quiz.length && quiz[0].list_quizz && quiz[0].list_quizz[questionIndex]) {
            // Remove the question at the specified index
            quiz[0].list_quizz.splice(questionIndex, 1);

            // Update the quiz with the modified list_quizz array
            return updatElement("peelo", collection, this.client,
                { _id: ObjectId(idquizz) },
                { $set: { list_quizz: quiz[0].list_quizz } }
            );
        }
        throw new Error('Quiz or question not found');
    }

    // Update quiz metadata (title, etc.)
    updateQuizz(idquizz, updates, collection = "autoecoles_quizz") {
        // updatElement already adds update_date via $currentDate, so we don't need to include it in updates
        return updatElement("peelo", collection, this.client,
            { _id: ObjectId(idquizz) },
            { $set: updates }
        );
    }


    // Generic delete method
    deleteOne(database, table, client, filter) {
        return deleteOne(database, table, client, filter);
    }

    // Generic update method
    update(database, table, client, condition, newListing) {
        return update(database, table, client, condition, newListing);
    }
    // Generic Peelo Academy Methods

    // Formations (e.g. Driving School, Coding School, etc.)
    createPeeloFormation(data) {
        return createElement("peelo", "formations_peelo_academy", this.client, data);
    }

    listPeeloFormations(params) {
        return findBy("peelo", "formations_peelo_academy", this.client, params);
    }
    
    countPeeloFormations(params) {
        return countElements("peelo", "formations_peelo_academy", this.client, params);
    }
    
    // Courses (Generic content linked to a formation)
    createPeeloCourse(data) {
        return createElement("peelo", "courses_peelo_academy", this.client, data);
    }

    listPeeloCourses(params) {
        return findBy("peelo", "courses_peelo_academy", this.client, params);
    }

    deletePeeloCourse(id, collection = "courses_peelo_academy") {
        return deleteOne("peelo", collection, this.client, { _id: ObjectId(id) });
    }

}


module.exports = new Mongobot();