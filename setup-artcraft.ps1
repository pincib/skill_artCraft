<#
.SYNOPSIS
    Configura o plugin ArtCraft e os servidores MCP detectados para Antigravity.
.DESCRIPTION
    A detecção de binários e a geração do mcp_config.json são feitas pela CLI Node compartilhada.
    O download do launcher e a instalação opcional de skills comunitárias continuam explícitos.
#>

param(
    [switch]$InstallLauncher,
    [switch]$InstallCommunitySkills,
    [switch]$ConfigureMcp,
    [string]$WorkspaceRoot = $PSScriptRoot
)

$ErrorActionPreference = 'Stop'
$workspace = [System.IO.Path]::GetFullPath($WorkspaceRoot)
if (-not (Test-Path -LiteralPath $workspace -PathType Container)) {
    throw "Workspace not found: $workspace"
}

if ($InstallLauncher) {
    Write-Host 'Buscando o release mais recente do ArtCraft Launcher...' -ForegroundColor Yellow
    $release = Invoke-RestMethod -Uri 'https://api.github.com/repos/storytold/craft-launcher/releases/latest'
    $msi = $release.assets | Where-Object { $_.name -match 'windows-x64\.msi$' } | Select-Object -First 1
    if (-not $msi) { throw 'O release não contém um instalador MSI Windows x64.' }

    $tempRoot = Join-Path $env:TEMP ("artcraft-launcher-" + [guid]::NewGuid().ToString('N'))
    New-Item -ItemType Directory -Path $tempRoot | Out-Null
    try {
        $installer = Join-Path $tempRoot $msi.name
        Invoke-WebRequest -Uri $msi.browser_download_url -OutFile $installer
        Start-Process -FilePath 'msiexec.exe' -ArgumentList @('/i', "`"$installer`"") -Wait
    } finally {
        if (Test-Path -LiteralPath $tempRoot) {
            Remove-Item -LiteralPath $tempRoot -Recurse -Force
        }
    }
}

if ($InstallCommunitySkills) {
    $tempRoot = Join-Path $env:TEMP ("artcraft-community-skills-" + [guid]::NewGuid().ToString('N'))
    try {
        git clone --depth 1 https://github.com/midasmatterhorn/artcraft-skills.git $tempRoot
        if ($LASTEXITCODE -ne 0) { throw 'Não foi possível clonar as skills comunitárias.' }
        $communityInstaller = Join-Path $tempRoot 'install.ps1'
        if (-not (Test-Path -LiteralPath $communityInstaller -PathType Leaf)) {
            throw 'O repositório comunitário não contém install.ps1.'
        }
        & $communityInstaller -Antigravity -Force
        if ($LASTEXITCODE -ne 0) { throw 'A instalação das skills comunitárias falhou.' }
    } finally {
        if (Test-Path -LiteralPath $tempRoot) {
            Remove-Item -LiteralPath $tempRoot -Recurse -Force
        }
    }
}

if ($ConfigureMcp) {
    $node = Get-Command node -ErrorAction SilentlyContinue
    if (-not $node) { throw 'Node.js é necessário para detectar os apps e gerar a configuração MCP.' }
    $cli = Join-Path $PSScriptRoot 'bin\cli.js'
    & $node.Source $cli '--antigravity' '--local' '--workspace' $workspace '--update'
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

if (-not ($InstallLauncher -or $InstallCommunitySkills -or $ConfigureMcp)) {
    Write-Host 'Nada foi alterado. Use -ConfigureMcp para detectar os apps e configurar o plugin.' -ForegroundColor Yellow
}
