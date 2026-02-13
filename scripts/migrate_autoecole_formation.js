
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

// Import the URI from the project config
const config = require('../configs/mongodb');
const uri = config.uri;
const dbName = 'peelo';

async function migrate() {
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

    try {
        await client.connect();
        console.log('Connected to MongoDB');
        const db = client.db(dbName);

        // 1. Check/Create "Generic Autoecole" Formation
        const formationsCollection = db.collection('formations_peelo_academy');
        let autoecoleFormation = await formationsCollection.findOne({ title: "Formation Auto-école" });

        if (!autoecoleFormation) {
            console.log('Creating "Formation Auto-école"...');
            const result = await formationsCollection.insertOne({
                title: "Formation Auto-école",
                description: "Formation standard pour les auto-écoles",
                status: "active",
                created_at: new Date(),
                owner_admin_id: null // System owned or assign to a super admin if known
            });
            autoecoleFormation = { _id: result.insertedId, title: "Formation Auto-école" };
            console.log(`Created formation with ID: ${autoecoleFormation._id}`);
        } else {
            console.log(`Found existing "Formation Auto-école" with ID: ${autoecoleFormation._id}`);
        }

        // 2. Update autoecoles_courses
        const coursesCollection = db.collection('autoecoles_courses');
        const updateResult = await coursesCollection.updateMany(
            {}, // Match all documents in this collection
            {
                $set: {
                    formation_id: autoecoleFormation._id.toString(), // Store as string to match standard
                    formation_title: autoecoleFormation.title
                }
            }
        );

        console.log(`Updated ${updateResult.modifiedCount} courses in autoecoles_courses.`);

        // 3. Update autoecoles_quizz (Optional, as they might not be directly linked to formation same way)
        // But user asked to "tag" them. Let's see if quizzes have formation_id usually.
        // Standard courses have formation_id. Quizzes usually don't have formation_id directly unless linked to a course.
        // However, user said "clique sur quizz ... affiche tous les quizz wave le tag de la formation".
        // This implies UI needs to show which formation a quiz belongs to.
        // In the standard system, are quizzes linked to formations?
        // Usually Quizzes are standalone or linked to courses.
        // Let's at least tag them so we can identify them if needed, or if the UI uses formation_title.
        // The user request "tager toutes les cours autoecoles ... et aussi les quizz wave le tag de la formation".
        // It seems they want quizzes to also be associated with this "Autoecole" formation.

        const quizzCollection = db.collection('autoecoles_quizz');
        const quizzUpdateResult = await quizzCollection.updateMany(
             {},
             {
                 $set: {
                     formation_id: autoecoleFormation._id.toString(),
                     formation_title: "Formation Auto-école" // Assuming we want this tag
                 }
             }
        );
        console.log(`Updated ${quizzUpdateResult.modifiedCount} quizzes in autoecoles_quizz.`);


    } catch (err) {
        console.error('Migration failed:', err);
    } finally {
        await client.close();
        console.log('Disconnected from MongoDB');
    }
}

migrate();
