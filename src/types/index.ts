export type SymbolKey = 'XAU' | 'AU'

export type KLinePeriod = '1d' | '1w' | '1m'

export interface RealtimeQuote {
  symbol: SymbolKey
  name: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  prevClose: number
  currency: string
  unit: string
  timestamp: number
}

export interface KLineItem {
  time: string
  open: number
  close: number
  low: number
  high: number
  volume: number
}

export interface BrandPrice {
  brand: string
  jewelry: number
  bar: number
  change: number
  updateTime: string
}

export interface BrandWithPremium extends BrandPrice {
  premium: number
  premiumPercent: number
}
