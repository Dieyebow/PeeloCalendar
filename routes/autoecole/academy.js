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

};
