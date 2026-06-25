<#
.SYNOPSIS
  黄金价格追踪 - 开发环境一键配置
.DESCRIPTION
  检查 Node 环境 -> 配置国内镜像 -> 安装依赖 -> 下载 Electron 二进制 -> 类型检查
.NOTES
  用法: 在项目根目录执行  scripts\setup.ps1
        或双击           scripts\setup.bat
#>

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "    $msg" -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "    $msg" -ForegroundColor Red }

Write-Step '检查 Node.js 环境'
$nodeVersion = try { (node --version) 2>$null } catch { $null }
if (-not $nodeVersion) {
    Write-Err '未检测到 Node.js，请先安装 Node.js 18+ : https://nodejs.org'
    exit 1
}
$npmVersion = (npm --version) 2>$null
Write-OK "Node $nodeVersion / npm $npmVersion"

# Node 18+ 校验
$major = [int]($nodeVersion -replace '^v', '' -split '\.')[0]
if ($major -lt 18) {
    Write-Err "Node 版本过低($nodeVersion)，请升级到 18+"
    exit 1
}

Write-Step '配置国内镜像（加速依赖与二进制下载）'
npm config set registry https://registry.npmmirror.com
$env:ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/'
$env:ELECTRON_BUILDER_BINARIES_MIRROR = 'https://npmmirror.com/mirrors/electron-builder-binaries/'
Write-OK 'npm registry  -> npmmirror.com'
Write-OK 'electron       -> npmmirror.com/mirrors/electron'
Write-OK 'builder 二进制 -> npmmirror.com/mirrors/electron-builder-binaries'

Write-Step '安装依赖 (npm install)'
npm install
if ($LASTEXITCODE -ne 0) { Write-Err '依赖安装失败'; exit 1 }
Write-OK '依赖安装完成'

Write-Step '检查 Electron 二进制'
$electronExe = 'node_modules/electron/dist/electron.exe'
if (-not (Test-Path $electronExe)) {
    Write-Host '    Electron 二进制缺失，开始下载...' -ForegroundColor Yellow
    node node_modules/electron/install.js
    if ($LASTEXITCODE -ne 0) { Write-Err 'Electron 二进制下载失败'; exit 1 }
    Write-OK 'Electron 二进制下载完成'
} else {
    Write-OK 'Electron 二进制已存在，跳过'
}

Write-Step '类型检查 (typecheck)'
npm run typecheck
if ($LASTEXITCODE -ne 0) { Write-Err '类型检查失败，请检查代码'; exit 1 }
Write-OK '类型检查通过'

Write-Host ''
Write-Host '================================================' -ForegroundColor Green
Write-Host ' 开发环境配置完成！' -ForegroundColor Green
Write-Host '================================================' -ForegroundColor Green
Write-Host ''
Write-Host ' 启动开发服务器:  npm run dev' -ForegroundColor Yellow
Write-Host ' 打包安装程序:    scripts\build.ps1' -ForegroundColor Yellow
Write-Host ''
