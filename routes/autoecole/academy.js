module.exports = (_, app, axios, Mongo, cron, ObjectID, authenticateToken, generateRandomString) => {

    // ==========================================
    // ACADEMY ENDPOINTS
    // ==========================================

    app.post('/academy/cours', async function (req, res) {
        console.log("=========================================");
        console.log("📥 [POST /academy/cours] Payload reçu:");
        console.log(JSON.stringify(req.body, null, 2));

        try {
            const datas = req.body.datas || [];
            const botData = datas.find(d => d.idvariable === "idbot");
            
            if (!botData || !botData.value) {
                console.log("❌ Aucun idbot trouvé dans le payload");
                return res.status(400).json({ success: false, error: "Missing idbot in payload" });
            }

            const idbot = botData.value;
            console.log(`🔍 Recherche de l'admin avec idbot: ${idbot}`);

            await Mongo.connect();
            
            // Find admin by idbot
            const adminData = await Mongo.findAdminPeeloAcademy({ idbot: idbot });
            
            if (!adminData || adminData.length === 0) {
                console.log("❌ Aucun administrateur trouvé avec cet idbot");
                return res.status(404).json({ success: false, error: "Admin not found with this idbot" });
            }

            const adminId = adminData[0]._id.toString();
            console.log(`✅ Admin trouvé: ${adminData[0].email} (ID: ${adminId})`);

            // Find formations owned by this admin
            const queryFormations = {
                $or: [
                    { owner_admin_id: adminId },
                    { id_user: adminId }
                ]
            };
            
            console.log(`🔍 Recherche des formations pour l'admin:`, queryFormations);
            const formations = await Mongo.findLiteListCours('courses_peelo_academy', queryFormations, 1000);
            
            console.log(`✅ ${formations.length} formations trouvées. Structure complète:`);
            console.log(JSON.stringify(formations, null, 2));
            console.log("=========================================");

            // Return the formatted formations list as an interactive WhatsApp-style list block
            const truncateTitles = (list, maxLength) => {
                return list.map(item => {
                    let formatted = { ...item };
                    if (formatted.title && formatted.title.length > maxLength) {
                        formatted.title = formatted.title.substring(0, maxLength) + '...';
                    }
                    return formatted;
                });
            };

            const id_element = "list_" + Math.random().toString(36).substr(2, 9);
            let responseData = {};

            if (formations.length > 0) {
                const treated_Courses = truncateTitles(formations, 24);
                const sections_row = treated_Courses.map((cours) => {
                    return {
                        id: `Cours_${cours._id.toString()}`,
                        title: cours.title,
                        description: `Ce cours a ${cours.number_chapter || 0} chapitre ${(cours.number_chapter || 0) > 1 ? 's' : ''}`
                    };
                });  
                
                responseData = {
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
                            "text": "La liste des cours disponibles"
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
                                }
                            ]
                        }
                    }
                };
            } else {
                responseData = {
                    "type": "text",
                    "id_element": id_element,
                    "id_previous": null,
                    "text": "Aucune formation disponible pour le moment."
                };
            }
            console.log("✅ Réponse envoyée:");
            console.log(JSON.stringify(responseData, null, 2));
            console.log("=========================================");
            return res.status(200).json(responseData); 

        } catch (error) {
            console.error("❌ Erreur dans /academy/cours:", error);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    });

    app.post('/academy/formations', async function (req, res) {
        console.log("=========================================");
        console.log("📥 [POST /academy/formations] Payload reçu:");
        console.log(JSON.stringify(req.body, null, 2));

        try {
            const datas = req.body.datas || [];
            const botData = datas.find(d => d.idvariable === "idbot");
            
            if (!botData || !botData.value) {
                console.log("❌ Aucun idbot trouvé dans le payload");
                return res.status(400).json({ success: false, error: "Missing idbot in payload" });
            }

            const idbot = botData.value;
            console.log(`🔍 Recherche de l'admin avec idbot: ${idbot}`);

            await Mongo.connect();
            
            const adminData = await Mongo.findAdminPeeloAcademy({ idbot: idbot });
            
            if (!adminData || adminData.length === 0) {
                console.log("❌ Aucun administrateur trouvé avec cet idbot");
                return res.status(404).json({ success: false, error: "Admin not found with this idbot" });
            }

            const adminId = adminData[0]._id.toString();
            console.log(`✅ Admin trouvé: ${adminData[0].email} (ID: ${adminId})`);

            const queryFormations = { owner_admin_id: adminId };
            
            console.log(`🔍 Recherche des formations (collections formations) pour l'admin:`, queryFormations);
            const formations = await Mongo.listPeeloFormations(queryFormations);
            
            console.log(`✅ ${formations.length} formations trouvées. Structure complète:`);
            console.log(JSON.stringify(formations, null, 2));
            console.log("=========================================");

            const truncateTitles = (list, maxLength) => {
                return list.map(item => {
                    let formatted = { ...item };
                    if (formatted.title && formatted.title.length > maxLength) {
                        formatted.title = formatted.title.substring(0, maxLength) + '...';
                    }
                    return formatted;
                });
            };

            const id_element = "list_" + Math.random().toString(36).substr(2, 9);
            let responseData = {};

            if (formations && formations.length > 0) {
                const treated_Formations = truncateTitles(formations, 24);
                const sections_row = treated_Formations.map((formation) => {
                    let desc = formation.description ? formation.description.substring(0, 60) : `Formation ${formation.title}`;
                    if (desc.length === 60) desc += "...";
                    
                    return {
                        id: `Formation_${formation._id.toString()}`,
                        title: formation.title,
                        description: desc
                    };
                });  
                
                responseData = {
                    "type": "list",
                    "id_element": id_element,
                    "id_previous": null,
                    "interactive": {
                        "type": "list",
                        "header": {
                            "type": "text",
                            "text": "Formations disponibles"
                        },
                        "body": {
                            "text": "La liste des formations disponibles"
                        },
                        "footer": {
                            "text": "Choisissez une formation pour commencer"
                        },
                        "action": {
                            "button": "Démarrer",
                            "sections": [
                                {
                                    "title": "Les formations",
                                    "rows": sections_row
                                }
                            ]
                        }
                    }
                };
            } else {
                responseData = {
                    "type": "text",
                    "id_element": id_element,
                    "id_previous": null,
                    "text": "Aucune formation disponible pour le moment."
                };
            }
            console.log("✅ Réponse envoyée:");
            console.log(JSON.stringify(responseData, null, 2));
            console.log("=========================================");
            return res.status(200).json(responseData); 

        } catch (error) {
            console.error("❌ Erreur dans /academy/formations:", error);
            return res.status(500).json({ success: false, error: "Internal server error" });
        }
    });

    // ==========================================
    // HELPERS FOR ACADEMY DEFAULT ANSWER
    // ==========================================

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

    function countTrueAnswers(answers) {
        const trueAnswersCount = answers.filter(answer => answer.answer === 'true').length;
        return `${trueAnswersCount}`;
    }

    async function createNoteStorage(datas, currentQuizz) {
        let newTest = {
            "quizId": currentQuizz._id,
            "userId": ObjectID(datas.id_user),
            "answers": [],
            "score": 0
        };
        try {
            await Mongo.connect();
            return await Mongo.createQuizTest(newTest);
        } catch (errorit) {
            console.log('Erreur création du test', errorit);
        }
    }

    const transformAnswerToButtons = (answer, verite, nextQuestionExist, idNextQuestion, lastLastRecord) => {
        let textAnswer = replaceGoodAnswer(answer, verite);
        let flow = [];
        let randomiz = generateRandomString(24);
        let newtext = nextQuestionExist ?
            {
                "type": "text_button",
                "id_element": "659816a89f5a6dc6bc104da5_65da381616a67091aa91e584_text_answer",
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                "message": textAnswer,
                "buttons": [{ "id": idNextQuestion, "title": "Question suivante ➡" }]
            }
            :
            {
                "type": "text",
                "id_element": "659816a89f5a6dc6bc104da5_65da381616a67091aa91e584_text_answer",
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                "message": textAnswer,
                "preview_url": true
            };

        if(answer && answer.audio) {
            flow.push({
                "type": "audio",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_audio_answer`,
                "id_previous": null,
                "link": answer.audio
            });
            flow.push({
                "type": "delay",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_audio_answer`,
                "timmer": 2
            });
        }

        flow.push(newtext);

        if (!nextQuestionExist) {
            let score = countTrueAnswers(lastLastRecord.answers);
            const Redo = `Quiz_${lastLastRecord.quizId}`;
            flow.push({
                "type": "text_button",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_text_score`,
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer`,
                "message": `Vous avez trouvé ${score} questions sur ${lastLastRecord.answers.length}. Ce qui vous fait un score de ✚ ${score}`,
                "buttons": [
                    { "id": Redo, "title": "⏎ Refaire le quiz" },
                    { "id": 'get_current_menu', "title": "🛖 Retourner au menu" }
                ]
            });
            flow.push({
                "type": "redirection",
                "id_element": "redirection_for_sharing",
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_text_score`,
                "redirection_block": `send_contact_name`
            });
        }
        return flow;
    }

    const transformQuestionToButtons = (question, idquiz, keyquestion) => {
        let flow = [];
        let randomiz = generateRandomString(24);
        let incrementit = parseInt(keyquestion) + 1;
        
        flow.push({
            "type": "variable_insert",
            "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_variableinsert_${generateRandomString(6)}`,
            "id_previous": null,
            "variable": { "id": "current_quizz", "value": idquiz }
        });
        flow.push({
            "type": "variable_insert",
            "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_variableinsert_${generateRandomString(6)}`,
            "id_previous": null,
            "variable": { "id": "current_question", "value": keyquestion }
        });
        flow.push({
            "type": "variable_insert",
            "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_variableinsert_${generateRandomString(6)}`,
            "id_previous": null,
            "variable": { "id": "next_question", "value": `NQ_${idquiz}_${incrementit}` }
        });

        if (question.image) {
            flow.push({
                "type": "image",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_image_knsmh2ghWhJK`,
                "id_previous": null,
                "link": question.image
            });
            flow.push({
                "type": "delay",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_TceWGEF1RkTU`,
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_image_knsmh2ghWhJK`,
                "timmer": 2
            });
        }

        if (question.audio) {
            flow.push({
                "type": "audio",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_audio_hqgujN8bx8R6`,
                "id_previous": question.image ? `659816a89f5a6dc6bc104da5_${randomiz}_delay_TceWGEF1RkTU` : null,
                "link": question.audio
            });
            flow.push({
                "type": "delay",
                "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_BceFHGF1RkTU`,
                "id_previous": `659816a89f5a6dc6bc104da5_${randomiz}_audio_hqgujN8bx8R6`,
                "timmer": 2
            });
        }

        const stringQuiz = `Q_${idquiz}_${keyquestion}_`;
        const transformedButtons = translateButton(question.buttons, stringQuiz);
        flow.push({
            "type": "text_button",
            "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_text_button_hqgujN8bx8R6`,
            "id_previous": question.audio ? `659816a89f5a6dc6bc104da5_${randomiz}_delay_BceFHGF1RkTU` : (question.image ? `659816a89f5a6dc6bc104da5_${randomiz}_delay_TceWGEF1RkTU` : null),
            "message": question.text,
            "buttons": transformedButtons
        });

        return flow;
    }

    function tranformChapterToElementBot(the_chapter, coursId) {
        let flow = [];
        let randomiz = generateRandomString(24);
        let keyimage = null;
        let id_previous = null;

        if (the_chapter.chapter) {
            let chapter = the_chapter.chapter;
            for (let keyEOC = 0; keyEOC < chapter.length; keyEOC++) {
                id_previous = (keyEOC - 1 >= 0) ? flow[flow.length - 1].id_element : null;

                if (_.has(chapter[keyEOC], "text")) {
                    flow.push({
                        "type": "text",
                        "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_text_${generateRandomString(6)}`,
                        "id_previous": id_previous,
                        "message": chapter[keyEOC].text
                    });
                }
                if (_.has(chapter[keyEOC], "image") && chapter[keyEOC].image) {
                    id_previous = flow.length > 0 ? flow[flow.length - 1].id_element : null;
                    keyimage = `659816a89f5a6dc6bc104da5_${randomiz}_image_${generateRandomString(6)}`;
                    flow.push({
                        "type": "image",
                        "id_element": keyimage,
                        "id_previous": id_previous,
                        "link": chapter[keyEOC].image
                    });
                    flow.push({
                        "type": "delay",
                        "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer_${generateRandomString(4)}`,
                        "id_previous": keyimage,
                        "timmer": 2
                    });
                }
                if (_.has(chapter[keyEOC], "video") && chapter[keyEOC].video) {
                    id_previous = flow.length > 0 ? flow[flow.length - 1].id_element : null;
                    keyimage = `659816a89f5a6dc6bc104da5_${randomiz}_video_${generateRandomString(6)}`;
                    flow.push({
                        "type": "video",
                        "id_element": keyimage,
                        "id_previous": id_previous,
                        "link": chapter[keyEOC].video
                    });
                    flow.push({
                        "type": "delay",
                        "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer_${generateRandomString(4)}`,
                        "id_previous": keyimage,
                        "timmer": 2
                    });
                }
                if (_.has(chapter[keyEOC], "audio") && chapter[keyEOC].audio) {
                    id_previous = flow.length > 0 ? flow[flow.length - 1].id_element : null;
                    keyimage = `659816a89f5a6dc6bc104da5_${randomiz}_audio_answer_${generateRandomString(6)}`;
                    flow.push({
                        "type": "audio",
                        "id_element": keyimage,
                        "id_previous": id_previous,
                        "link": chapter[keyEOC].audio
                    });
                    flow.push({
                        "type": "delay",
                        "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer_${generateRandomString(4)}`,
                        "id_previous": keyimage,
                        "timmer": 2
                    });
                }
            }
            return flow;
        }
    }

    function transformSectionToElementBot(elements, coursId, keychapter) {
        let flow = [];
        let randomiz = generateRandomString(24);
        let keyimage = null;
        let id_previous = null;

        if (elements[keychapter] && elements[keychapter].chapter) {
            let chapter = elements[keychapter].chapter;
            for (let keyEOC = 0; keyEOC < chapter.length; keyEOC++) {
                id_previous = flow.length > 0 ? flow[flow.length - 1].id_element : null;

                flow.push({
                    "type": "variable_insert",
                    "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_variableinsert_${generateRandomString(6)}`,
                    "id_previous": null,
                    "variable": { "id": "current_cours", "value": coursId }
                });

                if (_.has(chapter[keyEOC], "text")) {
                    flow.push({
                        "type": "text",
                        "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_text_${generateRandomString(6)}`,
                        "id_previous": id_previous,
                        "message": chapter[keyEOC].text
                    });
                }
                if (_.has(chapter[keyEOC], "image") && chapter[keyEOC].image) {
                    id_previous = flow.length > 0 ? flow[flow.length - 1].id_element : null;
                    keyimage = `659816a89f5a6dc6bc104da5_${randomiz}_image_${generateRandomString(6)}`;
                    flow.push({
                        "type": "image",
                        "id_element": keyimage,
                        "id_previous": id_previous,
                        "link": chapter[keyEOC].image
                    });
                    flow.push({
                        "type": "delay",
                        "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer_${generateRandomString(4)}`,
                        "id_previous": keyimage,
                        "timmer": 2
                    });
                }
                if (_.has(chapter[keyEOC], "video") && chapter[keyEOC].video) {
                    id_previous = flow.length > 0 ? flow[flow.length - 1].id_element : null;
                    keyimage = `659816a89f5a6dc6bc104da5_${randomiz}_video_${generateRandomString(6)}`;
                    flow.push({
                        "type": "video",
                        "id_element": keyimage,
                        "id_previous": id_previous,
                        "link": chapter[keyEOC].video
                    });
                    flow.push({
                        "type": "delay",
                        "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer_${generateRandomString(4)}`,
                        "id_previous": keyimage,
                        "timmer": 2
                    });
                }
                if (_.has(chapter[keyEOC], "audio") && chapter[keyEOC].audio) {
                    id_previous = flow.length > 0 ? flow[flow.length - 1].id_element : null;
                    keyimage = `659816a89f5a6dc6bc104da5_${randomiz}_audio_answer_${generateRandomString(6)}`;
                    flow.push({
                        "type": "audio",
                        "id_element": keyimage,
                        "id_previous": id_previous,
                        "link": chapter[keyEOC].audio
                    });
                    flow.push({
                        "type": "delay",
                        "id_element": `659816a89f5a6dc6bc104da5_${randomiz}_delay_answer_${generateRandomString(4)}`,
                        "id_previous": keyimage,
                        "timmer": 2
                    });
                }
            }
        }
        return flow;
    }

    function pushButtonQuizAssociate(cours) {
        if (!_.isNull(cours.quizz_associated) && cours.quizz_associated !== undefined) {
            let textAnswer = `Cliquez sur le bouton ci-dessous pour faire le quiz '${cours.title || ''}' qui correspond à ce chapitre`;
            let idNextQuestion = `Quiz_${cours.quizz_associated}`;
            return {
                "type": "text_button",
                "id_element": `659816a89f5a6dc6bc104da5_${cours.quizz_associated}_text_answer`,
                "id_previous": null,
                "message": textAnswer,
                "buttons": [ { "id": idNextQuestion, "title": "Faire le quiz" } ]
            };
        }
    }

    function pushButtonNext(coursid, nextChap = 1) {
        let textAnswer = 'Cliquez sur le bouton ci-dessous pour poursuivre';
        let idNextQuestion = `NC_${coursid}_CH_${nextChap}`;
        return {
            "type": "text_button",
            "id_element": `659816a89f5a6dc6bc104da5_${generateRandomString(6)}_text_answer`,
            "id_previous": null,
            "message": textAnswer,
            "buttons": [ { "id": idNextQuestion, "title": "Continuer ➡" } ]
        };
    }

    // Hybrid search for Quizz (Peelo -> Autoecole)
    async function startsWithFallback(datas) {
        if (_.startsWith(datas.last_input, 'Quiz_')) {
            const quizId = datas.last_input.substring(5);
            try {
                await Mongo.connect();
                let QuizzFound = await Mongo.findQuizz({ _id: ObjectID(quizId) }, 'quizz_peelo_academy');
                if (!QuizzFound || QuizzFound.length === 0) {
                    QuizzFound = await Mongo.findQuizz({ _id: ObjectID(quizId) }, 'autoecoles_quizz');
                }
                
                if (QuizzFound && QuizzFound.length) {
                    await createNoteStorage(datas, QuizzFound[0]);
                    const listQuizz = QuizzFound[0].list_quizz;
                    return transformQuestionToButtons(listQuizz[0], quizId, 0);
                }
            } catch (errorit) {
                console.log('Erreur startsWithFallback:', errorit);
            }
        }
    }

    // Hybrid search for Courses (Peelo -> Autoecole)
    async function treatmentCoursFallback_(datas) {
        const coursId = datas.last_input.substring(6); 
        try {
            await Mongo.connect();
            let CoursFound = await Mongo.listCourses({ _id: ObjectID(coursId) }, 'courses_peelo_academy');
            if (!CoursFound || CoursFound.length === 0) {
                CoursFound = await Mongo.listCourses({ _id: ObjectID(coursId) }, 'autoecoles_courses');
            }

            if (CoursFound && CoursFound.length) {
                const Chapiters = CoursFound[0].Sections;
                const flow = transformSectionToElementBot(Chapiters, coursId, 0);
                if (Chapiters.length > 1) {
                    flow.push(pushButtonNext(coursId));
                } else {
                    const quizBtn = pushButtonQuizAssociate(CoursFound[0]);
                    if (quizBtn) flow.push(quizBtn);
                }
                return flow;
            }
        } catch (errorit) {
            console.log('Erreur treatmentCoursFallback_:', errorit);
        }
    }

    // Hybrid search for Chapter (Peelo -> Autoecole)
    async function treatmentChapterFallback_(coursId, chapterIndex) {
        try {
            await Mongo.connect();
            let CoursFound = await Mongo.listCourses({ _id: ObjectID(coursId) }, 'courses_peelo_academy');
            if (!CoursFound || CoursFound.length === 0) {
                CoursFound = await Mongo.listCourses({ _id: ObjectID(coursId) }, 'autoecoles_courses');
            }

            if (CoursFound && CoursFound.length) {
                chapterIndex = parseInt(chapterIndex);
                if (chapterIndex <= CoursFound[0].Sections.length) {
                    const flow = tranformChapterToElementBot(CoursFound[0].Sections[chapterIndex], coursId);
                    if (chapterIndex + 1 < CoursFound[0].Sections.length) {
                        flow.push(pushButtonNext(coursId, chapterIndex + 1));
                    } else {
                        const quizBtn = pushButtonQuizAssociate(CoursFound[0]);
                        if (quizBtn) flow.push(quizBtn);
                    }
                    return flow;
                }
            }
        } catch (errorit) {
            console.log('Erreur treatmentChapterFallback_:', errorit);
        }
    }


    // ==========================================
    // ACADEMY DEFAULT ANSWER ENDPOINT
    // ==========================================

    app.post('/academy/default/answer', async (req, res) => {
        console.log('✅ ROUTE CALLED: /academy/default/answer');
        console.log(JSON.stringify(req.body, null, 2));
        
        try {
            await Mongo.connect();

            // Prevent crash if undefined
            if (!req.body.datas) {
                console.log('⚠️ WARNING: req.body.datas is missing/undefined!');
                return res.status(400).send([]);
            }

            const extractedData = extractData(req.body.datas);
            
            console.log('✅ EXTRACTED DATA:', JSON.stringify(extractedData, null, 2));

            const { datas, lastInputType } = extractedData;

            if (lastInputType === 'list_reply') {

                // ---- QUIZ ----
                if (_.startsWith(datas.last_input, 'Quiz_')) {
                    const quizId = datas.last_input.substring(5);
                    try {
                        let QuizzFound = await Mongo.findQuizz({ _id: ObjectID(quizId) }, 'quizz_peelo_academy');
                        if (!QuizzFound || QuizzFound.length === 0) {
                            QuizzFound = await Mongo.findQuizz({ _id: ObjectID(quizId) }, 'autoecoles_quizz');
                        }

                        if (QuizzFound && QuizzFound.length) {
                            let isTestCreated = await createNoteStorage(datas, QuizzFound[0]);
                            const listQuizz = QuizzFound[0].list_quizz;
                            const flow = transformQuestionToButtons(listQuizz[0], quizId, 0);
                            
                            console.log('✅ RESPONSE FROM POST /academy/default/answer (QUIZ):', JSON.stringify(flow, null, 2));
                            return res.status(200).send(flow);
                        }
                    } catch (errorit) {
                        console.log('Error executing Quiz list_reply logic:', errorit);
                    }
                }

                // ---- COURS ----
                if (_.startsWith(datas.last_input, 'Cours_')) {
                    let the_flow = await treatmentCoursFallback_(datas);
                    console.log('✅ RESPONSE FROM POST /academy/default/answer (COURS):', JSON.stringify(the_flow, null, 2));
                    return res.status(200).send(the_flow || []);
                }
                
                // ---- FORMATION ----
                if (_.startsWith(datas.last_input, 'Formation_')) {
                    const formationId = datas.last_input.substring(10);
                    try {
                        // On va chercher dans courses_peelo_academy les cours qui ont cet ID de formation
                        let coursesFound = await Mongo.listCourses({ formation_id: formationId }, 'courses_peelo_academy');
                        
                        console.log('✅ Courses found for formation:', coursesFound.length);
                        
                        if (coursesFound && coursesFound.length > 0) {
                            const truncateTitles = (list, maxLength) => {
                                return list.map(item => {
                                    let formatted = { ...item };
                                    if (formatted.title && formatted.title.length > maxLength) {
                                        formatted.title = formatted.title.substring(0, maxLength) + '...';
                                    }
                                    return formatted;
                                });
                            };

                            const treated_Courses = truncateTitles(coursesFound, 24);
                            const sections_row = treated_Courses.map((cours) => {
                                return {
                                    id: `Cours_${cours._id.toString()}`,
                                    title: cours.title,
                                    description: `Ce cours a ${cours.number_chapter || 0} chapitre ${(cours.number_chapter || 0) > 1 ? 's' : ''}`
                                };
                            });  
                            
                            const id_element = "list_" + Math.random().toString(36).substr(2, 9);
                            let responseData = {
                                "type": "list",
                                "id_element": id_element,
                                "id_previous": null,
                                "interactive": {
                                    "type": "list",
                                    "header": { "type": "text", "text": "Cours de la formation" },
                                    "body": { "text": "Voici les cours de cette formation" },
                                    "footer": { "text": "Choisissez un cours pour commencer" },
                                    "action": {
                                        "button": "Démarrer",
                                        "sections": [{ "title": "Les cours", "rows": sections_row }]
                                    }
                                }
                            };
                            return res.status(200).send(responseData);
                        } else {
                            // Aucune formation n'a de cours associés
                            const id_element = "list_" + Math.random().toString(36).substr(2, 9);
                            return res.status(200).send({
                                "type": "text",
                                "id_element": id_element,
                                "id_previous": null,
                                "text": "Aucun cours n'est encore disponible pour cette formation."
                            });
                        }
                    } catch(err) {
                        console.log('Error executing Formation list_reply logic:', err);
                    }
                }
            }

            if (lastInputType === 'button_reply') {

                if (_.startsWith(datas.last_input, 'Quiz_')) {
                    let flow = await startsWithFallback(datas);
                    console.log('button_reply ===> Quiz_ ======>', flow);
                    return res.status(200).send(flow);
                }

                // on gère les réponses aux quizz
                if (_.startsWith(datas.last_input, 'Q_')) {
                    let parts = _.split(datas.last_input, '_');
                    const quizId = parts[1];
                    const niveauquestion = parseInt(parts[2]);
                    const value = parts[3];
                    const niveauButton = parseInt(parts[4]);

                    try {
                        let QuizzFound = await Mongo.findQuizz({ _id: ObjectID(quizId) }, 'quizz_peelo_academy');
                        if (!QuizzFound || QuizzFound.length === 0) {
                            QuizzFound = await Mongo.findQuizz({ _id: ObjectID(quizId) }, 'autoecoles_quizz');
                        }

                        if (QuizzFound && QuizzFound.length) {
                            const listQuizz = QuizzFound[0].list_quizz;
                            const TheQuestion = listQuizz[niveauquestion];
                            let ButtonClicked = TheQuestion.buttons[niveauButton];

                            let nextQuestionExist = (listQuizz.length - 1) >= (niveauquestion + 1) ? true : false;
                            const idNextQuestion = `NQ_${quizId}_${niveauquestion + 1}`;

                            const condition = { $and: [{ quizId: ObjectID(quizId) }, { userId: ObjectID(datas.id_user) }] };
                            let lastRecord = await Mongo.getLastTestRecord(condition);

                            if (lastRecord && lastRecord.length) {
                                let afterpus = await Mongo.pushAnswerToTest(lastRecord[0], {
                                    "questionId": niveauquestion,
                                    "answer": ButtonClicked.value,
                                    "title": ButtonClicked.title
                                });
                                let flowAnswer = await transformAnswerToButtons(TheQuestion.answer, ButtonClicked.value, nextQuestionExist, idNextQuestion, afterpus[0]);
                                return res.status(200).send(flowAnswer);
                            }
                        }
                    } catch (errorit) {
                        console.log('Erreur Q_ execution', errorit);
                    }
                }

                // on gère l'affichage de la réponse suivante si il y en a 
                if (_.startsWith(datas.last_input, 'NQ_')) {
                    let parts = _.split(datas.last_input, '_');
                    const quizId = parts[1];
                    const niveauquestion = parseInt(parts[2]);

                    try {
                        let QuizzFound = await Mongo.findQuizz({ _id: ObjectID(quizId) }, 'quizz_peelo_academy');
                        if (!QuizzFound || QuizzFound.length === 0) {
                            QuizzFound = await Mongo.findQuizz({ _id: ObjectID(quizId) }, 'autoecoles_quizz');
                        }

                        if (QuizzFound && QuizzFound.length) {
                            const listQuizz = QuizzFound[0].list_quizz;
                            const TheQuestion = listQuizz[niveauquestion];
                            const flow = transformQuestionToButtons(TheQuestion, quizId, niveauquestion);
                            return res.status(200).send(flow);
                        }
                    } catch (errorit) {
                        console.log('Erreur NQ_ execution', errorit);
                    }
                }

                if (_.startsWith(datas.last_input, 'NC_')) {
                    const parts = datas.last_input.split('_');
                    const idcours = parts[1];
                    const chapterIndex = parts[3];

                    const flow = await treatmentChapterFallback_(idcours, chapterIndex);
                    return res.status(200).send(flow || []);
                }
            }

            if (lastInputType === 'text') {
                return res.status(200).send({
                    "type": "redirection",
                    "id_element": "",
                    "id_previous": "",
                    "redirection_block": "get_current_menu"
                });
            }

            // Safety Fallback if no condition matched
            if (!res.headersSent) {
                console.log('⚠️ [academy] No specific handler matched. Sending default empty response.');
                return res.status(200).send([]);
            }

        } catch (errorit) {
            console.log('Erreur serveur dans /academy/default/answer', errorit);
            if (!res.headersSent) {
                return res.status(500).send([]);
            }
        }
    });

};
