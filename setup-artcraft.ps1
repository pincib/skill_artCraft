<#
.SYNOPSIS
    Script de instalação e configuração da suíte ArtCraft + Skills + MCP para o Google Antigravity no Windows.
.DESCRIPTION
    1. Permite baixar e instalar o ArtCraft Launcher (ou aplicativos individuais como PhotoCraft, VectorCraft, PdfCraft).
    2. Permite instalar as 13 skills verificadas da comunidade (midasmatterhorn/artcraft-skills) para o Antigravity.
    3. Detecta automaticamente os binários *-cli.exe instalados e gera/atualiza o mcp_config.json.
#>

param(
    [switch]$InstallLauncher,
    [switch]$InstallCommunitySkills,
    [switch]$ConfigureMcp,
    [string]$WorkspaceRoot = $PSScriptRoot
)

$ErrorActionPreference = "Stop"

Write-Host "=== Assistente de Configuração ArtCraft para Antigravity ===" -ForegroundColor Cyan

# 1. Instalar o ArtCraft Launcher (se solicitado)
if ($InstallLauncher) {
    Write-Host "`n[1/3] Buscando a versão mais recente do ArtCraft Launcher no GitHub..." -ForegroundColor Yellow
    $release = Invoke-RestMethod -Uri "https://api.github.com/repos/storytold/craft-launcher/releases/latest"
    $msiAsset = $release.assets | Where-Object { $_.name -match "windows-x64\.msi$" } | Select-Object -First 1
    if (-not $msiAsset) {
        Write-Error "Não foi possível localizar o instalador MSI x64 no último release."
        exit 1
    }
    $installerPath = Join-Path $env:TEMP $msiAsset.name
    Write-Host "Baixando $($msiAsset.name) ($([math]::Round($msiAsset.size / 1MB, 1)) MB)..."
    Invoke-WebRequest -Uri $msiAsset.browser_download_url -OutFile $installerPath
    Write-Host "Iniciando o instalador do ArtCraft Launcher..." -ForegroundColor Green
    Start-Process msiexec.exe -ArgumentList "/i `"$installerPath`"" -Wait
    Write-Host "ArtCraft Launcher instalado! Abra-o para instalar o PhotoCraft, VectorCraft, PdfCraft, etc. com 1 clique." -ForegroundColor Green
}

# 2. Instalar as 13 Skills oficiais/verificadas (midasmatterhorn/artcraft-skills)
if ($InstallCommunitySkills) {
    Write-Host "`n[2/3] Instalando as 13 skills verificadas do ArtCraft em ~/.gemini/config/skills/..." -ForegroundColor Yellow
    $tempClone = Join-Path $env:TEMP "artcraft-skills-temp"
    if (Test-Path $tempClone) { Remove-Item -Recurse -Force $tempClone }
    git clone --depth 1 https://github.com/midasmatterhorn/artcraft-skills.git $tempClone
    Push-Location $tempClone
    try {
        & .\install.ps1 -Antigravity -Force
    } finally {
        Pop-Location
        Remove-Item -Recurse -Force $tempClone -ErrorAction SilentlyContinue
    }
}

# 3. Detectar binários *-cli.exe e atualizar o mcp_config.json do plugin
if ($ConfigureMcp) {
    Write-Host "`n[3/3] Procurando aplicativos ArtCraft instalados em C:\Program Files\..." -ForegroundColor Yellow
    $apps = @(
        @{ id = "photocraft";  folder = "PhotoCraft";  exe = "photocraft-cli.exe" },
        @{ id = "lightcraft";  folder = "LightCraft";  exe = "lightcraft-cli.exe" },
        @{ id = "vectorcraft"; folder = "VectorCraft"; exe = "vectorcraft-cli.exe" },
        @{ id = "figcraft";    folder = "FigCraft";    exe = "figcraft-cli.exe" },
        @{ id = "designcraft"; folder = "DesignCraft"; exe = "designcraft-cli.exe" },
        @{ id = "wordcraft";   folder = "WordCraft";   exe = "wordcraft-cli.exe" },
        @{ id = "deckcraft";   folder = "DeckCraft";   exe = "deckcraft-cli.exe" },
        @{ id = "gridcraft";   folder = "GridCraft";   exe = "gridcraft-cli.exe" },
        @{ id = "pdfcraft";    folder = "PdfCraft";    exe = "pdfcraft-cli.exe" },
        @{ id = "effectcraft"; folder = "EffectCraft"; exe = "effectcraft-cli.exe" },
        @{ id = "filmcraft";   folder = "FilmCraft";   exe = "filmcraft-cli.exe" },
        @{ id = "soundcraft";  folder = "SoundCraft";  exe = "soundcraft-cli.exe" },
        @{ id = "cadcraft";    folder = "CADCraft";    exe = "cadcraft-cli.exe" }
    )

    $mcpServers = [ordered]@{}
    $normalizedWorkspace = $WorkspaceRoot -replace '\\', '/'

    foreach ($app in $apps) {
        $candidatePaths = @(
            "C:\Program Files\$($app.folder)\$($app.exe)",
            "$env:LOCALAPPDATA\Programs\$($app.folder)\$($app.exe)",
            "$env:LOCALAPPDATA\ArtCraft\apps\$($app.id)\$($app.exe)"
        )
        $foundPath = $candidatePaths | Where-Object { Test-Path $_ } | Select-Object -First 1
        if (-not $foundPath) {
            $cmd = Get-Command $app.exe -ErrorAction SilentlyContinue
            if ($cmd) { $foundPath = $cmd.Source }
        }

        if ($foundPath) {
            $normalizedExe = $foundPath -replace '\\', '/'
            Write-Host "  [OK] Encontrado $($app.id): $normalizedExe" -ForegroundColor Green
            $mcpServers[$app.id] = [ordered]@{
                command = $normalizedExe
                args    = @(
                    "mcp",
                    "--automation-read-root",
                    $normalizedWorkspace,
                    "--automation-write-root",
                    $normalizedWorkspace
                )
            }
        }
    }

    if ($mcpServers.Count -eq 0) {
        Write-Warning "Nenhum binário *-cli.exe do ArtCraft foi encontrado ainda. Instale os apps pelo ArtCraft Launcher primeiro e rode novamente com -ConfigureMcp."
    } else {
        $pluginMcpPath = Join-Path $WorkspaceRoot ".agents\plugins\artcraft-suite\mcp_config.json"
        $jsonObj = [ordered]@{ mcpServers = $mcpServers }
        $jsonObj | ConvertTo-Json -Depth 5 | Set-Content -Path $pluginMcpPath -Encoding UTF8
        Write-Host "`nArquivo atualizado com $($mcpServers.Count) servidor(es) MCP: $pluginMcpPath" -ForegroundColor Green
    }
}
