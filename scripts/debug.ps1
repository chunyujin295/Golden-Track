<#
.SYNOPSIS
  黄金价格追踪 - 快速构建并运行（免打包，用于测试）
.DESCRIPTION
  electron-vite build 输出到 build/ 目录 -> 直接用 electron 启动运行
  不生成安装包，适合开发调试。关闭窗口或 Ctrl+C 退出。
.NOTES
  用法: 在项目根目录执行  scripts\debug.ps1
        或双击           scripts\debug.bat
  前置: 首次使用请先运行 scripts\setup.ps1 配置开发环境
#>

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

function Write-Step($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }
function Write-OK($msg)   { Write-Host "    $msg" -ForegroundColor Green }
function Write-Err($msg)  { Write-Host "    $msg" -ForegroundColor Red }

# 前置检查：依赖是否已安装
if (-not (Test-Path 'node_modules')) {
    Write-Err 'node_modules 不存在，请先运行 scripts\setup.ps1 配置开发环境'
    exit 1
}

# 前置检查：Electron 二进制
if (-not (Test-Path 'node_modules/electron/dist/electron.exe')) {
    Write-Err 'Electron 二进制缺失，请先运行 scripts\setup.ps1'
    exit 1
}

Write-Step '快速构建 (electron-vite build -> build/)'
npm run build
if ($LASTEXITCODE -ne 0) { Write-Err '构建失败'; exit 1 }
Write-OK '构建完成'

Write-Host ''
Write-Host '================================================' -ForegroundColor Green
Write-Host ' 启动应用（测试模式，免打包）' -ForegroundColor Green
Write-Host '================================================' -ForegroundColor Green
Write-Host ' 产物目录: build\main  build\preload  build\renderer' -ForegroundColor Gray
Write-Host ' 关闭窗口或按 Ctrl+C 退出' -ForegroundColor Gray
Write-Host ''

Write-Step '启动 Electron'
npx electron .
