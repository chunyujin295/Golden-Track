import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '@/services/ipc'
import type {
  BrandPrice,
  KLineItem,
  KLinePeriod,
  RealtimeQuote,
  SymbolKey
} from '@/types'

const REALTIME_MS = 30000
const BRAND_MS = 600000

export function usePriceFeed(symbol: SymbolKey, period: KLinePeriod) {
  const [realtime, setRealtime] = useState<RealtimeQuote | null>(null)
  const [auBenchmark, setAuBenchmark] = useState<number | null>(null)
  const [history, setHistory] = useState<KLineItem[]>([])
  const [brands, setBrands] = useState<BrandPrice[]>([])
  const [loading, setLoading] = useState(true)

  const realtimeTimer = useRef<ReturnType<typeof setInterval>>()
  const brandTimer = useRef<ReturnType<typeof setInterval>>()

  const refreshRealtime = useCallback(async () => {
    const q = await api.getRealtime(symbol).catch(() => null)
    if (q) setRealtime(q)
  }, [symbol])

  const refreshAu = useCallback(async () => {
    const q = await api.getRealtime('AU').catch(() => null)
    if (q) setAuBenchmark(q.price)
  }, [])

  const refreshBrands = useCallback(async () => {
    const list = await api.getBrandPrices().catch(() => [])
    setBrands(list)
  }, [])

  useEffect(() => {
    let active = true
    setLoading(true)
    void (async () => {
      await Promise.all([refreshRealtime(), refreshAu(), refreshBrands()])
      const items = await api.getHistory(symbol, period).catch(() => [])
      if (active) {
        setHistory(items)
        setLoading(false)
      }
    })()
    realtimeTimer.current = setInterval(() => {
      void refreshRealtime()
      void refreshAu()
    }, REALTIME_MS)
    brandTimer.current = setInterval(refreshBrands, BRAND_MS)
    return () => {
      active = false
      clearInterval(realtimeTimer.current)
      clearInterval(brandTimer.current)
    }
  }, [symbol, period, refreshRealtime, refreshAu, refreshBrands])

  return { realtime, auBenchmark, history, brands, loading }
}
