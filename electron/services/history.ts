import type { KLineItem, KLinePeriod, SymbolKey } from '../../src/types'
import { fetchSinaHistory } from './sinaHistory'

// 统一历史K线调度：沪金(AU0)/伦敦金(GC) 均走新浪期货日K接口，周/月K由日K聚合
export async function fetchHistory(
  symbol: SymbolKey,
  period: KLinePeriod
): Promise<KLineItem[]> {
  return fetchSinaHistory(symbol, period)
}
