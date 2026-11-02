import { useId, useState } from 'react'

export interface ChartModelDisclosureProps {
  type: 'projection' | 'transition'
}

export function ChartModelDisclosure({ type }: ChartModelDisclosureProps) {
  const [isOpen, setIsOpen] = useState(false)
  const contentId = useId()

  const isProjection = type === 'projection'

  return (
    <div className="chart-disclosure">
      <button
        type="button"
        className={`disclosure-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-controls={contentId}
      >
        <span className="disclosure-btn-icon" aria-hidden="true">
          {isOpen ? '▾' : '▸'}
        </span>
        <span className="disclosure-btn-title">
          {isOpen
            ? 'Ocultar modelo matemático y suposiciones'
            : isProjection
              ? 'Ver modelo matemático y suposiciones de esta proyección'
              : 'Ver modelo matemático y suposiciones del punto de equilibrio'}
        </span>
        <span className="disclosure-btn-badge">Fórmulas y metodología</span>
      </button>

      {isOpen && (
        <div id={contentId} className="disclosure-panel" role="region">
          {isProjection ? <ProjectionModelContent /> : <TransitionModelContent />}
        </div>
      )}
    </div>
  )
}

function ProjectionModelContent() {
  return (
    <div className="disclosure-grid">
      <section className="disclosure-section">
        <h3>📐 Modelo Matemático de la Proyección (Multianual)</h3>
        <p className="disclosure-intro">
          Para cada año $t$ del horizonte simulado ($t \in [t_0, t_0 + n - 1]$), la simulación calcula el ingreso,
          la base gravable y el impuesto comparando el Proyecto de Ley con la Ley Vigente:
        </p>

        <div className="math-step">
          <h4>1. Indexación macroeconómica y salario mensual</h4>
          <p>
            Sea $k = t - 2026$ el número de periodos transcurridos desde el año base (2026) y $\pi$ la tasa de
            inflación esperada:
          </p>
          <div className="math-block">
            <code>UVT(t) = UVT_base × (1 + π)^k</code>
            <code>SMLMV(t) = SMLMV_base × (1 + π)^k</code>
            <code>S_mensual(t) = S_inicio × (1 + g)^(t - t_0)</code>
          </div>
          <p className="math-note">
            Donde $g$ es la tasa anual de crecimiento salarial ($g = \pi$ cuando los aumentos siguen la inflación).
          </p>
        </div>

        <div className="math-step">
          <h4>2. Ingreso bruto anual ($Gross$)</h4>
          <p>
            El ingreso bruto comprende 12 mensualidades más las prestaciones sociales (α_prest = 46.37 %) y
            las cesantías anualizadas (α_ces = 10.57 %):
          </p>
          <div className="math-block">
            <code>Base12 = 12 × S_mensual(t)</code>
            <code>Gross(t) = Base12 × (1 + α_prest + α_ces)</code>
          </div>
        </div>

        <div className="math-step">
          <h4>3. Aportes a seguridad social (INCR - arts. 55 y 56 ET)</h4>
          <p>
            El Ingreso Base de Cotización tiene tope legal de 25 SMLMV: $IBC = \min(S_mensual, 25 \times SMLMV)$.
          </p>
          <div className="math-block">
            <code>Aportes(t) = 12 × IBC × [ r_salud(t) + 0.04(pensión) + r_solidaridad(IBC) ]</code>
            <code>IngresoNeto(t) = Gross(t) - Aportes(t)</code>
          </div>
          <p className="math-note">
            En el proyecto (art. 21, desde 2027), la salud en régimen especial sube a 5.5 % (IBC de 2 a 3 SMLMV) o
            6.5 % (&gt; 3 SMLMV), frente al 4 % de la ley vigente.
          </p>
        </div>

        <div className="math-step">
          <h4>4. Deducciones y rentas exentas (art. 336 ET)</h4>
          <p>
            <b>Dentro del tope conjunto:</b> dependientes (art. 387: min[10% Gross, 384 UVT]), intereses de
            vivienda (art. 119: ≤ 1.200 UVT), medicina prepagada (art. 387: ≤ 192 UVT), ahorro
            voluntario/AFC (arts. 126-1 y 126-4) y el 25 % exento laboral (art. 206 num. 10):
          </p>
          <div className="math-block">
            <code>Exenta25 = min(0.25 × max(0, Neto - Deducciones - OtrasExentas), Tope25 × UVT)</code>
            <code>TopeGlobal = min(0.40 × IngresoNeto, TopeGlobal_UVT × UVT)</code>
            <code>DentroTope = min(Deducciones + OtrasExentas + Exenta25, TopeGlobal)</code>
          </div>
          <p className="math-note">
            El proyecto reduce <code>TopeGlobal_UVT</code> de 1.340 a 1.180 UVT (art. 49) y <code>Tope25</code> de 790
            a 630 UVT (art. 47).
          </p>
          <p>
            <b>Fuera del tope:</b>
          </p>
          <div className="math-block">
            <code>GastosRepresentacion = LeyVigente ? (0.50 × Base12 × share_basico) : 0</code>
            <code>Dependientes72 = LeyVigente ? (72 UVT × min(dependientes, 4)) : 0</code>
            <code>FueraTope = GastosRepresentacion + Dependientes72</code>
          </div>
        </div>

        <div className="math-step">
          <h4>5. Base gravable, impuesto y tasa marginal interanual</h4>
          <div className="math-block">
            <code>RentaGravable(t) = max(0, IngresoNeto - DentroTope - FueraTope)</code>
            <code>Impuesto(t) = Tarifa_Art241( RentaGravable / UVT ) × UVT</code>
            <code>ImpuestoPorPeso(t) = [ Impuesto(t) - Impuesto(t-1) ] / [ Gross(t) - Gross(t-1) ]</code>
          </div>
        </div>
      </section>

      <section className="disclosure-section">
        <h3>📋 Suposiciones de la Simulación de esta Gráfica</h3>
        <ul className="assumptions-list">
          <li>
            <b>Indexación por inflación:</b> La UVT base ($52.374 en 2026) y el SMLMV ($1.750.905 en 2026) se indexan
            anualmente con la inflación estimada (5.0 % por defecto). Cuando el control de aumentos por inflación está
            activo, los salarios siguen exactamente esta misma tasa.
          </li>
          <li>
            <b>Estructura profesoral (Decreto 1279 de 2002):</b> Se modela la remuneración mensual de un profesor de
            universidad pública dividida entre 50.91 % de asignación básica y 49.09 % de gastos de representación.
          </li>
          <li>
            <b>Derogatoria de gastos de representación:</b> El art. 106 num. 1 del proyecto deroga el numeral 9 del art.
            206 del ET. Esto genera que en el primer año proyectado (2027) el 100 % de los gastos
            de representación pase a ser gravable dentro de la cédula general.
          </li>
          <li>
            <b>Prestaciones y cesantías anuales:</b> Primas proporcionales al 46.37 % del sueldo básico anual y cesantías
            al 10.57 %, asumiendo consignación anual a fondos de cesantías (art. 27 ET).
          </li>
          <li>
            <b>Régimen de salud docente:</b> Se asume régimen especial de salud docente universitaria (o contributivo si
            el usuario lo selecciona) aplicando la sobretasa del art. 21 del proyecto de ley a partir de 2027.
          </li>
          <li>
            <b>Exclusividad de rentas de trabajo:</b> No se computan ingresos no constitutivos de investigación
            (art. 57-2 ET), ni rentas de capital o dividendos. No se incluyen retenciones en la fuente acumuladas ni
            anticipos de años previos.
          </li>
          <li>
            <b>Vigencia constitucional:</b> Conforme al artículo 338 de la Constitución Política de Colombia, las leyes
            tributarias de periodo entran a regir a partir del periodo gravable siguiente a su promulgación.
          </li>
        </ul>
      </section>
    </div>
  )
}

function TransitionModelContent() {
  return (
    <div className="disclosure-grid">
      <section className="disclosure-section">
        <h3>📐 Modelo Matemático del Punto de Equilibrio (Transición 2026 → 2027)</h3>
        <p className="disclosure-intro">
          Esta curva evalúa la sensibilidad del impuesto adicional ante variaciones del aumento salarial ($p \in [0.5\%,
          30\%]$) al cruzar de la ley vigente previa al primer año de la reforma:
        </p>

        <div className="math-step">
          <h4>1. Línea base previa (2026, Ley Vigente)</h4>
          <p>
            A partir del salario inicial proyectado $S_{2027}$ y el aumento de transición asumido r_trans:
          </p>
          <div className="math-block">
            <code>S_2026 = S_2027 / (1 + r_trans)</code>
            <code>Gross_2026 = 12 × S_2026 × (1 + α_prest + α_ces)</code>
          </div>
          <p className="math-note">
            Se liquida el año 2026 con UVT 2026 ($52.374), exención del 50 % de gastos de representación, tope de 1.340
            UVT y tabla del art. 241 vigente, obteniendo <code>Impuesto_vigente(2026)</code> y <code>Aportes_vigente(2026)</code>.
          </p>
        </div>

        <div className="math-step">
          <h4>2. Evaluación paramétrica del aumento ($p \in [0.5\%, 30\%]$)</h4>
          <p>Para cada porcentaje de aumento salarial evaluado en pasos de 0.5 %:</p>
          <div className="math-block">
            <code>S_2027(p) = S_2026 × (1 + p)</code>
            <code>Gross_2027(p) = 12 × S_2027(p) × (1 + α_prest + α_ces)</code>
            <code>ΔGross(p) = Gross_2027(p) - Gross_2026 &gt; 0</code>
          </div>
          <p className="math-note">
            Se liquida el año 2027 con las reglas del Proyecto de Ley (sin exención de gastos de representación, nuevo
            tope de 1.180 UVT y nueva tabla de tarifas), obteniendo <code>Impuesto_proyecto(2027, p)</code>.
          </p>
        </div>

        <div className="math-step">
          <h4>3. Razón marginal tributaria e impuesto por cada peso</h4>
          <div className="math-block">
            <code>ImpuestoPorPeso(p) = [ Impuesto_proyecto(2027, p) - Impuesto_vigente(2026) ] / ΔGross(p)</code>
            <code>CargasPorPeso(p) = [ (Impuesto_2027 + Aportes_2027) - (Impuesto_2026 + Aportes_2026) ] / ΔGross(p)</code>
          </div>
        </div>

        <div className="math-step">
          <h4>4. Ecuación del punto de equilibrio 1:1 ($p^*$)</h4>
          <p>
            El punto de equilibrio es el porcentaje mínimo de aumento donde el incremento del impuesto iguala
            exactamente al incremento del ingreso bruto:
          </p>
          <div className="math-block">
            <code>{'p* = min { p ∈ (0, 30%] | ImpuestoPorPeso(p) ≤ 1.00 }'}</code>
          </div>
          <p className="math-note">
            Si el aumento $p &lt; p^*$, el impuesto adicional supera el aumento del salario ($\Delta Impuesto &gt;
            \Delta Gross$), haciendo que el ingreso disponible neto disminuya respecto al año anterior.
          </p>
        </div>

        <div className="math-step">
          <h4>5. Clasificación de zonas de impacto</h4>
          <div className="math-block">
            <code>Zona Roja (Pérdida neta): ImpuestoPorPeso &gt; $1.10</code>
            <code>Franja Amarilla (Equilibrio): $0.90 ≤ ImpuestoPorPeso ≤ $1.10</code>
            <code>Zona Verde (Ganancia neta): ImpuestoPorPeso &lt; $0.90</code>
          </div>
        </div>
      </section>

      <section className="disclosure-section">
        <h3>📋 Suposiciones de la Simulación de esta Gráfica</h3>
        <ul className="assumptions-list">
          <li>
            <b>Shock estructural no lineal:</b> La transición entre 2026 y 2027 combina dos fenómenos simultáneos: un
            aumento salarial porcentual y un cambio de marco normativo. La pérdida de la exención de gastos de
            representación crea un cargo impositivo fijo aunque el salario no aumente ($p = 0$).
          </li>
          <li>
            <b>Dilución asintótica del costo fijo:</b> Para aumentos muy pequeños ($p \to 0$), el denominador $\Delta
            Gross \to 0$, por lo que la razón $\Delta Impuesto / \Delta Gross \to \infty$. A medida que el aumento crece,
            el costo fijo de la reforma se reparte entre más pesos de aumento salarial, y la curva converge hacia la
            tarifa marginal de la nueva tabla.
          </li>
          <li>
            <b>Truncamiento visual a $3.0:</b> Para garantizar una lectura útil en aumentos pequeños donde la razón
            tiende a infinito, el eje vertical se acota gráficamente a un máximo de $3.00 por cada $1 de aumento.
          </li>
          <li>
            <b>Condición Ceteris Paribus:</b> Se mantienen constantes las deducciones personales del profesor
            (dependientes, medicina prepagada, intereses de vivienda y ahorro voluntario) entre 2026 y 2027 para medir
            puramente el efecto del aumento salarial frente a la reforma.
          </li>
          <li>
            <b>Sobretasa a salud desde 2027:</b> El artículo 21 del proyecto dispone que la nueva contribución a salud
            entra en vigor a partir del 1 de enero de 2027, impactando directamente la curva de <i>Impuesto + aportes</i>.
          </li>
          <li>
            <b>Resolución de la grilla:</b> La curva se calcula evaluando incrementos salariales desde 0.5 % hasta 30.0 %
            en intervalos uniformes de 0.5 puntos porcentuales (60 puntos calculados por simulación completa).
          </li>
        </ul>
      </section>
    </div>
  )
}
