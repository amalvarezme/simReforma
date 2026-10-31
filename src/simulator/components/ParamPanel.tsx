import type { Params } from '../../tax/engine'
import { ParamSlider } from './ParamSlider'

interface ParamPanelProps {
  params: Params
  /** Previous-year salary under the current law, derived from the start salary and the transition raise. */
  baselineMonthly: number
  update: <K extends keyof Params>(key: K, value: Params[K]) => void
  onPreset: (startMonthly: number) => void
  onReset: () => void
}

const pct = (v: number) => `${(v * 100).toLocaleString('es-CO', { maximumFractionDigits: 1 })} %`
const money = (v: number) => `$${(v / 1e6).toLocaleString('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 2 })}M`
const PRESETS = [10e6, 20e6, 30e6]

export function ParamPanel({ params: p, baselineMonthly, update, onPreset, onReset }: ParamPanelProps) {
  return (
    <aside className="panel">
      <section>
        <h3>Escenarios rápidos</h3>
        <div className="presets">
          {PRESETS.map((value) => (
            <button
              key={value}
              type="button"
              className={p.startMonthly === value ? 'preset active' : 'preset'}
              onClick={() => onPreset(value)}
            >
              {money(value)}
            </button>
          ))}
          <button type="button" className="preset ghost" onClick={onReset}>
            Restablecer
          </button>
        </div>
      </section>

      <section>
        <h3>Salario</h3>
        <ParamSlider label="Salario mensual inicial" value={p.startMonthly} min={3e6} max={60e6} step={0.5e6}
          format={money} hint="Asignación básica + gastos de representación"
          onChange={(v) => update('startMonthly', v)} />
        <ParamSlider label={`Aumento en ${p.firstYear} (año de transición)`} value={p.transitionRaise} min={0} max={0.25}
          step={0.005} format={pct}
          hint={`Fija el salario de ${p.firstYear - 1} (ley vigente) en ${money(baselineMonthly)}: salario inicial ÷ (1 + aumento). Por eso la curva del punto de equilibrio se recalcula al moverlo`}
          onChange={(v) => update('transitionRaise', v)} />
        <ParamSlider label="Aumento salarial anual" value={p.salaryGrowth} min={0} max={0.25} step={0.005}
          format={pct} hint="Escenario base: igual a la inflación (IPC)" onChange={(v) => update('salaryGrowth', v)} />
        <ParamSlider label="Años proyectados" value={p.years} min={3} max={20} step={1}
          format={(v) => `${v} años`} onChange={(v) => update('years', v)} />
      </section>

      <section>
        <h3>Entorno</h3>
        <ParamSlider label="Inflación, IPC (crecimiento de UVT y SMLMV)" value={p.inflation} min={0.02} max={0.12}
          step={0.005} format={pct} onChange={(v) => update('inflation', v)} />
        <div className="toggle-row" role="radiogroup" aria-label="Régimen de salud">
          <span className="param-label">Régimen de salud</span>
          <div className="segmented">
            <button type="button" className={p.healthRegime === 'special' ? 'active' : ''}
              onClick={() => update('healthRegime', 'special')}>Especial</button>
            <button type="button" className={p.healthRegime === 'contributory' ? 'active' : ''}
              onClick={() => update('healthRegime', 'contributory')}>Contributivo</button>
          </div>
          <span className="param-hint">Especial (p. ej. Unisalud): +1,5 pp con un IBC de 2 a 3 SMLMV y +2,5 pp por encima. Contributivo: tabla del 4 % al 8 %.</span>
        </div>
      </section>

      <section>
        <h3>Estructura de la remuneración</h3>
        <ParamSlider label="Prestaciones (primas y bonificaciones)" value={p.benefitsShare} min={0.2} max={0.7}
          step={0.005} format={pct} hint="Porcentaje sobre 12 mensualidades. Por ley son ~30–40 %; con bonificaciones de productividad, ~46 %"
          onChange={(v) => update('benefitsShare', v)} />
        <ParamSlider label="Cesantías + intereses" value={p.severanceShare} min={0} max={0.15} step={0.0025}
          format={pct} hint="Porcentaje sobre 12 mensualidades; se consignan al fondo cada año"
          onChange={(v) => update('severanceShare', v)} />
        <ParamSlider label="Asignación básica dentro del salario" value={p.salaryShare} min={0.4} max={1} step={0.005}
          format={pct} hint="El resto son gastos de representación. La exención vigente es el 50 % de la básica"
          onChange={(v) => update('salaryShare', v)} />
      </section>

      <section>
        <h3>Beneficios personales</h3>
        <ParamSlider label="Dependientes" value={p.dependents} min={0} max={4} step={1}
          format={(v) => `${v}`} onChange={(v) => update('dependents', v)} />
        <ParamSlider label="Intereses de vivienda o leasing (mes)" value={p.housingInterestMonthly} min={0} max={8e6}
          step={0.1e6} format={money} onChange={(v) => update('housingInterestMonthly', v)} />
        <ParamSlider label="Medicina prepagada o plan complementario (mes)" value={p.prepaidHealthMonthly} min={0}
          max={1.5e6} step={0.05e6} format={money} onChange={(v) => update('prepaidHealthMonthly', v)} />
        <ParamSlider label="Aportes voluntarios FPV o AFC (mes)" value={p.voluntarySavingsMonthly} min={0} max={15e6}
          step={0.25e6} format={money} onChange={(v) => update('voluntarySavingsMonthly', v)} />
        <label className="check">
          <input type="checkbox" checked={p.severanceExemption}
            onChange={(e) => update('severanceExemption', e.target.checked)} />
          Aplicar la exención de cesantías (art. 206 num. 4)
        </label>
      </section>
    </aside>
  )
}
