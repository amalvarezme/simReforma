import { useMemo, useState } from 'react'
import { DEFAULT_PARAMS, project, resolveRaises, transitionCurve, type Params } from '../tax/engine'

export function useSimulation(initial: Params = DEFAULT_PARAMS) {
  const [params, setParams] = useState<Params>(initial)

  // Params as simulated: raises replaced by inflation when they follow the IPC.
  const effective = useMemo(() => resolveRaises(params), [params])
  const rows = useMemo(() => project(params), [params])
  const transition = useMemo(() => transitionCurve(params), [params])

  const summary = useMemo(() => {
    const first = rows[0]
    const last = rows[rows.length - 1]
    const sum = (pick: (r: (typeof rows)[number]) => number) => rows.reduce((acc, r) => acc + pick(r), 0)
    return {
      firstBill: first.bill.tax,
      firstCurrent: first.current.tax,
      extraTaxTotal: sum((r) => r.bill.tax - r.current.tax),
      extraContribTotal: sum((r) => r.bill.contributions - r.current.contributions),
      lastEffective: last.bill.effectiveRate,
      lastEffectiveCurrent: last.current.effectiveRate,
      firstTaxPerPeso: first.taxPerPeso,
      capBinds: first.bill.requestedInsideCap >= first.bill.globalCap,
    }
  }, [rows])

  const update = <K extends keyof Params>(key: K, value: Params[K]) => setParams((prev) => ({ ...prev, [key]: value }))
  const reset = () => setParams(initial)

  return { params, effective, update, setParams, reset, rows, transition, summary }
}
