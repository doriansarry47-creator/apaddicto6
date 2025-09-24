#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Vérification des icônes Lucide React disponibles...\n');

// Vérifier les icônes disponibles dans la version installée
try {
  const lucideReact = require('lucide-react');
  const availableIcons = Object.keys(lucideReact);
  
  console.log(`📦 Lucide React version: ${require('./node_modules/lucide-react/package.json').version}`);
  console.log(`🎯 Total d'icônes disponibles: ${availableIcons.length}\n`);
  
  // Vérifier les icônes spécifiques mentionnées dans l'erreur
  const searchedIcons = ['FitnessCenter', 'Psychology', 'Lightbulb', 'School', 'Tag'];
  
  console.log('🔍 État des icônes recherchées:');
  searchedIcons.forEach(icon => {
    const available = availableIcons.includes(icon);
    console.log(`  ${icon}: ${available ? '✅ Disponible' : '❌ Non disponible'}`);
  });
  
  // Suggestions d'alternatives
  console.log('\n💡 Alternatives suggérées:');
  console.log('  FitnessCenter → Activity, Dumbbell, Zap');
  console.log('  Psychology → Brain, User, Heart');
  console.log('  Lightbulb → ✅ Disponible');
  console.log('  School → GraduationCap, BookOpen, Users');
  console.log('  Tag → ✅ Disponible');
  
  // Chercher des alternatives fitness
  const fitnessAlternatives = availableIcons.filter(icon => 
    icon.toLowerCase().includes('activity') || 
    icon.toLowerCase().includes('heart') ||
    icon.toLowerCase().includes('dumbbell') ||
    icon.toLowerCase().includes('zap') ||
    icon.toLowerCase().includes('target')
  );
  
  console.log('\n🏃‍♂️ Icônes fitness alternatives disponibles:');
  fitnessAlternatives.forEach(icon => {
    console.log(`  - ${icon}`);
  });
  
  // Chercher des alternatives psychology
  const psychologyAlternatives = availableIcons.filter(icon => 
    icon.toLowerCase().includes('brain') || 
    icon.toLowerCase().includes('user') ||
    icon.toLowerCase().includes('mind') ||
    icon.toLowerCase().includes('head')
  );
  
  console.log('\n🧠 Icônes psychology alternatives disponibles:');
  psychologyAlternatives.forEach(icon => {
    console.log(`  - ${icon}`);
  });
  
} catch (error) {
  console.log('❌ Erreur lors du chargement de lucide-react:', error.message);
}

console.log('\n✨ Vérification terminée!');