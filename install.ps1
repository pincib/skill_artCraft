<#
.SYNOPSIS
    Script de instalação das ArtCraft Agent Skills no Windows.
.DESCRIPTION
    Instala as skills para o Google Antigravity, OpenAI Codex ou no projeto local.
.EXAMPLE
    .\install.ps1 -Antigravity
    .\install.ps1 -Codex
    .\install.ps1 -Local
    .\install.ps1 -All
#>

param(
    [switch]$Antigravity,
    [switch]$Codex,
    [switch]$Local,
    [switch]$All,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

$skills = @("artcraft-video", "artcraft-image", "artcraft-pitchdeck", "artcraft-frontend")
$srcDir = Join-Path $PSScriptRoot ".agents\skills"
if (-not (Test-Path $srcDir)) {
    $srcDir = Join-Path $PSScriptRoot "package-artcraft-skills\skills"
}

if (-not (Test-Path $srcDir)) {
    Write-Error "Diretório de skills não encontrado em $srcDir."
    exit 1
}

$targets = @()

if ($All) {
    $targets += Join-Path $HOME ".gemini\config\skills"
    $targets += Join-Path $HOME ".agents\skills"
} else {
    if ($Antigravity) { $targets += Join-Path $HOME ".gemini\config\skills" }
    if ($Codex)       { $targets += Join-Path $HOME ".agents\skills" }
    if ($Local)       { $targets += Join-Path (Get-Location).Path ".agents\skills" }
}

if ($targets.Count -eq 0) {
    Write-Host "Nenhum alvo especificado. Usando o padrão: -All (Antigravity + Codex)" -ForegroundColor Yellow
    $targets += Join-Path $HOME ".gemini\config\skills"
    $targets += Join-Path $HOME ".agents\skills"
}

foreach ($target in $targets) {
    Write-Host "`n📁 Instalando em: $target" -ForegroundColor Cyan
    New-Item -ItemType Directory -Force -Path $target | Out-Null

    foreach ($s in $skills) {
        $sourcePath = Join-Path $srcDir $s
        $destPath = Join-Path $target $s
        if (Test-Path $sourcePath) {
            Copy-Item -Recurse -Force -Path $sourcePath -Destination $destPath
            Write-Host "  ✅ $s instalado com sucesso!" -ForegroundColor Green
        } else {
            Write-Warning "Skill $s não encontrada em $sourcePath."
        }
    }
}

Write-Host "`n🎉 Instalação concluída com sucesso!" -ForegroundColor Green
Write-Host "Reinicie sua sessão do agente (Antigravity ou Codex) para que as novas skills sejam detectadas."
