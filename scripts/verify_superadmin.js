
const axios = require('axios');
const jwt = require('jsonwebtoken');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
const envPath = path.join(__dirname, '../.env');
dotenv.config({ path: envPath });

const SECRET_KEY = process.env.SECRET_KEY_JWT || 'Grandneuydegeur';
const BASE_URL = 'http://localhost:7568';

// MongoDB Connection
const config = require('../configs/mongodb');
const MongoClient = require('mongodb').MongoClient;
const uri = config.uri;

async function verify() {
    console.log('🔍 Starting Verification...');
    
    let client;
    let token;
    let superAdminUser;

    try {
        // 1. Get Real User
        client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
        await client.connect();
        const db = client.db('peelo');
        
        const email = 'mamadou.dieye@peelo.chat'; // User provided email
        console.log(`👤 Looking up user: ${email}...`);
        
        let user = await db.collection('autoecole_user').findOne({ email: email });
        
        if (!user) {
            console.log(`⚠️ User not found in 'autoecole_user', checking 'users' collection...`);
            user = await db.collection('users').findOne({ email: email });
        }

        if (!user) {
             // Try looking up by 'users' collection with just email if structure is different
             // or maybe 'admin_peelo_academy'
              console.log(`⚠️ User not found in 'users', checking 'admin_peelo_academy'...`);
             user = await db.collection('admin_peelo_academy').findOne({ email: email });
        }
        
        if (!user) {
            throw new Error(`User ${email} not found in any likely collection.`);
        }
        
        console.log(`✅ User found: ${user._id} in collection.`);
        // Ensure role is super_admin for the test logic to work (or at least we simulate it if we are just testing endpoints)
        // usage in endpoint checks: req.user.role === 'super_admin'
        
        superAdminUser = user;
        // Force role in token if database doesn't have it yet, but best to use what's in DB or add it if missing for test
        if (superAdminUser.role !== 'super_admin') {
             console.log('⚠️ Warning: User in DB does not have role "super_admin". verification might fail if endpoint relies on it.');
             // For verification purpose, we can sign the token with super_admin role to test the ENDPOINT logic
             superAdminUser.role = 'super_admin'; 
             console.log('ℹ️ Forcing role="super_admin" in JWT for testing purposes.');
        }

        token = jwt.sign({ user: superAdminUser }, SECRET_KEY, { expiresIn: '1h' });
        console.log(`🔑 Generated Token`);

    } catch (err) {
        console.error('❌ Database Error:', err);
        if (client) await client.close();
        return;
    } finally {
        if (client) await client.close();
    }

    try {
        // 1. Verify Courses
        console.log('\n📚 Verifying /dashboard/courses/list...');
        const coursesRes = await axios.get(`${BASE_URL}/dashboard/courses/list`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        const courses = coursesRes.data.courses;
        console.log(`✅ Status: ${coursesRes.status}`);
        console.log(`📊 Total Courses Fetched: ${courses.length}`);
        
        const autoecoleCourses = courses.filter(c => c.formation_title === 'Formation Auto-école');
        console.log(`🚗 Autoecole Courses Found: ${autoecoleCourses.length}`);
        
        if (autoecoleCourses.length > 0) {
            console.log('✅ Success: Autoecole courses are present.');
        } else {
            console.log('⚠️ Warning: No Autoecole courses found (might be 0 in DB or filter failed).');
        }

        // 2. Verify Quizzes
        console.log('\n📝 Verifying /dashboard/quizz/list...');
        const quizzRes = await axios.get(`${BASE_URL}/dashboard/quizz/list`, {
             headers: { Authorization: `Bearer ${token}` }
        });
        
        // Handle direct array or object response
        const quizzes = Array.isArray(quizzRes.data) ? quizzRes.data : quizzRes.data.quizz || [];
        
        console.log(`✅ Status: ${quizzRes.status}`);
        console.log(`📊 Total Quizzes Fetched: ${quizzes.length}`);

        const autoecoleQuizzes = quizzes.filter(q => q.formation_title === 'Formation Auto-école');
        console.log(`🚗 Autoecole Quizzes Found: ${autoecoleQuizzes.length}`);

         if (autoecoleQuizzes.length > 0) {
            console.log('✅ Success: Autoecole quizzes are present.');
        } else {
             console.log('⚠️ Warning: No Autoecole quizzes found.');
        }

    } catch (error) {
        console.error('❌ Verification Failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', error.response.data);
        }
    }
}

verify();
