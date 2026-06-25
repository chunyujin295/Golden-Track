import type { BrandPrice } from '../../src/types'
import { fetchRealtime } from './sina'

// 品牌实物金价：周大福/潮宏基等官网为动态渲染，首版基于沪金基准 + 合理品牌溢价
// 生成参考价（首饰金溢价约 120-135 元/克，投资金条溢价约 12-18 元/克）。
// 真实门店金价待接入 BrowserWindow 页面抓取或第三方聚合源。
const BRAND_PREMIUMS = [
  { brand: '周大福', jewelryAdd: 135, barAdd: 18 },
  { brand: '潮宏基', jewelryAdd: 128, barAdd: 16 },
  { brand: '老凤祥', jewelryAdd: 130, barAdd: 17 },
  { brand: '中国黄金', jewelryAdd: 120, barAdd: 12 }
]

export async function fetchBrandPrices(): Promise<BrandPrice[]> {
  const au = await fetchRealtime('AU').catch(() => null)
  const base = au?.price || 550
  const change = au?.change || 0
  return BRAND_PREMIUMS.map((p) => ({
    brand: p.brand,
    jewelry: round(base + p.jewelryAdd),
    bar: round(base + p.barAdd),
    change: round(change),
    updateTime: au ? '今日参考' : '示例数据'
  }))
}

function round(n: number): number {
  return Math.round(n * 10) / 10
}
