const millions = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const percent = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 })
const whole = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 })
const cents =new Intl.NumberFormat('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export const toM = (value: number) => value / 1e6
export const fmtM = (value: number) => `$${millions.format(toM(value))}M`
export const fmtPct = (ratio: number) => `${percent.format(ratio * 100)} %`
/** Axis tick already expressed in millions, e.g. 4500 -> "$4.500M". */
export const fmtAxisM = (millionsValue: number) => `$${whole.format(millionsValue)}M`
/** Raise given in percent points, e.g. 7.5 -> "7,5 %". */
export const fmtRaise = (pct: number) => `${String(pct).replace('.', ',')} %`
export const fmtPeso =(ratio: number) => (Number.isFinite(ratio) ? `$${cents.format(ratio)}` : '—')
