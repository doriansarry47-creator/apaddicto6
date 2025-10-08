#!/usr/bin/env node

/**
 * TEST SPÉCIFIQUE DU FILTRAGE PAR CATÉGORIE
 */

import fetch from 'node-fetch';

const API_BASE = 'https://3000-i01c1qnwr7w0urd0wd2du-6532622b.e2b.dev';

async function testCategoryFiltering() {
  console.log('🧪 === TEST FILTRAGE PAR CATÉGORIE ===\n');
  
  try {
    // 1. Login patient
    const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'patient@example.com',
        password: 'patient123'
      }),
    });

    if (!loginResponse.ok) {
      console.error('❌ Échec connexion patient');
      return;
    }

    const cookies = loginResponse.headers.raw()['set-cookie']?.map(cookie => cookie.split(';')[0]).join('; ') || '';
    console.log('✅ Patient connecté');

    // 2. Récupérer les catégories
    const categoriesResponse = await fetch(`${API_BASE}/api/content-categories`, {
      headers: { 'Cookie': cookies }
    });
    const categories = await categoriesResponse.json();
    console.log(`📂 ${categories.length} catégories récupérées`);

    // 3. Récupérer tous les contenus publiés
    const allContentsResponse = await fetch(`${API_BASE}/api/educational-contents?status=published`, {
      headers: { 'Cookie': cookies }
    });
    const allContents = await allContentsResponse.json();
    console.log(`📚 ${allContents.length} contenus publiés au total`);

    // 4. Tester le filtrage pour chaque catégorie avec du contenu
    for (const category of categories.slice(0, 5)) {
      const contentsInCategory = allContents.filter(c => c.categoryId === category.id);
      
      if (contentsInCategory.length === 0) {
        console.log(`⏭️  "${category.name}": aucun contenu, skip`);
        continue;
      }

      // Test filtrage API
      const filteredResponse = await fetch(`${API_BASE}/api/educational-contents?status=published&categoryId=${category.id}`, {
        headers: { 'Cookie': cookies }
      });
      const filteredContents = await filteredResponse.json();

      console.log(`🔍 "${category.name}":`);
      console.log(`   • Attendu: ${contentsInCategory.length} contenus`);
      console.log(`   • Reçu: ${filteredContents.length} contenus`);
      
      if (filteredContents.length === contentsInCategory.length) {
        console.log('   ✅ Filtrage correct');
      } else {
        console.log('   ❌ Filtrage incorrect');
        
        // Vérifier que tous les contenus filtrés appartiennent à la bonne catégorie
        const wrongContents = filteredContents.filter(c => c.categoryId !== category.id);
        if (wrongContents.length > 0) {
          console.log(`   • ${wrongContents.length} contenus incorrects inclus`);
        }
      }
    }

    // 5. Test sans filtrage
    const allResponse = await fetch(`${API_BASE}/api/educational-contents?status=published`, {
      headers: { 'Cookie': cookies }
    });
    const allFromAPI = await allResponse.json();
    console.log(`\n📊 Test sans filtrage: ${allFromAPI.length} contenus (attendu: ${allContents.length})`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  }
}

testCategoryFiltering();