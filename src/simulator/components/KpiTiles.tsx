import { fmtM, fmtPct, fmtPeso, fmtRaise } from '../format'

interface KpiTilesProps {
  firstYear: number
  years: number
  summary: {
    firstBill: number
    firstCurrent: number
    extraTaxTotal: number
    extraContribTotal: number
    lastEffective: number
    lastEffectiveCurrent: number
    firstTaxPerPeso: number
  }
  breakevenPct: number | null
}

export function KpiTiles({ firstYear, years, summary: s, breakevenPct }: KpiTilesProps) {
  const breakeven =
    breakevenPct === 0
      ? { value: 'Cualquiera', note: `con cualquier aumento en ${firstYear} el impuesto adicional es menor que el aumento` }
      : {
          value: breakevenPct === null ? '> 30 %' : fmtRaise(breakevenPct),
          note: `aumento en ${firstYear} desde el que el impuesto adicional es menor que el aumento`,
        }
  const tiles = [
    { label: `Renta en ${firstYear}`, value: fmtM(s.firstBill), note: `vs. ${fmtM(s.firstCurrent)} con la ley vigente` },
    { label: `Renta adicional en ${years} años`, value: `+${fmtM(s.extraTaxTotal)}`, note: `y +${fmtM(s.extraContribTotal)} en salud` },
    { label: `Impuesto por cada $1 de aumento en ${firstYear}`, value: fmtPeso(s.firstTaxPerPeso), note: 'año del cambio de ley' },
    { label: 'Aumento mínimo para no perder', ...breakeven },
    { label: 'Tasa efectiva al final', value: fmtPct(s.lastEffective), note: `vs. ${fmtPct(s.lastEffectiveCurrent)} con la ley vigente` },
  ]
  return (
    <div className="kpis">
      {tiles.map((tile) => (
        <div className="kpi" key={tile.label}>
          <span className="kpi-label">{tile.label}</span>
          <span className="kpi-value">{tile.value}</span>
          <span className="kpi-note">{tile.note}</span>
        </div>
      ))}
    </div>
  )
}
