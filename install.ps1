<#
.SYNOPSIS
    Instala as skills ArtCraft ou o plugin ArtCraft para Antigravity.
.DESCRIPTION
    Encaminha a instalação para a CLI Node compartilhada com install.sh e npx.
.EXAMPLE
    .\install.ps1 -All
.EXAMPLE
    .\install.ps1 -Antigravity -Local
#>

param(
    [switch]$Antigravity,
    [switch]$Codex,
    [switch]$Local,
    [switch]$All,
    [Alias('Update')][switch]$Force,
    [switch]$Uninstall,
    [switch]$AllowUnconfined,
    [string]$Workspace,
    [string]$HomeDirectory,
    [string[]]$AppDir
)

$ErrorActionPreference = 'Stop'
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    throw 'Node.js is required. Install Node.js and run this script again.'
}

$cli = Join-Path $PSScriptRoot 'bin\cli.js'
if (-not (Test-Path -LiteralPath $cli -PathType Leaf)) {
    throw "ArtCraft CLI not found: $cli"
}

$arguments = @()
if ($All) {
    $arguments += '--global'
} elseif ($Local) {
    $arguments += '--local'
} elseif (-not $Antigravity -and -not $Codex) {
    $arguments += '--global'
}
if (-not $All) {
    if ($Antigravity) { $arguments += '--antigravity' }
    if ($Codex) { $arguments += '--codex' }
}
if ($Force) { $arguments += '--update' }
if ($Uninstall) { $arguments += '--uninstall' }
if ($AllowUnconfined) { $arguments += '--allow-unconfined' }
if ($Workspace) { $arguments += @('--workspace', $Workspace) }
if ($HomeDirectory) { $arguments += @('--home', $HomeDirectory) }
foreach ($directory in $AppDir) { $arguments += @('--app-dir', $directory) }

& $node.Source $cli @arguments
if ($LASTEXITCODE -ne 0) {
    exit $LASTEXITCODE
}
