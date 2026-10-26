#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const targetProjectDir = process.cwd();
const targetSkillsDir = path.join(targetProjectDir, '.agents', 'skills');

// Diretório local onde as skills estão armazenadas dentro do pacote
const sourceSkillsDir = path.join(__dirname, '..', 'skills');

console.log('🚀 Instalando ArtCraft Agent Skills no seu projeto...');
console.log(`📁 Destino: ${targetSkillsDir}`);

if (!fs.existsSync(sourceSkillsDir)) {
  console.error('❌ Diretório de skills de origem não encontrado.');
  process.exit(1);
}

fs.mkdirSync(targetSkillsDir, { recursive: true });

function copyFolderRecursiveSync(source, target) {
  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  const files = fs.readdirSync(source);
  files.forEach((file) => {
    const curSource = path.join(source, file);
    const curTarget = path.join(target, file);
    if (fs.lstatSync(curSource).isDirectory()) {
      copyFolderRecursiveSync(curSource, curTarget);
    } else {
      fs.copyFileSync(curSource, curTarget);
    }
  });
}

const skills = fs.readdirSync(sourceSkillsDir).filter((f) => {
  return fs.statSync(path.join(sourceSkillsDir, f)).isDirectory();
});

skills.forEach((skill) => {
  const src = path.join(sourceSkillsDir, skill);
  const dest = path.join(targetSkillsDir, skill);
  copyFolderRecursiveSync(src, dest);
  console.log(`  ✅ Skill instalada: .agents/skills/${skill}`);
});

console.log('\n✨ Concluído! Tanto o Antigravity (Gemini) quanto o OpenAI Codex agora reconhecem as skills neste projeto.');
