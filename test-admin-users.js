#!/usr/bin/env node

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const BASE_URL = 'https://5000-i12r6csi0kgicy6yox0w7-6532622b.e2b.dev';

async function testAdminUsers() {
  console.log('🚀 Test de la gestion des utilisateurs admin');
  
  // 1. Connexion admin
  console.log('👤 Connexion admin...');
  const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'doriansarry@yahoo.fr',
      password: 'admin123'
    })
  });

  const loginData = await loginResponse.json();
  const cookies = loginResponse.headers.get('set-cookie');
  
  if (loginResponse.ok) {
    console.log('✅ Connexion admin réussie');
  } else {
    console.error('❌ Connexion admin échouée:', loginData);
    return;
  }

  // 2. Test récupération des utilisateurs
  console.log('👥 Test récupération des utilisateurs...');
  const usersResponse = await fetch(`${BASE_URL}/api/admin/users`, {
    method: 'GET',
    headers: { 'Cookie': cookies }
  });

  const usersData = await usersResponse.json();
  
  if (usersResponse.ok) {
    console.log('✅ Récupération utilisateurs OK');
    console.log(`📊 Nombre d'utilisateurs: ${usersData.length}`);
    
    usersData.forEach((user, index) => {
      console.log(`👤 Utilisateur ${index + 1}:`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Nom: ${user.firstName} ${user.lastName}`);
      console.log(`   - Rôle: ${user.role}`);
      console.log(`   - Exercices: ${user.exerciseCount}`);
      console.log(`   - Cravings: ${user.cravingCount}`);
      console.log(`   - Inscription: ${new Date(user.createdAt).toLocaleDateString('fr-FR')}`);
      console.log('');
    });
    
    console.log('✅ Test admin terminé avec succès');
  } else {
    console.error('❌ Erreur récupération utilisateurs:', usersData);
  }
}

testAdminUsers().catch(console.error);