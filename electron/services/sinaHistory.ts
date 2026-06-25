import axios from 'axios'
import type { KLineItem, KLinePeriod } from '../../src/types'

// 新浪期货历史日K接口（国内期货）。需 Referer，返回 jsonp: var_([{d,o,h,l,c,v,p,s},...])
const SINA_FUTURES_URL =
  'https://stock2.finance.sina.com.cn/futures/api/jsonp.php/var_/InnerFuturesNewService.getDailyKLine'

interface SinaKLineRaw {
  d: string
  o: string
  h: string
  l: string
  c: string
  v: string
  p: string
  s: string
}

// 沪金历史K线：新浪仅返回日K，周/月K由日K聚合得到
export async function fetchSinaFuturesHistory(
  period: KLinePeriod
): Promise<KLineItem[]> {
  const resp = await axios.get(SINA_FUTURES_URL, {
    params: { symbol: 'AU0' },
    headers: { Referer: 'https://finance.sina.com.cn' },
    responseType: 'text',
    timeout: 10000
  })
  const text = resp.data as string
  const start = text.indexOf('[')
  const end = text.lastIndexOf(']')
  if (start < 0 || end < 0) return []
  let raw: SinaKLineRaw[]
  try {
    raw = JSON.parse(text.slice(start, end + 1))
  } catch {
    return []
  }
  const daily: KLineItem[] = raw
    .map((r): KLineItem => ({
      time: r.d,
      open: +r.o,
      close: +r.c,
      high: +r.h,
      low: +r.l,
      volume: +r.v || 0
    }))
    .sort((a, b) => (a.time < b.time ? -1 : 1))
  const recent = daily.slice(-365)
  if (period === '1d') return recent
  return aggregate(recent, period)
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
