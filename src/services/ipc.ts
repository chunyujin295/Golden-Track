import type { RealtimeQuote, KLineItem, KLinePeriod, BrandPrice } from '@/types'

export interface GoldenTrackAPI {
  getRealtime: (symbol: string) => Promise<RealtimeQuote | null>
  getHistory: (symbol: string, period: KLinePeriod) => Promise<KLineItem[]>
  getBrandPrices: () => Promise<BrandPrice[]>
}

declare global {
  interface Window {
    goldenTrack: GoldenTrackAPI
  }
}

export const api: GoldenTrackAPI = window.goldenTrack
