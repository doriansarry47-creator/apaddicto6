#!/usr/bin/env node

import fetch from 'node-fetch';

async function testExercisesAPI() {
  const baseURL = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5000';
  console.log('🌐 Testing exercises API at:', baseURL);
  
  try {
    const response = await fetch(`${baseURL}/api/exercises`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Status:', response.status);
    console.log('📊 Status Text:', response.statusText);
    
    if (response.ok) {
      const exercises = await response.json();
      console.log(`✅ ${exercises.length} exercice(s) récupéré(s)`);
      
      if (exercises.length > 0) {
        console.log('\n🔍 Premier exercice:');
        console.log(JSON.stringify(exercises[0], null, 2));
      }
    } else {
      const error = await response.text();
      console.error('❌ Erreur:', error);
    }
  } catch (error) {
    console.error('❌ Erreur de requête:', error.message);
  }
}

testExercisesAPI();