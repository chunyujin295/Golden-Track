import type { KLineItem, KLinePeriod, SymbolKey } from '../../src/types'
import { fetchEastMoneyHistory } from './eastmoney'
import { fetchSinaFuturesHistory } from './sinaHistory'

// 统一历史K线调度：
// - 伦敦金 XAU：东财 122.XAU（原生支持日/周/月）
// - 沪金 AU：新浪期货日K接口（周/月K由日K聚合）
export async function fetchHistory(
  symbol: SymbolKey,
  period: KLinePeriod
): Promise<KLineItem[]> {
  if (symbol === 'XAU') return fetchEastMoneyHistory(period)
  return fetchSinaFuturesHistory(period)
}
