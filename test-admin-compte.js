#!/usr/bin/env node
/**
 * Script de test pour le compte admin doriansarry@yahoo.fr
 */

const BASE_URL = 'http://localhost:3000';

async function testAdminAccount() {
  console.log('🔍 Test du compte admin: doriansarry@yahoo.fr\n');

  try {
    // 1. Test de connexion
    console.log('1️⃣  Test de connexion...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'doriansarry@yahoo.fr',
        password: 'admin123'
      })
    });

    if (!loginResponse.ok) {
      console.error('❌ Échec de connexion:', await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Connexion réussie!');
    console.log('   - Utilisateur:', loginData.user.email);
    console.log('   - Rôle:', loginData.user.role);
    console.log('   - ID:', loginData.user.id);

    // Récupérer les cookies de session
    const cookies = loginResponse.headers.get('set-cookie');
    
    // 2. Test de récupération des exercices
    console.log('\n2️⃣  Test de récupération des exercices...');
    const exercisesResponse = await fetch(`${BASE_URL}/api/exercises`, {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (!exercisesResponse.ok) {
      console.error('❌ Échec récupération exercices');
    } else {
      const exercises = await exercisesResponse.json();
      console.log(`✅ ${exercises.length} exercices récupérés`);
    }

    // 3. Test de récupération des séances
    console.log('\n3️⃣  Test de récupération des séances...');
    const sessionsResponse = await fetch(`${BASE_URL}/api/sessions`, {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (!sessionsResponse.ok) {
      const errorText = await sessionsResponse.text();
      console.error('❌ Échec récupération séances:', sessionsResponse.status, errorText);
    } else {
      const sessions = await sessionsResponse.json();
      console.log(`✅ ${sessions.length} séances récupérées`);
      if (sessions.length > 0) {
        console.log('   Séances:');
        sessions.forEach(session => {
          console.log(`   - ${session.title} (${session.category}, ${session.status})`);
        });
      }
    }

    // 4. Test de récupération des patients
    console.log('\n4️⃣  Test de récupération des patients...');
    const patientsResponse = await fetch(`${BASE_URL}/api/admin/patients`, {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (!patientsResponse.ok) {
      const errorText = await patientsResponse.text();
      console.error('❌ Échec récupération patients:', patientsResponse.status, errorText);
    } else {
      const patients = await patientsResponse.json();
      console.log(`✅ ${patients.length} patients récupérés`);
      if (patients.length > 0) {
        console.log('   Patients:');
        patients.forEach(patient => {
          console.log(`   - ${patient.firstName} ${patient.lastName} (${patient.email})`);
        });
      }
    }

    // 5. Test de récupération du contenu éducatif
    console.log('\n5️⃣  Test de récupération du contenu éducatif...');
    const contentResponse = await fetch(`${BASE_URL}/api/educational-contents`, {
      headers: {
        'Cookie': cookies || ''
      }
    });

    if (!contentResponse.ok) {
      console.error('❌ Échec récupération contenu éducatif');
    } else {
      const contents = await contentResponse.json();
      console.log(`✅ ${contents.length} contenus éducatifs récupérés`);
    }

    console.log('\n✨ Tests terminés avec succès!\n');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error.message);
  }
}

// Exécuter les tests
testAdminAccount();
