<#
.SYNOPSIS
  黄金价格追踪 - 打包 Windows 安装包
.DESCRIPTION
  清理旧产物 -> 配置国内镜像 -> 构建 + 打包 -> 输出产物信息
.NOTES
  用法: 在项目根目录执行  scripts\build.ps1
        或双击           scripts\build.bat
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

Write-Step '配置国内镜像（加速 Electron 与打包工具下载）'
$env:ELECTRON_MIRROR = 'https://npmmirror.com/mirrors/electron/'
$env:ELECTRON_BUILDER_BINARIES_MIRROR = 'https://npmmirror.com/mirrors/electron-builder-binaries/'

Write-Step '清理旧产物 (dist / build)'
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue
Remove-Item -Recurse -Force build -ErrorAction SilentlyContinue
Write-OK '已清理'

Write-Step '构建并打包 (electron-vite build + electron-builder --win)'
npm run build:win
if ($LASTEXITCODE -ne 0) { Write-Err '打包失败'; exit 1 }

Write-Host ''
Write-Host '================================================' -ForegroundColor Green
Write-Host ' 打包完成！' -ForegroundColor Green
Write-Host '================================================' -ForegroundColor Green
Write-Host ''
Write-Host ' 产物列表:' -ForegroundColor Cyan
Get-ChildItem dist -File -Filter '*.exe' | ForEach-Object {
    $mb = [math]::Round($_.Length / 1MB, 1)
    Write-Host ("   {0,-40} {1,8} MB" -f $_.Name, $mb) -ForegroundColor Yellow
}
$unpacked = 'dist\win-unpacked\GoldenTrack.exe'
if (Test-Path $unpacked) {
    Write-Host ''
    Write-Host ' 免安装版(直接运行):' -ForegroundColor Cyan
    Write-Host "   $root\$unpacked" -ForegroundColor Gray
}
Write-Host ''
Write-Host ' 输出目录:' -ForegroundColor Cyan
Write-Host "   $root\dist" -ForegroundColor Gray
Write-Host ''
