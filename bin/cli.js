#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const args = process.argv.slice(2);
const isGlobal = args.includes('--global') || args.includes('-g') || args.includes('--all');
const isAntigravity = args.includes('--antigravity');
const isCodex = args.includes('--codex');
const isLocal = args.includes('--local');

const homeDir = os.homedir();
const cwd = process.cwd();

// Origem das skills dentro deste pacote
const skillsSourceDir = path.join(__dirname, '..', '.agents', 'skills');

if (!fs.existsSync(skillsSourceDir)) {
  console.error(`❌ Erro: Diretório de skills não encontrado em ${skillsSourceDir}`);
  process.exit(1);
}

function copyRecursive(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

const targets = [];

// Se pediu --local ou se não passou nenhum argumento específico
if (isLocal || (!isGlobal && !isAntigravity && !isCodex)) {
  targets.push({ name: 'Projeto Local (.agents/skills)', path: path.join(cwd, '.agents', 'skills') });
}

// Se pediu --global ou --antigravity
if (isGlobal || isAntigravity) {
  targets.push({ name: 'Google Antigravity Global (~/.gemini/config/skills)', path: path.join(homeDir, '.gemini', 'config', 'skills') });
}

// Se pediu --global ou --codex
if (isGlobal || isCodex) {
  targets.push({ name: 'OpenAI Codex Global (~/.agents/skills)', path: path.join(homeDir, '.agents', 'skills') });
}

console.log('\n🎨 ==========================================');
console.log('   ArtCraft Agent Skills Installer');
console.log('   (Video, Imagem, Pitchdeck, Frontend)');
console.log('==========================================\n');

const availableSkills = fs.readdirSync(skillsSourceDir).filter(f => {
  return fs.statSync(path.join(skillsSourceDir, f)).isDirectory();
});

targets.forEach(target => {
  console.log(`📁 Instalando em: ${target.name}`);
  fs.mkdirSync(target.path, { recursive: true });

  availableSkills.forEach(skill => {
    const src = path.join(skillsSourceDir, skill);
    const dest = path.join(target.path, skill);
    copyRecursive(src, dest);
    console.log(`  ✅ ${skill} instalado com sucesso!`);
  });
  console.log('');
});

console.log('🎉 Instalação concluída com sucesso!');
console.log('\n💡 Como usar:');
console.log('  - No projeto atual:');
console.log('    npx github:pincib/skill_artCraft');
console.log('    pnpm dlx github:pincib/skill_artCraft');
console.log('  - Globalmente (Antigravity & Codex):');
console.log('    npx github:pincib/skill_artCraft --global');
console.log('    pnpm dlx github:pincib/skill_artCraft --global\n');
