import { DEFAULT_PARAMS } from '../tax/engine'
import { DataTable } from './components/DataTable'
import { KpiTiles } from './components/KpiTiles'
import { ParamPanel } from './components/ParamPanel'
import { ProjectionChart } from './components/ProjectionChart'
import { TransitionChart } from './components/TransitionChart'
import { ZoneLegend } from './components/ZoneLegend'
import { fmtM } from './format'
import { useSimulation } from './useSimulation'

export function SimulatorPage() {
  const { params, update, setParams, reset, rows, transition, summary } = useSimulation(DEFAULT_PARAMS)
  const lastYear = rows[rows.length - 1].year

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Proyecto de Ley de Rescate Económico 2026</p>
        <h1>¿Cuánto cambia la renta de un profesor de universidad pública?</h1>
        <p className="lede">
          Simulador del impuesto de renta (cédula general) con el proyecto frente a la ley vigente. Mueva los controles
          para ver cómo cambian las curvas.
        </p>
      </header>

      <div className="layout">
        <ParamPanel params={params} update={update} onReset={reset}
          onPreset={(startMonthly) => setParams((prev) => ({ ...prev, startMonthly }))} />

        <main className="content">
          <KpiTiles firstYear={params.firstYear} years={params.years} summary={summary}
            breakevenPct={transition.breakevenPct} />

          {summary.capBinds && (
            <p className="callout">
              Las deducciones y rentas exentas que pide superan el tope del 40 % o 1.180 UVT. Sumar más beneficios
              personales <b>no reduce</b> el impuesto con el proyecto.
            </p>
          )}

          <section className="card">
            <h2>Salario mensual vs. renta anual, {params.firstYear}–{lastYear}</h2>
            <p className="sub">
              El fondo de cada año indica cuánto impuesto adicional genera cada $1 de aumento frente al año anterior.
              Este gráfico usa dos ejes con escalas distintas: compare la pendiente de cada línea, no los cruces.
            </p>
            <ZoneLegend />
            <ProjectionChart rows={rows} />
            <DataTable rows={rows} />
          </section>

          <section className="card">
            <h2>¿Desde qué aumento en {params.firstYear} deja de comerse el impuesto el aumento?</h2>
            <p className="sub">
              Al pasar de la ley vigente ({params.firstYear - 1}, salario de {fmtM(transition.baselineMonthly)} al mes)
              al proyecto ({params.firstYear}), se pierde la exención de los gastos de representación aunque el sueldo
              no suba. Por debajo del punto 1:1, el impuesto adicional es mayor que el aumento.
            </p>
            <TransitionChart transition={transition} selectedPct={params.transitionRaise} />
          </section>

          <section className="card notes">
            <h2>Reglas modeladas</h2>
            <ul>
              <li><b>Gastos de representación</b>: el art. 106 num. 1 del proyecto deroga el num. 9 del art. 206 ET (hoy es exento el 50 % del salario básico, por fuera del tope).</li>
              <li><b>Tope global</b>: 40 % del ingreso neto, con un máximo que baja de 1.340 a 1.180 UVT (art. 49). El 25 % exento queda limitado a 630 UVT (art. 47, hoy 790).</li>
              <li><b>Tarifas</b>: nueva tabla del art. 241 (art. 48). Tramo del 9 % entre 720 y 1.090 UVT, y 39 % desde 8.670 UVT.</li>
              <li><b>Dependientes</b>: se eliminan los 72 UVT por dependiente que hoy se restan por fuera del tope (art. 106 num. 1). Se mantiene el 10 % del art. 387 dentro del tope.</li>
              <li><b>Salud</b> (art. 21, desde el 1-ene-2027): en regímenes especiales, +1,5 pp con un IBC de 2 a 3 SMLMV y +2,5 pp por encima de 3 SMLMV. En el contributivo, una tabla del 4 % al 8 %. Pensión del 4 % y Fondo de Solidaridad del 1 % al 2 %.</li>
              <li><b>Ingreso anual</b>: 12 mensualidades más prestaciones y cesantías como porcentaje de ellas. Las cesantías se consignan al fondo cada año (art. 27 ET).</li>
              <li><b>Supuestos</b>: los valores parten de UVT 52.374 y SMLMV 1.750.905 (2026). No se incluyen saldos a favor ni anticipos. El impuesto es el total del año (retención + declaración). Solo rentas de trabajo; no se incluyen ingresos no constitutivos de renta por proyectos (art. 57-2).</li>
            </ul>
            <p className="disclaimer">
              Es un ejercicio académico sobre un <b>proyecto</b> de ley que puede cambiar en el Congreso. No constituye
              asesoría tributaria. Por el art. 338 de la Constitución, el cambio en renta aplicaría desde el periodo
              gravable siguiente a su vigencia.
            </p>
          </section>
        </main>
      </div>
    </div>
  )
}
