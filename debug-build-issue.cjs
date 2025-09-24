#!/usr/bin/env node

/**
 * Script de débogage pour identifier et corriger les problèmes de build
 * liés aux imports lucide-react
 */

const fs = require('fs');
const path = require('path');

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

let clientPackageJson = {};
try {
  clientPackageJson = JSON.parse(fs.readFileSync('./client/package.json', 'utf8'));
} catch (error) {
  console.log('Note: Pas de package.json client séparé');
}

console.log('Versions lucide-react:');
console.log('  Root:', packageJson.dependencies?.['lucide-react'] || packageJson.devDependencies?.['lucide-react'] || 'Non installé');
console.log('  Client:', clientPackageJson.dependencies?.['lucide-react'] || 'N/A');

// Rechercher tous les imports d'icônes potentiellement problématiques
console.log('\n🔍 Recherche d\'imports d\'icônes problématiques...');
const problematicImports = [
  'FitnessCenter', 'Psychology', 'Lightbulb', 'School', 'Tag'
];

problematicImports.forEach(iconName => {
  const files = findFilesWithPattern('./client/src', iconName);
  if (files.length > 0) {
    console.log(`\n❌ Icône "${iconName}" trouvée dans:`);
    files.forEach(({ filePath, content }) => {
      const lines = content.split('\n');
      lines.forEach((line, index) => {
        if (line.includes(iconName) && (line.includes('import') || line.includes('from'))) {
          console.log(`   ${filePath}:${index + 1} - ${line.trim()}`);
        }
      });
    });
  }
});

console.log('\n🔧 Recommandations:');
console.log('1. Remplacer les icônes manquantes par des alternatives Material Icons');
console.log('2. Utiliser Activity au lieu de FitnessCenter');
console.log('3. Utiliser Brain au lieu de Psychology'); 
console.log('4. Utiliser Lightbulb de lucide-react si disponible');
console.log('5. Nettoyer le cache: rm -rf node_modules/.vite dist');

console.log('\n✨ Débogage terminé!');