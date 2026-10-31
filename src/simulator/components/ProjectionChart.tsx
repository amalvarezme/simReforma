import {
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { zoneOf, type ProjectionRow } from '../../tax/engine'
import { fmtAxisM, fmtM, fmtPct, fmtPeso, toM } from '../format'
import { COLORS, ZONE_FILL } from '../theme'

interface ProjectionChartProps {
  rows: ProjectionRow[]
}

interface Datum {
  year: number
  salary: number
  taxBill: number
  taxCurrent: number
  row: ProjectionRow
}

function ProjectionTooltip({ active, payload }: { active?: boolean; payload?: { payload: Datum }[] }) {
  if (!active || !payload?.length) return null
  const { row } = payload[0].payload
  return (
    <div className="tooltip">
      <strong>{row.year}</strong>
      <span>Salario mensual: {fmtM(row.monthly)}</span>
      <span>Ingreso anual: {fmtM(row.bill.gross)}</span>
      <span className="t-bill">Renta con el proyecto: {fmtM(row.bill.tax)} ({fmtPct(row.bill.effectiveRate)})</span>
      <span>Renta con la ley vigente: {fmtM(row.current.tax)}</span>
      <span>Diferencia: +{fmtM(row.bill.tax - row.current.tax)}</span>
      <span>
        Impuesto por cada $1 de aumento: <b>{fmtPeso(row.taxPerPeso)}</b> (con aportes {fmtPeso(row.chargesPerPeso)})
      </span>
    </div>
  )
}

export function ProjectionChart({ rows }: ProjectionChartProps) {
  const data: Datum[] = rows.map((row) => ({
    year: row.year,
    salary: toM(row.monthly),
    taxBill: toM(row.bill.tax),
    taxCurrent: toM(row.current.tax),
    row,
  }))
  const first = rows[0].year
  const last = rows[rows.length - 1].year

  return (
    <>
      <div className="axis-captions" aria-hidden="true">
        <span>Salario mensual (millones), eje izq.</span>
        <span>Renta anual (millones), eje der.</span>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <ComposedChart data={data} margin={{ top: 14, right: 4, bottom: 8, left: 4 }}>
          {rows.map((row) => (
            <ReferenceArea key={row.year} yAxisId="salary" x1={row.year - 0.5} x2={row.year + 0.5}
              fill={ZONE_FILL[zoneOf(row.taxPerPeso)]} fillOpacity={1} stroke="none" ifOverflow="extendDomain" />
          ))}
          <CartesianGrid stroke={COLORS.grid} vertical={false} />
          <XAxis dataKey="year" type="number" domain={[first - 0.5, last + 0.5]} allowDataOverflow niceTicks="none" ticks={rows.map((r) => r.year)}
            stroke={COLORS.axis} tick={{ fill: COLORS.text, fontSize: 12 }} allowDecimals={false} />
          <YAxis yAxisId="salary" width="auto" stroke={COLORS.axis} tick={{ fill: COLORS.text, fontSize: 12 }}
            tickFormatter={fmtAxisM} />
          <YAxis yAxisId="tax" orientation="right" width="auto" stroke={COLORS.axis} tick={{ fill: COLORS.text, fontSize: 12 }}
            tickFormatter={fmtAxisM} />
          <Tooltip content={<ProjectionTooltip />} />
          <Legend wrapperStyle={{ fontSize: 13, color: COLORS.text }} />
          <Line yAxisId="salary" dataKey="salary" name="Salario mensual (eje izq.)" stroke={COLORS.salary}
            strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
          <Line yAxisId="tax" dataKey="taxBill" name="Renta anual con el proyecto (eje der.)" stroke={COLORS.taxBill}
            strokeWidth={2} dot={{ r: 4 }} isAnimationActive={false} />
          <Line yAxisId="tax" dataKey="taxCurrent" name="Renta anual con la ley vigente (eje der.)" stroke={COLORS.taxCurrent}
            strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </>
  )
}
