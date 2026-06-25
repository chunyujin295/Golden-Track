import axios from 'axios'
import type { RealtimeQuote, SymbolKey } from '../../src/types'

const SINA_BASE = 'https://hq.sinajs.cn/list='

const SYMBOL_MAP: Record<
  SymbolKey,
  { code: string; name: string; currency: string; unit: string }
> = {
  XAU: { code: 'hf_GC', name: '伦敦金', currency: 'USD', unit: '盎司' },
  AU: { code: 'nf_AU0', name: '沪金主力', currency: 'CNY', unit: '克' }
}

export async function fetchRealtime(symbol: SymbolKey): Promise<RealtimeQuote | null> {
  const cfg = SYMBOL_MAP[symbol]
  const resp = await axios.get<string>(SINA_BASE + cfg.code, {
    headers: { Referer: 'https://finance.sina.com.cn' },
    responseType: 'text',
    timeout: 8000
  })
  const match = resp.data.match(/"([^"]*)"/)
  if (!match || !match[1]) return null
  const f = match[1].split(',')
  if (symbol === 'XAU') {
    // hf_GC 实测字段: 最新价,_,买价,卖价,最高,最低,时间,昨收,开盘,_,_,_,日期,名称
    const price = num(f[0])
    const open = num(f[8])
    const high = num(f[4])
    const low = num(f[5])
    const prevClose = num(f[7])
    return build(symbol, cfg, price, open, high, low, prevClose, parseSinaDate(f[12], f[6]))
  } else {
    // nf_AU0 字段(akshare权威): 名称,代码,开盘,最高,最低,昨收,买价,卖价,最新价,均价,昨结,...,日期
    const price = num(f[8])
    const open = num(f[2])
    const high = num(f[3])
    const low = num(f[4])
    const prevClose = num(f[10])
    return build(symbol, cfg, price, open, high, low, prevClose, parseSinaDate(f[17], '00:00:00'))
  }
}

function build(
  symbol: SymbolKey,
  cfg: { name: string; currency: string; unit: string },
  price: number,
  open: number,
  high: number,
  low: number,
  prevClose: number,
  timestamp: number
): RealtimeQuote {
  const change = price - prevClose
  const changePercent = prevClose ? (change / prevClose) * 100 : 0
  return {
    symbol,
    name: cfg.name,
    price,
    change,
    changePercent,
    open,
    high,
    low,
    prevClose,
    currency: cfg.currency,
    unit: cfg.unit,
    timestamp
  }
}

function num(s: string | undefined): number {
  const n = parseFloat((s || '').trim())
  return isNaN(n) ? 0 : n
}

function parseSinaDate(dateStr: string, timeStr: string): number {
  // 新浪日期为标准格式 yyyy-mm-dd，时间 HH:mm:ss
  const iso = `${dateStr}T${timeStr || '00:00:00'}`
  const t = Date.parse(iso)
  return isNaN(t) ? Date.now() : t
}
