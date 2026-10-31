import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ZONE_LIMITS, type TransitionResult } from '../../tax/engine'
import { fmtPeso } from '../format'
import { COLORS, ZONE_FILL } from '../theme'

interface TransitionChartProps {
  transition: TransitionResult
  selectedPct: number
}

const Y_MAX = 3

export function TransitionChart({ transition, selectedPct }: TransitionChartProps) {
  const data = transition.points.map((pt) => ({
    pct: pt.pct,
    tax: Math.min(pt.taxPerPeso, Y_MAX),
    charges: Math.min(pt.chargesPerPeso, Y_MAX),
    raw: pt,
  }))
  const breakeven = transition.breakevenPct

  return (
    <ResponsiveContainer width="100%" height={360}>
      <LineChart data={data} margin={{ top: 16, right: 24, bottom: 24, left: 8 }}>
        <ReferenceArea y1={0} y2={ZONE_LIMITS.gain} fill={ZONE_FILL.gain} fillOpacity={1} stroke="none" />
        <ReferenceArea y1={ZONE_LIMITS.gain} y2={ZONE_LIMITS.loss} fill={ZONE_FILL.balance} fillOpacity={1} stroke="none" />
        <ReferenceArea y1={ZONE_LIMITS.loss} y2={Y_MAX} fill={ZONE_FILL.loss} fillOpacity={1} stroke="none" />
        <CartesianGrid stroke={COLORS.grid} vertical={false} />
        <XAxis dataKey="pct" type="number" domain={[0, 30]} ticks={[0, 5, 10, 15, 20, 25, 30]}
          tickFormatter={(v: number) => `${v} %`} stroke={COLORS.axis} tick={{ fill: COLORS.text, fontSize: 12 }}
          label={{ value: 'Aumento salarial en el año de transición', position: 'insideBottom', dy: 20, fill: COLORS.text, fontSize: 12 }} />
        <YAxis domain={[0, Y_MAX]} ticks={[0, 0.5, 1, 1.5, 2, 2.5, 3]} tickFormatter={(v: number) => fmtPeso(v)}
          stroke={COLORS.axis} tick={{ fill: COLORS.text, fontSize: 12 }}
          label={{ value: 'Impuesto adicional por cada $1', angle: -90, position: 'insideLeft', fill: COLORS.text, fontSize: 12, dy: 90 }} />
        <Tooltip
          formatter={(_value, name, item) => {
            const raw = (item.payload as (typeof data)[number]).raw
            return [fmtPeso(name === 'Solo impuesto' ? raw.taxPerPeso : raw.chargesPerPeso), name]
          }}
          labelFormatter={(label) => `Aumento del ${String(label).replace('.', ',')} %`}
        />
        <Legend verticalAlign="top" wrapperStyle={{ fontSize: 13, color: COLORS.text, paddingBottom: 16 }} />
        {breakeven !== null && (
          <ReferenceLine x={breakeven} stroke="#0b0b0b" strokeDasharray="3 3"
            label={{ value: `1:1 en ${String(breakeven).replace('.', ',')} %`, position: 'top', fill: '#0b0b0b', fontSize: 12 }} />
        )}
        <ReferenceLine x={selectedPct * 100} stroke={COLORS.salary} strokeWidth={2}
          label={{ value: 'Su escenario', position: 'insideTopRight', fill: COLORS.salary, fontSize: 12 }} />
        <Line dataKey="tax" name="Solo impuesto" stroke={COLORS.taxBill} strokeWidth={2} dot={false} isAnimationActive={false} />
        <Line dataKey="charges" name="Impuesto + aportes" stroke={COLORS.taxCurrent} strokeWidth={2}
          strokeDasharray="6 4" dot={false} isAnimationActive={false} />
      </LineChart>
    </ResponsiveContainer>
  )
}
