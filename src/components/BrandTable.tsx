import type { BrandPrice, BrandWithPremium } from '@/types'

export default function BrandTable({
  brands,
  auBenchmark
}: {
  brands: BrandPrice[]
  auBenchmark: number | null
}) {
  const rows: BrandWithPremium[] = brands.map((b) => {
    const premium = auBenchmark ? b.jewelry - auBenchmark : 0
    const premiumPercent = auBenchmark ? (premium / auBenchmark) * 100 : 0
    return { ...b, premium, premiumPercent }
  })

  return (
    <div className="brand-panel">
      <div className="brand-head">
        <span>品牌实物金价对比</span>
        <span className="muted">
          {auBenchmark ? `沪金基准 ¥${auBenchmark.toFixed(1)}/克` : '基准加载中…'}
        </span>
      </div>
      <table className="brand">
        <thead>
          <tr>
            <th>品牌</th>
            <th>首饰金(元/克)</th>
            <th>投资金条(元/克)</th>
            <th>日涨跌</th>
            <th>溢价(vs沪金)</th>
            <th>更新</th>
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={6} className="muted" style={{ textAlign: 'center' }}>
                加载中…
              </td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.brand}>
              <td className="brand-name">{r.brand}</td>
              <td>{r.jewelry.toFixed(1)}</td>
              <td>{r.bar.toFixed(1)}</td>
              <td className={r.change >= 0 ? 'up' : 'down'}>
                {r.change >= 0 ? '+' : ''}
                {r.change.toFixed(1)}
              </td>
              <td className={r.premium >= 0 ? 'up' : 'muted'}>
                {r.premium >= 0 ? '+' : ''}
                {r.premium.toFixed(1)} ({r.premiumPercent.toFixed(1)}%)
              </td>
              <td className="muted">{r.updateTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
