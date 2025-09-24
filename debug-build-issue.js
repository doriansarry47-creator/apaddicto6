#!/usr/bin/env node

/**
 * Script de débogage pour identifier et corriger les problèmes de build
 * liés aux imports lucide-react
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Débogage des problèmes de build lucide-react...\n');

// Fonction pour lire les fichiers récursivement
function findFilesWithPattern(dir, pattern, results = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      findFilesWithPattern(filePath, pattern, results);
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes(pattern)) {
        results.push({ filePath, content });
      }
    }
  }
  
  return results;
}

// Vérifier les imports lucide-react
console.log('📂 Recherche des imports lucide-react...');
const lucideFiles = findFilesWithPattern('./client/src', 'lucide-react');

console.log(`\n✅ Trouvé ${lucideFiles.length} fichiers utilisant lucide-react:`);
lucideFiles.forEach(({ filePath }) => {
  console.log(`   - ${filePath}`);
});

// Vérifier spécifiquement FitnessCenter
console.log('\n🎯 Recherche de FitnessCenter...');
const fitnessFiles = findFilesWithPattern('./client/src', 'FitnessCenter');

if (fitnessFiles.length === 0) {
  console.log('✅ Aucun import FitnessCenter trouvé dans le code actuel');
} else {
  console.log(`❌ Trouvé ${fitnessFiles.length} fichiers avec FitnessCenter:`);
  fitnessFiles.forEach(({ filePath, content }) => {
    const lines = content.split('\n');
    lines.forEach((line, index) => {
      if (line.includes('FitnessCenter')) {
        console.log(`   ${filePath}:${index + 1} - ${line.trim()}`);
      }
    });
  });
}

// Vérifier le package.json pour lucide-react
console.log('\n📦 Vérification des dépendances...');
const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
const clientPackageJson = JSON.parse(fs.readFileSync('./client/package.json', 'utf8'));

console.log('Versions lucide-react:');
console.log('  Root:', packageJson.dependencies?.['lucide-react'] || 'Non installé');
console.log('  Client:', clientPackageJson.dependencies?.['lucide-react'] || 'Non installé');

// Vérifier les icônes disponibles dans lucide-react
console.log('\n🔍 Vérification des icônes lucide-react disponibles...');
try {
  const lucideReact = await import('lucide-react');
  const availableIcons = Object.keys(lucideReact);
  
  const searchedIcons = ['FitnessCenter', 'Dumbbell', 'Activity', 'Heart'];
  console.log('\nÉtat des icônes recherchées:');
  searchedIcons.forEach(icon => {
    const available = availableIcons.includes(icon);
    console.log(`  ${icon}: ${available ? '✅ Disponible' : '❌ Non disponible'}`);
  });
  
  // Suggestions d'icônes alternatives
  const fitnessIcons = availableIcons.filter(icon => 
    icon.toLowerCase().includes('activity') || 
    icon.toLowerCase().includes('heart') ||
    icon.toLowerCase().includes('dumbbell') ||
    icon.toLowerCase().includes('zap')
  );
  
  console.log('\n💡 Icônes alternatives disponibles pour fitness:');
  fitnessIcons.slice(0, 10).forEach(icon => {
    console.log(`  - ${icon}`);
  });
  
} catch (error) {
  console.log('❌ Impossible de charger lucide-react:', error.message);
}

console.log('\n🔧 Recommandations:');
console.log('1. Remplacer FitnessCenter par Activity ou Dumbbell');
console.log('2. Nettoyer le cache de build: npm run build:clean');
console.log('3. Vérifier les fichiers de cache Vite');
console.log('4. Utiliser des icônes Material Icons comme fallback');

console.log('\n✨ Débogage terminé!');