import { app, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { fetchRealtime } from './services/sina'
import { fetchHistory } from './services/history'
import { fetchBrandPrices } from './services/brand'
import type { KLinePeriod, SymbolKey } from '../src/types'

const iconPath = app.isPackaged
  ? join(process.resourcesPath, 'icon.png')
  : join(process.cwd(), 'doc/img/GoldenTrack-Logo.png')

function createWindow(): void {
  const win = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 1000,
    minHeight: 680,
    backgroundColor: '#0f1115',
    autoHideMenuBar: true,
    icon: iconPath,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(() => {
  ipcMain.handle('realtime', async (_e, symbol: string) => {
    try {
      return await fetchRealtime(symbol as SymbolKey)
    } catch (e) {
      console.error('[realtime] failed:', (e as Error).message)
      return null
    }
  })
  ipcMain.handle('history', async (_e, symbol: string, period: string) => {
    try {
      return await fetchHistory(symbol as SymbolKey, period as KLinePeriod)
    } catch (e) {
      console.error('[history] failed:', (e as Error).message)
      return []
    }
  })
  ipcMain.handle('brands', async () => {
    try {
      return await fetchBrandPrices()
    } catch (e) {
      console.error('[brands] failed:', (e as Error).message)
      return []
    }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
