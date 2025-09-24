#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Correction automatique des imports lucide-react problématiques...\n');

// Mapping des icônes problématiques vers les alternatives
const iconReplacements = {
  'FitnessCenter': 'Activity',
  'Psychology': 'Brain', 
  'Lightbulb': 'Lightbulb', // Existe déjà
  'School': 'School', // Existe déjà
  'Tag': 'Tag' // Existe déjà
};

// Fonction pour corriger un fichier
function fixFileImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let hasChanges = false;
  let newContent = content;
  
  // Vérifier s'il y a des imports problématiques
  Object.keys(iconReplacements).forEach(problematicIcon => {
    if (content.includes(problematicIcon) && content.includes('lucide-react')) {
      console.log(`🔍 Correction de ${problematicIcon} → ${iconReplacements[problematicIcon]} dans ${filePath}`);
      
      // Remplacer dans les imports
      const importRegex = new RegExp(`(import\\s*{[^}]*?)\\b${problematicIcon}\\b([^}]*}\\s*from\\s*["']lucide-react["'])`, 'g');
      newContent = newContent.replace(importRegex, `$1${iconReplacements[problematicIcon]}$2`);
      
      // Remplacer les utilisations de l'icône
      const usageRegex = new RegExp(`\\b${problematicIcon}\\b`, 'g');
      newContent = newContent.replace(usageRegex, iconReplacements[problematicIcon]);
      
      hasChanges = true;
    }
  });
  
  if (hasChanges) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`✅ Fichier corrigé: ${filePath}`);
    return true;
  }
  
  return false;
}

// Parcourir tous les fichiers TypeScript/React
function scanAndFixDirectory(dirPath) {
  const items = fs.readdirSync(dirPath);
  let totalFixed = 0;
  
  for (const item of items) {
    const itemPath = path.join(dirPath, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
      totalFixed += scanAndFixDirectory(itemPath);
    } else if (item.endsWith('.tsx') || item.endsWith('.ts')) {
      if (fixFileImports(itemPath)) {
        totalFixed++;
      }
    }
  }
  
  return totalFixed;
}

// Exécuter la correction
const clientSrcPath = './client/src';
if (fs.existsSync(clientSrcPath)) {
  const fixedCount = scanAndFixDirectory(clientSrcPath);
  
  if (fixedCount > 0) {
    console.log(`\n✅ ${fixedCount} fichier(s) corrigé(s) avec succès!`);
  } else {
    console.log('\n✅ Aucune correction nécessaire - tous les imports sont valides!');
  }
} else {
  console.log(`❌ Répertoire client/src introuvable`);
}

console.log('\n🎯 Vérification supplémentaire des imports...');

// Vérifier qu'il n'y a plus d'imports problématiques
const checkResult = scanAndFixDirectory('./client/src');
if (checkResult === 0) {
  console.log('✅ Tous les imports lucide-react sont maintenant valides!');
}

console.log('\n✨ Correction terminée!');