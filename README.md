<p align="center">
  <img src="./doc/img/GoldenTrack-Logo.png" alt="GoldenTrack" width="200">
</p>

<h1 align="center">Golden Track · 黄金价格追踪桌面工具</h1>

<p align="center">实时追踪伦敦金与沪金行情，提供 K 线图表与品牌实物金价对比，兼顾投资行情分析与买金时机参考。</p>

## 功能特性

- **实时看板**：伦敦金（美元/盎司）/ 沪金（人民币/克）切换，当前价、涨跌额/幅、开盘/最高/最低/昨结，30 秒自动刷新
- **历史 K 线**：日 K / 周 K / 月 K，近 1 年数据，蜡烛图 + 成交量副图，支持缩放、十字光标，红涨绿跌
- **品牌实物金价对比**：周大福、潮宏基、老凤祥、中国黄金，含“溢价 vs 沪金”列，一眼看出买金贵不贵
- **深色主题**界面，响应式布局

## 数据源

| 数据 | 来源 | 说明 |
|------|------|------|
| 伦敦金实时 | 新浪 `hq.sinajs.cn`（`hf_GC`） | 主进程注入 Referer 绕过限制 |
| 沪金实时 | 新浪 `hq.sinajs.cn`（`nf_AU0`） | 字段映射依据 akshare 权威定义 |
| 伦敦金历史 K 线 | 新浪国际期货（GC 纽约黄金） | 日 K + 周/月聚合 |
| 沪金历史 K 线 | 新浪期货日 K 接口（AU0） | 周/月 K 由日 K 聚合 |
| 品牌金价 | 基于沪金基准 + 品牌溢价 | 参考价，非门店实时挂牌价 |

## 技术栈

- Electron 33 + electron-vite
- React 18 + TypeScript
- ECharts 5（K 线图）
- axios（数据请求）

## 目录结构

```
golden-track/
├── electron/              # 主进程
│   ├── main.ts            # 窗口创建 + IPC 注册
│   ├── preload.ts         # contextBridge 桥接
│   └── services/
│       ├── sina.ts          # 实时行情（新浪 hf_GC / nf_AU0）
│       ├── sinaHistory.ts   # 沪金/伦敦金历史日 K + 周/月聚合
│       ├── history.ts       # 统一调度
│       └── brand.ts         # 品牌金价
├── src/                   # 渲染进程
│   ├── components/        # Header / Dashboard / KLineChart / BrandTable
│   ├── hooks/             # usePriceFeed（30s 轮询）
│   ├── services/          # IPC 封装
│   └── types/
├── scripts/               # 工具脚本（见下文）
├── doc/img/               # 图标资源
└── electron-builder.yml
```

## 快速开始

### 环境要求

- Node.js 18+
- Windows

### 一键配置开发环境

```powershell
scripts\setup.bat
```

自动完成：检查 Node → 配置国内镜像（npm / electron / electron-builder）→ 安装依赖 → 下载 Electron 二进制 → 类型检查。

### 开发调试

```powershell
npm run dev            # 热更新开发模式（推荐日常开发）
scripts\debug.bat      # 快速构建 + 直接运行（免打包，产物在 build/）
```

### 打包安装程序

```powershell
scripts\build.bat      # 生成 exe 安装包到 dist/
```

## 脚本说明

| 脚本 | 作用 |
|------|------|
| `scripts\setup.ps1` / `.bat` | 开发环境一键配置 |
| `scripts\debug.ps1` / `.bat` | 快速构建并运行（免打包，用于测试） |
| `scripts\build.ps1` / `.bat` | 构建并打包 Windows 安装包 |

## 目录约定

| 目录 | 内容 |
|------|------|
| `build/` | 开发构建产物（electron-vite，可直接运行测试） |
| `dist/` | 打包产物（exe 安装包，仅 build 脚本生成） |
| `resources/` | electron-builder 资源目录（图标等，预留） |

## 注意事项

- 数据源为公开接口，偶发限流/不稳定：所有 IPC handler 均有容错降级
- **品牌实物金价为参考价**：基于沪金基准 + 合理品牌溢价生成（首饰金约 +120~135 元/克，投资金条约 +12~18 元/克），非门店实时挂牌价；真实门店金价待接入品牌官网抓取
- 沪金历史日 K 当天数据需收盘后更新，盘中显示此前 K 线，当日盘中价在实时看板显示
- 伦敦金以美元/盎司计价，沪金以人民币/克计价，注意单位差异
