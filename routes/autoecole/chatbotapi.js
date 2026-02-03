const { Console } = require('console');
const { userInfo } = require('os');

module.exports = (_, app, axios, Mongo, cron, ObjectID, authenticateToken, generateRandomString) => {

    const fs = require('fs');
    const path = require('path');

    const WhatsAppSender = require('./../../modules/WhatsAppSender.js');  // Ajustez le chemin selon votre structure de dossiers



    const extractPhoneNumbers = (data) => {
        // Map over the array and extract just the 'tel' values
        return data.map(item => item.tel);
    }


    const generateTargetReports = async () => {

        console.log('Generating generateTargetReports')
        console.log('Target reports generated successfully')

        try {

            await Mongo.connect();
            let tel_user = '787570707';
            users = await Mongo.findPremiumStudent(tel_user);

            if (!users || !users.length) {
                console.log('No users found');
                return;
            }

            let contacts = extractPhoneNumbers(users);
            console.log('stringify numb ===', JSON.stringify(contacts));

            const PHONE_NUMBER_ID = '106273332517016';
            const CODE_COUNTRY = 'fr';
            const TEMPLATE_NAME = 'kaydjang';
            const CONFIG = require("./../../configs/setup");

            const sender = new WhatsAppSender(
                PHONE_NUMBER_ID,
                CONFIG.env.WHATSAPP_TOKEN
            );

            sender.sendBatchMessages(contacts, TEMPLATE_NAME, CODE_COUNTRY, []);


        } catch (error) {
            console.error('Error in generateTargetReports:', error);
        }

    }

    //0 18 * * *  every day at 6pm
    //* * * * *
    cron.schedule('0 18 * * *', async () => {

        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] Running scheduled task Done zer`);

        await generateTargetReports();

    });

    Mongo.connect();



    const extractData = (data) => {
        let result = {};
        let dataType = null;
        for (let item of data) {
            if (typeof item.value === 'object' && item.value !== null) {

                if (item.value.type === 'interactive') {



                    if (item.value.interactive.type === 'list_reply') {
                        result[item.idvariable] = item.value.interactive.list_reply.id;
                        dataType = 'list_reply';
                    }

                    if (item.value.interactive.type === 'button_reply') {

                        result[item.idvariable] = item.value.interactive.button_reply.id;
                        dataType = 'button_reply';
                    }

                } else if (item.value.type === 'text') {

                    if (_.includes(item.value, 'text')) {
                        result[item.idvariable] = item.value?.text?.body || item.value?.value?.text?.body;
                    }
                    dataType = 'text';

                } else if (item.value.type === 'variable_declared') {

                    result[item.idvariable] = item.value.value.variable_declared.data;
                }

            } else {
                result[item.idvariable] = item.value;
            }
        }
        return { datas: result, lastInputType: dataType };
    }


    function replaceGoodAnswer(obj, verite) {
        let replacement = verite == 'true' ? 'Bonne réponse 🥳 🎉 ✚𝟏 Point\n' : 'Mauvaise réponse 👎🙅🏿‍♂️\n';
        console.log('replaceGoodAnswer ===>', replacement);
        return obj.text.replace('{{goodanswer}}', replacement);

    }


    const translateButton = (buttons, id) => {

        return buttons.map((item, key) => {
            return {
                id: `${id}${item.value}_${key}`,
                title: item.title
            };
        });
    }

    function extractId(idNextQuestion) {
        const parts = idNextQuestion.split('_');
        return parts.length > 1 ? parts[1] : null;
    }

    const transformAnswerToButtons = (answer, verite, nextQuestionExist, idNextQuestion, lastLastRecord) => {

        console.log('transformAnswerToButtons', answer, verite);
        console.log('ANSWER ===>', answer)
        console.log('VERITE ===>', verite);
        console.log('nextQuestionExist ===>', nextQuestionExist);
        console.log('idNextQuestion ===>', idNextQuestion);


        console.log('lastLastRecord =================>', lastLastRecord);

        let textAnswer = replaceGoodAnswer(answer, verite);
        let flow = []
        let randomiz = generateRandomString(24)
        let newtext = nextQuestionExist ?
            {
                "type": "text_button",
                "id_element": "659816a89f5a6dc6bc104da5_65da381616a67091aa91e584_text_answer",
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                "message": textAnswer,
                "buttons": [
                    {
                        "id": idNextQuestion,
                        "title": "Question suivante ➡",
                    }
                ]
            }
            :
            {
                "type": "text",
                "id_element": "659816a89f5a6dc6bc104da5_65da381616a67091aa91e584_text_answer",
                "id_previous": "659816a89f5a6dc6bc104da5_${randomiz}_delay_answer",
                "message": textAnswer,
                "preview_url": true
            };

        console.log('NEXT QUESTION ===>', newtext);

        /* if(nextQuestionExist){
             flow.push(
                 {
                     "type": "variable_insert",
                     "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_variableinsert_${generateRandomString(6)}`,
                     "id_previous": null,
                     "variable": {
                       "id": "next_question",
                       "value": idNextQuestion
                     }
                 }
             );
         }*/

        flow.push(
            {
                "type": "audio",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_audio_answer`,
                "id_previous": null,
                "link": answer.audio
            }
        );

        flow.push(
            {
                "type": "delay",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_audio_answer`,
                "timmer": 2
            }
        );

        flow.push(newtext
        )
        // Si il n'  a pas de prochaine question en enchaine avec le nombre de point obtenu
        if (!nextQuestionExist) {
            let score = countTrueAnswers(lastLastRecord.answers)
            /*
            flow.push(
             {
                 "type": "text",
                 "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_text_score`,
                 "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                 "message": `Vous avez trouvé ${score} questions sur ${lastLastRecord.answers.length} Ce qui vous fait un score de ✚ ${score}`
             }
             );
              */
            const Redo = `Quiz_${lastLastRecord.quizId}`;
            flow.push({
                "type": "text_button",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_text_score`,
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                "message": `Vous avez trouvé ${score} questions sur ${lastLastRecord.answers.length} Ce qui vous fait un score de ✚ ${score}`,
                "buttons": [
                    {
                        "id": Redo,
                        "title": "⏎ Refaire le quiz"
                    },
                    {
                        "id": 'get_current_menu',
                        "title": "🛖 Retourner au menu"
                    }
                ]
            })
            //ici  

            flow.push({
                "type": "redirection",
                "id_element": "redirection_for_sharing",
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_text_score`,
                "redirection_block": `send_contact_name`
            });

        }

        return flow
    }

    const transformQuestionToButtons = (question, idquiz, keyquestion) => {

        console.log('transformQuestionToButtons ====>');

        let flow = []
        let randomiz = generateRandomString(24)
        let incrementit = parseInt(keyquestion) + 1;
        flow.push(
            {
                "type": "variable_insert",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_variableinsert_${generateRandomString(6)}`,
                "id_previous": null,
                "variable": {
                    "id": "current_quizz",
                    "value": idquiz
                }
            }
        );

        flow.push(
            {
                "type": "variable_insert",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_variableinsert_${generateRandomString(6)}`,
                "id_previous": null,
                "variable": {
                    "id": "current_question",
                    "value": keyquestion
                }
            }
        );
        flow.push(
            {
                "type": "variable_insert",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_variableinsert_${generateRandomString(6)}`,
                "id_previous": null,
                "variable": {
                    "id": "next_question",
                    "value": `NQ_${idquiz}_${incrementit}`
                }
            }
        );


        flow.push(
            {
                "type": "image",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_image_knsmh2ghWhJK`,
                "id_previous": null,
                "link": question.image
            }
        );

        flow.push(
            {
                "type": "delay",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_TceWGEF1RkTU`,
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_image_knsmh2ghWhJK`,
                "timmer": 2
            }
        );

        console.log('question.audio ===>', question.audio);

        flow.push(
            {
                "type": "audio",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_audio_hqgujN8bx8R6`,
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_delay_TceWGEF1RkTU`,
                "link": question.audio
            }
        );

        flow.push(
            {
                "type": "delay",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_BceFHGF1RkTU`,
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_audio_hqgujN8bx8R6`,
                "timmer": 2
            }
        );
        const stringQuiz = `Q_${idquiz}_${keyquestion}_`;
        const transformedButtons = translateButton(question.buttons, stringQuiz);
        flow.push(
            {
                "type": "text_button",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_text_button_hqgujN8bx8R6`,
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_delay_BceFHGF1RkTU`,
                "message": question.text,
                "buttons": transformedButtons
            }
        );

        return flow;

    }
    //authenticateToken

    async function truncateTitles(data, maxLength) {
        data = data.map(item => {
            if (item.title.length > maxLength) {
                item.title = item.title.substring(0, maxLength - 3) + '...';
            }
            return item;
        });

        return data;
    }

    app.post('/chatbot/list/quizz', async (req, res) => {
        console.log('/chatbot/list/quizz');

        const { status_payment_ec, fullname_ae, tel_ae, reply_phone, bot_number } = req.body

        try {

            await Mongo.connect();
            const listQuizz = await Mongo.findLiteListQuizz()
            const id_element = generateRandomString(12);

            console.log('listQuizz ==>', listQuizz);



            if (listQuizz.length) {

                const treated_Quizz = await truncateTitles(listQuizz, 24)
                console.log('treated_Quizz ==>', treated_Quizz);
                const sections_row = treated_Quizz.map((quiz, index) => {
                    return {
                        id: `Quiz_${quiz._id}`,
                        title: quiz.title,
                        description: `Ce quizz a ${quiz.number_quizz} questions`
                    };
                });


                res.status(200).send({

                    "type": "list",
                    "id_element": id_element,
                    "id_previous": null,
                    "interactive": {
                        "type": "list",
                        "header": {
                            "type": "text",
                            "text": "Quizz disponibles"
                        },
                        "body": {
                            "text": "La liste des quizz disponibles",
                        },
                        "footer": {
                            "text": "Choisissez un quizz pour commencer"
                        },
                        "action": {
                            "button": "Démarrer",
                            "sections": [
                                {
                                    "title": "Les quizz",
                                    "rows": sections_row
                                },

                            ]
                        }
                    }
                });

            }
        } catch (errorit) {
            console.log('nous avons une erreur dans l execution',);
        }

    });

    app.post('/chatbot/list/cours', async (req, res) => {
        console.log('/chatbot/list/cours');

        const { status_payment_ec, fullname_ae, tel_ae, reply_phone, bot_number } = req.body

        try {

            const connexion = await Mongo.connect();
            const listCours = await Mongo.findLiteListCours()
            const id_element = generateRandomString(12);
            console.log('ListCours ==>', listCours);

            if (listCours.length) {
                const treated_Courses = await truncateTitles(listCours, 24)
                const sections_row = treated_Courses.map((cours, index) => {
                    return {
                        id: `Cours_${cours._id}`,
                        title: cours.title,
                        description: `Ce cours a ${cours.number_chapter} chapitre`
                    };
                });

                console.log('sections_row ==> ', sections_row);



                const responseData = {
                    "type": "list",
                    "id_element": id_element,
                    "id_previous": null,
                    "interactive": {
                        "type": "list",
                        "header": {
                            "type": "text",
                            "text": "Cours disponibles"
                        },
                        "body": {
                            "text": "La liste des cours disponibles",
                        },
                        "footer": {
                            "text": "Choisissez un cours pour commencer"
                        },
                        "action": {
                            "button": "Démarrer",
                            "sections": [
                                {
                                    "title": "Les cours",
                                    "rows": sections_row
                                },

                            ]
                        }
                    }
                };
                
                console.log('✅ RESPONSE FROM /chatbot/list/cours:', JSON.stringify(responseData, null, 2));

                res.status(200).send(responseData);



            }
        } catch (errorit) {
            console.log('nous avons une erreur dans l execution', errorit);
        }

    });


    let findButtonWithValue = (buttons, value) => {
        return _.find(buttons, { value: value });
    }

    let createNoteStorage = async (datas, currentQuizz) => {

        let newTest = {

            "quizId": currentQuizz._id,
            "userId": ObjectID(datas.id_user),
            "answers": [],
            "score": 0

        };

        try {

            const connexion = await Mongo.connect();
            return await Mongo.createQuizTest(newTest);

        } catch (errorit) {
            console.log('nous avons une erreur pendant la création du test', errorit);
        }

    }
    //https://autoecole.mojay.pro/chatbot/default/answer

    app.get('/chatbot/default/answer', async (req, res) => {
        console.log('✅ ROUTE CALLED: /chatbot/default/answer');
        console.log('👉 METHOD:', req.method);
        console.log('👉 BODY:', JSON.stringify(req.body, null, 2));
        
        try {
            const connexion = await Mongo.connect();
            
            if (!req.body.datas) {
                console.log('⚠️ WARNING: req.body.datas is missing/undefined!');
            }

            const extractedData = extractData(req.body.datas || []); // Prevent crash if undefined
            const quizId = '65ef033cb6e694897123f878';
            console.log('data extractedData ==> ', extractedData);
    
            const { datas, lastInputType } = extractedData;
            console.log('___________________________________________');
    
            console.log('datas ===>', datas);
            console.log('lastInputType ===>', lastInputType);
    
            const condition = { $and: [{ quizId: ObjectID(quizId) }, { userId: ObjectID(datas.id_user) }] };
            console.log('condition ===>', condition);
    
            let lastRecord = await Mongo.getLastTestRecord(condition);
            console.log('lastRecord ===>', lastRecord);

            // Log that no response is sent currently
            console.log('⚠️ WARNING: This route does NOT send any response to the client via res.send()!');
    
        } catch (errorit) {
            console.log('nous avons une erreur dans l execution', errorit);
        }
    
    });


    app.post('/payment/request', async (req, res) => {

        console.log('/payment/request');


        const extractedData = extractData(req.body.datas);

        console.log('data extracted', extractedData);


        return res.status(200).send(
            JSON.stringify(extractedData)
        );


    });


    app.post('/chatbot/current/menu', async (req, res) => {

        console.log('/chatbot/current/menu');
        let coonexion = await Mongo.connect()
        //console.log('coonexion====>',coonexion);

        //req.body.datas
        const extractionDone = await checkTypeUser(req.body.datas, 'menu_');
        //console.log('extractionDone ===>', extractionDone);

        return res.status(200).send(
            extractionDone
        );


    });



    async function checkTypeUser(datas, type_menu = 'welcome_') {

        console.log('checkTypeUser ===> datas ', datas);
        console.log('checkTypeUser ===> type_menu', type_menu);

        const extractedData = await _.reduce(datas, (result, { idvariable, value }) => {
            if (idvariable && value !== null) {
                if (_.isObject(value.value)) {
                    if (_.has(value.value, 'variable_declared')) {
                        result[idvariable] = value.value.variable_declared.data;
                    } else {
                        result[idvariable] = value.value.text.body;
                    }
                } else {
                    result[idvariable] = value;
                }
            }
            return result;
        }, {});

        console.log('extractedData ===>', extractedData);


        return new Promise((resolve, reject) => {
            Mongo.connect()
                .then(async (success) => {
                    //console.log('req.user', req.user)
                    const monitor = await Mongo.listAutoEcole({
                        "phoneNumber": _.slice(extractedData.reply_phone, 3).join('')
                    });

                    //_.slice(extractedData.reply_phone, 3).join('')
                    if (monitor.length) {
                        resolve({
                            "type": "redirection",
                            "id_element": "redirection_for_monitor",
                            "id_previous": null,
                            "redirection_block": `${type_menu}moniteur`
                        });

                    }

                    const eleves = await Mongo.findAutoEcoleStudent({
                        $or: [
                            { "tel": _.slice(extractedData.reply_phone, 3).join('') },
                            { "tel": extractedData.reply_phone }
                        ]
                    })
                    console.log('check si l eleve existe ==> ', eleves);

                    if (eleves.length) {
                        console.log(' elevesium ', eleves);

                        resolve({
                            "type": "redirection",
                            "id_element": "redirection_for_autoecolestudent",
                            "id_previous": null,
                            "redirection_block": `${type_menu}eleve`
                        });
                    } else {

                        console.log('elevesium pas trouvé est vide');
                        resolve({
                            "type": "redirection",
                            "id_element": "redirection_notification_noneleve",
                            "id_previous": "",
                            "redirection_block": "check_type_user"
                        });
                    }
                })
                .catch((error) => {
                    console.log('pas de connexion possible ??');
                    console.log('error ==>', error)

                })
        });
    }


    function countTrueAnswers(answers) {
        const trueAnswersCount = answers.filter(answer => answer.answer === 'true').length;
        return `${trueAnswersCount}`;
    }


    function tranformChapterToElementBot(the_chapter, coursId) {
        console.log('tranformChapterToElementBot ===> the_chapter', the_chapter);
        let flow = []
        let randomiz = generateRandomString(24)
        let keyimage = null;
        let id_previous = null;

        if (the_chapter.chapter) {

            let chapter = the_chapter.chapter;

            for (let keyEOC = 0; keyEOC < chapter.length; keyEOC++) {

                id_previous = (keyEOC - 1 >= 0) ? flow[keyEOC - 1].id_element : null;

                if (_.has(chapter[keyEOC], "text")) {
                    flow.push({
                        "type": "text",
                        "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_text_${generateRandomString(6)}`,
                        "id_previous": id_previous,
                        "message": chapter[keyEOC].text
                    });
                }
                if (_.has(chapter[keyEOC], "image")) {

                    flow[flow.length - 1].id_element;
                    keyimage = `659816a89f5a6dc6bc104da5_${randomiz}_image_${generateRandomString(6)}`;
                    flow.push({
                        "type": "image",
                        "id_element": keyimage,
                        "id_previous": id_previous,
                        "link": chapter[keyEOC].image
                    });

                    flow.push(
                        {
                            "type": "delay",
                            "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                            "id_previous": keyimage,
                            "timmer": 2
                        }
                    );

                }
                if (_.has(chapter[keyEOC], "video")) {
                    console.log('cest bien une video == > ', chapter[keyEOC]);
                    keyimage = `659816a89f5a6dc6bc104da5_${randomiz}_video_${generateRandomString(6)}`
                    flow.push({
                        "type": "video",
                        "id_element": keyimage,
                        "id_previous": id_previous,
                        "link": chapter[keyEOC].video
                    });

                    flow.push(
                        {
                            "type": "delay",
                            "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                            "id_previous": keyimage,
                            "timmer": 2
                        }
                    );
                }

                if (_.has(chapter[keyEOC], "audio")) {

                    keyimage = `659816a89f5a6dc6bc104da5_${randomiz}_audio_answer`

                    flow.push(
                        {
                            "type": "audio",
                            "id_element": keyimage,
                            "id_previous": id_previous,
                            "link": chapter[keyEOC].audio
                        }
                    );

                    flow.push(
                        {
                            "type": "delay",
                            "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                            "id_previous": keyimage,
                            "timmer": 2
                        }
                    );

                }
            }

            return flow
        }
    }

    function transformSectionToElementBot(elements, coursId, keychapter) {
        let flow = []
        let randomiz = generateRandomString(24)
        let keyimage = null;
        let id_previous = null;

        if (elements[keychapter].chapter) {

            let chapter = elements[keychapter].chapter;

            for (let keyEOC = 0; keyEOC < chapter.length; keyEOC++) {

                id_previous = (keyEOC - 1 >= 0) ? flow[keyEOC - 1].id_element : null;

                flow.push(
                    {
                        "type": "variable_insert",
                        "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_variableinsert_${generateRandomString(6)}`,
                        "id_previous": null,
                        "variable": {
                            "id": "current_cours",
                            "value": coursId
                        }
                    }
                );

                if (_.has(chapter[keyEOC], "text")) {
                    flow.push({
                        "type": "text",
                        "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_text_${generateRandomString(6)}`,
                        "id_previous": id_previous,
                        "message": chapter[keyEOC].text
                    });
                }
                if (_.has(chapter[keyEOC], "image")) {

                    flow[flow.length - 1].id_element;
                    keyimage = `659816a89f5a6dc6bc104da5_${randomiz}_image_${generateRandomString(6)}`;
                    flow.push({
                        "type": "image",
                        "id_element": keyimage,
                        "id_previous": id_previous,
                        "link": chapter[keyEOC].image
                    });

                    flow.push(
                        {
                            "type": "delay",
                            "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                            "id_previous": keyimage,
                            "timmer": 2
                        }
                    );

                }

                if (_.has(chapter[keyEOC], "video")) {
                    keyimage = `659816a89f5a6dc6bc104da5_${randomiz}_video_${generateRandomString(6)}`
                    flow.push({
                        "type": "video",
                        "id_element": keyimage,
                        "id_previous": id_previous,
                        "link": chapter[keyEOC].video
                    });

                    flow.push(
                        {
                            "type": "delay",
                            "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                            "id_previous": keyimage,
                            "timmer": 2
                        }
                    );


                }

                if (_.has(chapter[keyEOC], "audio")) {
                    keyimage = `659816a89f5a6dc6bc104da5_${randomiz}_audio_answer`

                    flow.push(
                        {
                            "type": "audio",
                            "id_element": keyimage,
                            "id_previous": id_previous,
                            "link": chapter[keyEOC].audio
                        }
                    );

                    flow.push(
                        {
                            "type": "delay",
                            "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                            "id_previous": keyimage,
                            "timmer": 2
                        }
                    );

                }
            }
        }
        return flow;


    }

    function pushButtonQuizAssociate(cours) {

        if (!_.isNull(cours.quizz_associated)) {

            let randomiz = generateRandomString(24)
            let textAnswer = `Cliquez sur le bouton ci-dessous pour faire le quiz '${cours.title}'  qui correspond à ce chapitre`;
            let idNextQuestion = `Quiz_${cours.quizz_associated}`;

            return {
                "type": "text_button",
                "id_element": `659816a89f5a6dc6bc104da5_${cours.quizz_associated}_text_answer`,
                "id_previous": null,
                "message": textAnswer,
                "buttons": [
                    {
                        "id": idNextQuestion,
                        "title": "Faire le quiz",
                    }
                ]
            }

        }
    }

    function pushButtonNext(coursid, nextChap = 1) {
        let randomiz = generateRandomString(24)
        let textAnswer = 'Cliquez sur le bouton ci-dessous pour poursuivre';
        let idNextQuestion = `NC_${coursid}_CH_${nextChap}`;
        return {

            "type": "text_button",
            "id_element": `659816a89f5a6dc6bc104da5_661ea93016a67091aa91e589_text_answer`,
            "id_previous": null,
            "message": textAnswer,
            "buttons": [
                {
                    "id": idNextQuestion,
                    "title": "Continuer ➡",
                }
            ]
        }

    }

    async function startsWith(datas) {

        if (_.startsWith(datas.last_input, 'Quiz_')) {
            const quizId = datas.last_input.substring(5); // Extract the rest of the string after 'Quiz_'

            try {
                const connexion = await Mongo.connect();
                const QuizzFound = await Mongo.findQuizz({ _id: ObjectID(quizId) });

                if (QuizzFound.length) {
                    //Create new quiz Test to store the current answer of the quizz
                    let isTestCreated = createNoteStorage(datas, QuizzFound[0]);
                    console.log('isTestCreated ===>', isTestCreated);

                    const listQuizz = QuizzFound[0].list_quizz;

                    return transformQuestionToButtons(listQuizz[0], quizId, 0);

                }
            } catch (errorit) {
                console.log('nous avons une erreur dans l execution', errorit);
            }
            // Connect to MongoDB and find the quiz
        }

    }


    /**
     * Performs treatment for a course.
     * @param {Object} datas - The data object containing the necessary information.
     * @returns {Array} - The flow of elements for the course treatment.
     */
    async function treatmentCours_(datas) {

        const coursId = datas.last_input.substring(6); // Extract the rest of the string after 'Quiz_'
        try {
            const connexion = await Mongo.connect();
            const CoursFound = await Mongo.listCourses({ _id: ObjectID(coursId) });

            if (CoursFound.length) {
                //Create new quiz Test to store the current answer of the quizz

                const Chapiters = CoursFound[0].Sections;
                //transformQuestionToButtons
                const flow = transformSectionToElementBot(Chapiters, coursId, 0);
                if (Chapiters.length > 1) {
                    flow.push(pushButtonNext(coursId));
                } else {
                    console.log('we are at the end of the chapter');
                    console.log('ON PASSE AU QUIZZZZZZZZZZZZZZZ');
                    flow.push(pushButtonQuizAssociate(CoursFound[0]));
                }
                return flow;
            }
        } catch (errorit) {
            console.log('nous avons une erreur dans l execution', errorit);
        }
        // Connect to MongoDB and find the quiz


    }


    async function treatmentChapter_(coursId, chapterIndex) {

        try {

            const connexion = await Mongo.connect();
            const CoursFound = await Mongo.listCourses({ _id: ObjectID(coursId) });
            console.log('CoursFound ==>', CoursFound);

            if (CoursFound.length) {

                // Convert chapterIndex to an integer
                chapterIndex = parseInt(chapterIndex);
                console.log('chapterIndex => ', chapterIndex);
                console.log('section cours ==>', CoursFound[0].Sections.length);
                console.log('section cours ==>', CoursFound[0].Sections);
                console.log('1', CoursFound[0].Sections[chapterIndex]);
                console.log('next', CoursFound[0].Sections[chapterIndex + 1]);

                // Check if the section exists
                if (chapterIndex <= CoursFound[0].Sections.length) {

                    const flow = tranformChapterToElementBot(CoursFound[0].Sections[chapterIndex], coursId);
                    console.log('the flow done zer ===>', flow);
                    if (chapterIndex + 1 < CoursFound[0].Sections.length) {
                        flow.push(pushButtonNext(coursId, chapterIndex + 1));
                    } else {
                        console.log('we are at the end of the chapter');
                        console.log('ON PASSE AU QUIZZZZZZZZZZZZZZZ');
                        flow.push(pushButtonQuizAssociate(CoursFound[0]));
                    }
                    return flow;
                }
            }
            /*
                    if (CoursFound.length) {
                        //Create new quiz Test to store the current answer of the quizz
    
                        const the_chatpter = CoursFound[0].Sections;
    
    
    
                        //transformQuestionToButtons
                        const flow = transformSectionToElementBot(CoursFound[0].Sections[chapterIndex+1], coursId, 0);
                        if (flow.length > chapterIndex+1) {
                            flow.push(pushButtonNext(coursId, chapterIndex+1));
                        }
                        return flow;
                    }
            */


        } catch (errorit) {
            console.log('nous avons une erreur dans l execution', errorit);
        }


    }

    app.get('/test/nonpermis', async (req, res) => {

        const connexion = await Mongo.connect();
        const NonPermis = await Mongo.findNonpermis();
        console.log('NonPermis', JSON.stringify(NonPermis));

        //res.JSON
        res.status(200).send(NonPermis);



    });


    app.post('/car/whomakesub', async (req, res) => {
        console.log('/car/whomakesub')
        var losDatas = extractData(req.body.datas);
        var typeSub = losDatas.datas.typesub;
        console.log('losDatas ====> ', losDatas);
        console.log('typeSub ====> ', typeSub);
        var redirection = (typeSub == 'monitor') ? 'confirm_subscription' : (typeSub == 'user') ? 'direct_user_sub' : null;

        console.log('redirection ====> ', redirection);

        res
            .json({
                "type": "redirection",
                "id_element": null,
                "id_previous": null,
                "redirection_block": redirection
            })




    });


    app.post('/make/post/kyc', async (req, res) => {
        console.log('/make/post/kyc');
        try {
            // Extract data using extractData function

            console.log('reqbodyzerrrrr =>', req.body);
            const lesdonnees = extractData(req.body.datas);
            console.log('databi ==', lesdonnees);

            // Send the extracted data to the webhook
            const response = await axios.post('https://hook.eu2.make.com/zm2ha6ao0482aoexs7450w61jwjd2etc', lesdonnees);

            console.log('response.data ca donne quoi ?? ===>', response.data);
            if (response.data) {
                let textAnswer = "Votre inscription a bien été prise en compte. Un membre de notre équipe va la valider sous peu. Une fois cette validation effectuée, vous pourrez commencer à utiliser le chatbot.";
                // send a json as a response
                res.status(200).send({
                    "type": "text",
                    "id_element": "659816a89f5a6dc6bc104da5_66a39fb248498707eb1d1b50_text_answer",
                    "id_previous": null,
                    "message": textAnswer,
                    "preview_url": true
                });

            }
            // Send back the response from the webhook to the client
            // res.status(response.status).send(response.data);
        } catch (error) {
            console.error('Error:', error);
            res.status(500).send('An error occurred');
        }
    });

    app.post('/chatbot/default/answer', async (req, res) => {
        let connexion = await Mongo.connect();
        console.log('chatbotapi.js ===>');

        console.log('/chatbot/default/answer ==> ', '/chatbot/default/answer');
        const extractedData = extractData(req.body.datas);

               console.log('extractedData ==> ', extractedData);

        const { datas, lastInputType } = extractedData;

 
        let Dialogsize = await Mongo.getDialogFlowSize(datas.bot_number, datas.reply_phone);
        console.log('Dialogsize ===>', Dialogsize );

        if (Dialogsize.length) {
            console.log('Dialogsize ===>', Dialogsize[0] );

            if(Dialogsize[0]['flowCount'] > 55) {

                let nextElementBlock= {
                    "type": "redirection",
                    "id_element": "redirection_forpayment",
                    "id_previous": null,
                    "redirection_block": `notif_freemium_payment`

                }
                console.log('L UTISATEUR DEPASSE LES LIMITES ===>');
          
            let freemiumPay = await Mongo.getValueVariableByName(Dialogsize[0]['idbot'], datas.id_user, 'freemiumpay');
            
            console.log('freemiumPay ===>', freemiumPay);

            if (freemiumPay.length) {
                let term = freemiumPay[0]['variables'][0]['lastValue']['variable_declared']['data'];
                console.log('valeur de freemiumPay ===>',  term);

                if (term === 'succeeded') 
                {
                    console.log('L UTILISATEUR A DEJA PAYE ===>');
                }else{
                     console.log(' ON BLOQUE L UTILISATEUR ===>');
                     console.log('✅ RESPONSE FROM POST /chatbot/default/answer (BLOCKED):', JSON.stringify(nextElementBlock, null, 2));
                     return res.status(200).send(nextElementBlock);
                }

            }else{
                console.log('L UTILISATEUR N A PAS PAYE ===>',nextElementBlock);
               // return true;
                console.log('✅ RESPONSE FROM POST /chatbot/default/answer (NOT PAID):', JSON.stringify(nextElementBlock, null, 2));
                return res.status(200).send(nextElementBlock);

            }
          }
        }


 
        if (lastInputType === 'list_reply') {

            // let flow = await startsWith(datas.last_input);

            if (_.startsWith(datas.last_input, 'Quiz_')) {
                const quizId = datas.last_input.substring(5); // Extract the rest of the string after 'Quiz_'

                try {
                    const QuizzFound = await Mongo.findQuizz({ _id: ObjectID(quizId) });

                    if (QuizzFound.length) {
                        //Create new quiz Test to store the current answer of the quizz
                        let isTestCreated = createNoteStorage(datas, QuizzFound[0]);
                        console.log('isTestCreated ===>', isTestCreated);

                        const listQuizz = QuizzFound[0].list_quizz;

                        const flow = transformQuestionToButtons(listQuizz[0], quizId, 0);
                        console.log('✅ RESPONSE FROM POST /chatbot/default/answer (QUIZ):', JSON.stringify(flow, null, 2));
                        res.status(200).send(flow);
                    }
                } catch (errorit) {
                    console.log('nous avons une erreur dans l execution', errorit);
                }
                // Connect to MongoDB and find the quiz
            }

            if (_.startsWith(datas.last_input, 'Cours_')) {
                let the_flow = await treatmentCours_(datas);
                console.log('✅ RESPONSE FROM POST /chatbot/default/answer (COURS):', JSON.stringify(the_flow, null, 2));
                res.status(200).send(the_flow);


            }
        }

        if (lastInputType === 'button_reply') {

            if (_.startsWith(datas.last_input, 'Quiz_')) {
                let flow = await startsWith(datas);
                console.log('button_reply ===> Quiz_ ======>', flow);
                res.status(200).send(flow);
            }


            // on gère les réponses aux quizz
            if (_.startsWith(datas.last_input, 'Q_')) {

                let parts = _.split(datas.last_input, '_');
                const quizId = parts[1];
                const niveauquestion = parseInt(parts[2]);
                const value = parts[3];
                const niveauButton = parseInt(parts[4]);
                //Q_65e5f7d383cfcdc6c4be7859_0_false_1

                try {
                    const connexion = await Mongo.connect();
                    const QuizzFound = await Mongo.findQuizz({ _id: ObjectID(quizId) });

                    if (QuizzFound.length) {
                        const listQuizz = QuizzFound[0].list_quizz;
                        const TheQuestion = listQuizz[niveauquestion];
                        let ButtonClicked = TheQuestion.buttons[niveauButton]

                        let nextQuestionExist = (listQuizz.length - 1) >= (niveauquestion + 1) ? true : false;
                        const idNextQuestion = `NQ_${quizId}_${niveauquestion + 1}`;

                        const condition = { $and: [{ quizId: ObjectID(quizId) }, { userId: ObjectID(datas.id_user) }] };

                        console.log('on a recu un bouton reply =====================>', ButtonClicked);
                        console.log('Condition =====================>', condition);
                        let lastRecord = await Mongo.getLastTestRecord(condition);
                        console.log('lastRecord ===>', lastRecord);


                        if (lastRecord.length) {

                            console.log('Condition verifiée ==>', lastRecord.length);

                            let afterpus = await Mongo.pushAnswerToTest(lastRecord[0], {
                                "questionId": niveauquestion,
                                "answer": ButtonClicked.value,
                                "title": ButtonClicked.title
                            });
                            console.log('lastLastRecord new deal ===>', afterpus)
                            let flowAnswer = await transformAnswerToButtons(TheQuestion.answer, ButtonClicked.value, nextQuestionExist, idNextQuestion, afterpus[0]);
                            res.status(200).send(flowAnswer);
                        }

                    }
                } catch (errorit) {
                    console.log('nous avons une erreur dans l execution', errorit);
                }

            }
            // on gère l'affichage de la réponse suivante si il yen a 
            if (_.startsWith(datas.last_input, 'NQ_')) {

                // `NQ_${quizId}_${niveauquestion+1}`

                let flowQuestion = [];
                let parts = _.split(datas.last_input, '_');
                const quizId = parts[1];
                const niveauquestion = parseInt(parts[2]);


                try {
                    const connexion = await Mongo.connect();
                    const QuizzFound = await Mongo.findQuizz({ _id: ObjectID(quizId) });

                    if (QuizzFound.length) {
                        const listQuizz = QuizzFound[0].list_quizz;
                        const TheQuestion = listQuizz[niveauquestion];

                        const flow = transformQuestionToButtons(TheQuestion, quizId, niveauquestion);
                        res.status(200).send(flow);

                    }
                } catch (errorit) {
                    console.log('nous avons une erreur dans l execution', errorit);
                }

            }

            if (_.startsWith(datas.last_input, 'NC_')) {

                console.log('Next Question done ==>', datas.last_input);


                const parts = datas.last_input.split('_');
                const idcours = parts[1];
                const chapterIndex = parts[3];

                console.log('idcous =>', idcours); // Outputs: 661d1d04246dfa17ca4c6623
                console.log('number =>', chapterIndex); // Outputs: 0

                const flow = await treatmentChapter_(idcours, chapterIndex);

                console.log('the new flow before send ===>', flow);

                res.status(200).send(flow);

            }
        }

        if (lastInputType === 'text') {
            console.log('on est bien ici et on doit retourner get_current_menu');
            res.status(200).send({
                "type": "redirection",
                "id_element": "",
                "id_previous": "",
                "redirection_block": "get_current_menu"
            })
        }


    // Safety Fallback if no condition matched
    if (!res.headersSent) {
        console.log('⚠️ [chatbotapi] No specific handler matched. Sending default empty response.');
        return res.status(200).send([]);
    }
    
    });

}