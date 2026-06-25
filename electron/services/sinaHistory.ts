import axios from 'axios'
import type { KLineItem, KLinePeriod, SymbolKey } from '../../src/types'

// 沪金主力（国内期货）日K接口
const AU_URL =
  'https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var_/InnerFuturesNewService.getDailyKLine'

// 伦敦金（COMEX 纽约黄金期货 GC，美元/盎司，走势与现货伦敦金一致）日K接口
function gcUrl(): string {
  const now = new Date()
  const today = `${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`
  return `https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var%20_S${today}=/GlobalFuturesService.getGlobalFuturesDailyKLine`
}

const HEADERS = { Referer: 'https://finance.sina.com.cn' }

// 沪金/伦敦金历史K线：新浪期货日K，周/月K由日K聚合得到
export async function fetchSinaHistory(
  symbol: SymbolKey,
  period: KLinePeriod
): Promise<KLineItem[]> {
  const daily = symbol === 'XAU' ? await fetchGCDaily() : await fetchAUDaily()
  const recent = daily.slice(-365)
  if (period === '1d') return recent
  return aggregate(recent, period)
}

async function fetchAUDaily(): Promise<KLineItem[]> {
  const resp = await axios.get(AU_URL, {
    params: { symbol: 'AU0' },
    headers: HEADERS,
    responseType: 'text',
    timeout: 10000
  })
  const raw = parseJsonp(resp.data) as Array<{
    d: string; o: string; h: string; l: string; c: string; v: string
  }>
  return raw
    .map((r): KLineItem => ({
      time: r.d, open: +r.o, close: +r.c, high: +r.h, low: +r.l, volume: +r.v || 0
    }))
    .sort((a, b) => (a.time < b.time ? -1 : 1))
}

async function fetchGCDaily(): Promise<KLineItem[]> {
  const now = new Date()
  const today = `${now.getFullYear()}_${now.getMonth() + 1}_${now.getDate()}`
  const resp = await axios.get(gcUrl(), {
    params: { symbol: 'GC', _: today, source: 'web' },
    headers: HEADERS,
    responseType: 'text',
    timeout: 10000
  })
  const raw = parseJsonp(resp.data) as Array<{
    date: string; open: string; high: string; low: string; close: string; volume: string
  }>
  return raw
    .map((r): KLineItem => ({
      time: r.date, open: +r.open, close: +r.close, high: +r.high, low: +r.low, volume: +r.volume || 0
    }))
    .sort((a, b) => (a.time < b.time ? -1 : 1))
}

function parseJsonp(text: string): unknown[] {
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start < 0 || end < 0) return []
  try {
    return JSON.parse(text.slice(start, end + 1))
  } catch {
    return []
  }
}

function aggregate(daily: KLineItem[], period: '1w' | '1m'): KLineItem[] {
  const groups = new Map<string, KLineItem[]>()
  for (const item of daily) {
    const date = new Date(item.time)
    const key =
      period === '1w'
        ? weekKey(date)
        : `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
    let arr = groups.get(key)
    if (!arr) {
      arr = []
      groups.set(key, arr)
    }
    arr.push(item)
  }
  const out: KLineItem[] = []
  for (const items of groups.values()) {
    out.push({
      time: items[items.length - 1].time,
      open: items[0].open,
      close: items[items.length - 1].close,
      high: Math.max(...items.map((i) => i.high)),
      low: Math.min(...items.map((i) => i.low)),
      volume: items.reduce((s, i) => s + i.volume, 0)
    })
  }
  return out
}

function weekKey(date: Date): string {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  const weekNum = Math.ceil(
    ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
  )
  return `${d.getUTCFullYear()}-W${String(weekNum).padStart(2, '0')}`
}
