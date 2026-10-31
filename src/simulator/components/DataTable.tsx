import type { ProjectionRow } from '../../tax/engine'
import { fmtM, fmtPct, fmtPeso } from '../format'

export function DataTable({ rows }: { rows: ProjectionRow[] }) {
  return (
    <details className="table-wrap">
      <summary>Ver tabla de datos</summary>
      <div className="scroll">
        <table>
          <thead>
            <tr>
              <th>Año</th>
              <th>Salario mensual</th>
              <th>Ingreso anual</th>
              <th>Aportes (proyecto)</th>
              <th>Renta (proyecto)</th>
              <th>Tasa efectiva</th>
              <th>Renta (vigente)</th>
              <th>Diferencia</th>
              <th>Impuesto por $1 de aumento</th>
              <th>Ingreso disponible (proyecto)</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.year}>
                <td>{r.year}</td>
                <td>{fmtM(r.monthly)}</td>
                <td>{fmtM(r.bill.gross)}</td>
                <td>{fmtM(r.bill.contributions)}</td>
                <td>{fmtM(r.bill.tax)}</td>
                <td>{fmtPct(r.bill.effectiveRate)}</td>
                <td>{fmtM(r.current.tax)}</td>
                <td>+{fmtM(r.bill.tax - r.current.tax)}</td>
                <td>{fmtPeso(r.taxPerPeso)}</td>
                <td>{fmtM(r.bill.disposable)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
