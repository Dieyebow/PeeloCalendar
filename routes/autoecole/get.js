module.exports = (_, app, axios, Mongo, ObjectID, authenticateToken) => {

    app.get('/get/list/quiz',authenticateToken, async (req, res) => {

        console.log('/get/list/quiz');

        try {

            const connexion = await Mongo.connect();
            const listQuizz =  await Mongo.listQuizz()
            return res.status(200).send({
                listQuiz: listQuizz
            });

 
        } catch (errorit) {
            console.log('nous avons une erreur dans l execution',);
        }

    });

    app.get('/get/small/list/quiz',authenticateToken, async (req, res) => {
        try {

            const connexion = await Mongo.connect();
            const listQuizz =  await Mongo.findLiteListQuizz()
            return res.status(200).send({
                listQuiz: listQuizz
            });

 
        } catch (errorit) {
            console.log('nous avons une erreur dans l execution',);
        }


    });

    app.get('/get/list/user/pagination/limit', async (req, res) => {
   
        
        try {

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const skip = (page - 1) * limit;

           console.log('page  ',page);
           console.log('limit  ',limit);
           console.log('skip  ',skip);

           const connexion =  await Mongo.connect();
           const listUsers =  await Mongo.findAutoEcolePagination(skip,limit );
          
           return res.status(200).send({
            listUsers: listUsers
           });

        } catch (errorit) {
            console.log('nous avons une erreur dans l execution',errorit);
        }

    });

    
        app.get('/get/list/courses',authenticateToken, async (req, res) => {

 
        try {

            const connexion = await Mongo.connect();
            const listCourses =  await Mongo.listCourses()

            console.log('listCourses ====> ',listCourses);
            
            return res.status(200).send({
                listCourses: listCourses
            });

 
        } catch (errorit) {
            console.log('nous avons une erreur dans l execution',errorit);
        }

    });
    

    // le nombre de message envoye par jour par utilisateur et par bot


   app.get('/get/exchange/:idbot',async(req,res)=>{

     const {idbot} = req.params;
       
     try {

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        console.log('page ===>',page);
        console.log('limit ===>',limit);
        console.log('skip ===>', skip);


        const connexion  = await Mongo.connect();
        const elevesList =  await Mongo.numberOfexchangePerDate(idbot,skip,limit);
        
        console.log('________________________________');
        console.log('elevesList ==>',elevesList.length);
        console.log('________________________________');

        return res.status(200).send({
            eleveList: elevesList
        });

    } catch (errorit) {
        console.log('nous avons une erreur dans l execution',errorit);
    }

    
   });

     //KPIS DONE ZERRR

    app.get('/get/list/kpis',async(req,res)=>{
      console.log('/get/list/kpis')
        try {
            const idbot = '659816a89f5a6dc6bc104da5';
            const connexion = await Mongo.connect();

            const elevesList =  await Mongo.countElevesAutoEcole();
            const NonPermis = await Mongo.countElevesNonPermis();
            const DailyActiveUser = await Mongo.countDailyActiveUser();
            console.log('DailyActiveUser ==>',DailyActiveUser);
            const userBot =  await Mongo.countUserAutoecole({"idbot": ObjectID(idbot)});


            return res.status(200).send({

                elevesautoecole: elevesList,
                eleveswithnopermis: NonPermis[0]['uniqueCount'],
                dailyactiveuser: DailyActiveUser,
                userBot :  userBot

            });

 
        } catch (errorit) {
            console.log('nous avons une erreur dans l execution',errorit);
        }


    });



}