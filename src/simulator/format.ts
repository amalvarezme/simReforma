const millions = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const percent = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const cents = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const toM = (value: number) => value / 1e6
export const fmtM = (value: number) => `$${millions.format(toM(value))}M`
export const fmtPct = (ratio: number) => `${percent.format(ratio * 100)} %`
export const fmtPeso = (ratio: number) => (Number.isFinite(ratio) ? `$${cents.format(ratio)}` : '—')
