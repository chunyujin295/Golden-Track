import { contextBridge, ipcRenderer } from 'electron'

const api = {
  getRealtime: (symbol: string) => ipcRenderer.invoke('realtime', symbol),
  getHistory: (symbol: string, period: string) =>
    ipcRenderer.invoke('history', symbol, period),
  getBrandPrices: () => ipcRenderer.invoke('brands')
}

contextBridge.exposeInMainWorld('goldenTrack', api)
