import axios from 'axios'
import type { KLineItem, KLinePeriod } from '../../src/types'

const EM_URL = 'https://push2his.eastmoney.com/api/qt/stock/kline/get'

// 伦敦金现货在东财的 secid（实测 122.XAU = 黄金/美元，133.XAU 返回空）
const XAU_SECID = '122.XAU'

const KLT: Record<KLinePeriod, number> = {
  '1d': 101,
  '1w': 102,
  '1m': 103
}

// 伦敦金历史K线（东财原生支持日/周/月周期，接口偶发 socket hang up，加重试）
export async function fetchEastMoneyHistory(
  period: KLinePeriod
): Promise<KLineItem[]> {
  const params = {
    secid: XAU_SECID,
    klt: KLT[period],
    fqt: 1,
    end: '20500101',
    lmt: 365,
    fields1: 'f1,f2,f3,f4,f5,f6',
    fields2: 'f51,f52,f53,f54,f55,f56,f57'
  }
  let lastErr: unknown
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const resp = await axios.get(EM_URL, {
        params,
        headers: { Referer: 'https://quote.eastmoney.com' },
        timeout: 8000
      })
      const klines: string[] = resp.data?.data?.klines || []
      return klines.map((line): KLineItem => {
        const [time, open, close, high, low, volume] = line.split(',')
        return {
          time,
          open: +open,
          close: +close,
          high: +high,
          low: +low,
          volume: +volume || 0
        }
      })
    } catch (e) {
      lastErr = e
      if (attempt < 2) await new Promise((r) => setTimeout(r, 500 * (attempt + 1)))
    }
  }
  throw lastErr
}
