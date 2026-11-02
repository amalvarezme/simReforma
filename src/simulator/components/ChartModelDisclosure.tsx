import { useId, useState } from 'react'
import { MathView } from './MathView'

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
        <span className="disclosure-btn-badge">Fórmulas compiladas</span>
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
          Para cada año <MathView math="t" /> del horizonte simulado (<MathView math="t \in [t_0, t_0 + n - 1]" />), la
          simulación calcula el ingreso, la base gravable y el impuesto comparando el Proyecto de Ley frente a la Ley
          Vigente:
        </p>

        <div className="math-step">
          <h4>1. Indexación macroeconómica y salario mensual</h4>
          <p>
            Sea <MathView math="k = t - 2026" /> el número de periodos transcurridos desde el año base (2026) y{' '}
            <MathView math="\pi" /> la tasa de inflación esperada:
          </p>
          <MathView
            block
            math={`\\begin{aligned}
\\text{UVT}_t &= \\text{UVT}_{2026} \\cdot (1 + \\pi)^k \\\\[4pt]
\\text{SMLMV}_t &= \\text{SMLMV}_{2026} \\cdot (1 + \\pi)^k \\\\[4pt]
S_t &= S_0 \\cdot (1 + g)^{t - t_0}
\\end{aligned}`}
          />
          <p className="math-note">
            Donde <MathView math="g" /> es la tasa anual de crecimiento salarial (<MathView math="g = \pi" /> cuando los
            aumentos siguen la inflación).
          </p>
        </div>

        <div className="math-step">
          <h4>2. Ingreso bruto anual (<MathView math="\text{Gross}_t" />)</h4>
          <p>
            El ingreso bruto comprende 12 mensualidades más las prestaciones sociales (<MathView math="\alpha_{\text{prest}} = 46.37\%" />) y
            las cesantías anualizadas consignadas (<MathView math="\alpha_{\text{ces}} = 10.57\%" />):
          </p>
          <MathView
            block
            math={`\\begin{aligned}
\\text{Base}_{12} &= 12 \\cdot S_t \\\\[4pt]
\\text{Gross}_t &= \\text{Base}_{12} \\cdot (1 + \\alpha_{\\text{prest}} + \\alpha_{\\text{ces}})
\\end{aligned}`}
          />
        </div>

        <div className="math-step">
          <h4>3. Aportes a seguridad social (INCR - arts. 55 y 56 ET)</h4>
          <p>
            El Ingreso Base de Cotización tiene tope legal de 25 SMLMV:{' '}
            <MathView math="\text{IBC}_t = \min(S_t, \; 25 \\cdot \\text{SMLMV}_t)" />.
          </p>
          <MathView
            block
            math={`\\begin{aligned}
\\text{Aportes}_t &= 12 \\cdot \\text{IBC}_t \\cdot \\Big[ r_{\\text{salud}}(t) + 0.04_{\\text{pensión}} + r_{\\text{solidaridad}}(\\text{IBC}_t) \\Big] \\\\[4pt]
\\text{Neto}_t &= \\text{Gross}_t - \\text{Aportes}_t
\\end{aligned}`}
          />
          <p className="math-note">
            En el proyecto (art. 21, desde 2027), la cotización a salud en régimen especial sube a 5.5 % (si IBC está
            entre 2 y 3 SMLMV) o 6.5 % (si supera 3 SMLMV), frente al 4 % de la ley vigente.
          </p>
        </div>

        <div className="math-step">
          <h4>4. Depuración de la Cédula General y Topes Legales (art. 336 ET)</h4>
          <p>
            <b>Beneficios dentro del tope conjunto:</b> dependientes (art. 387: <MathView math="\min[0.10 \\cdot \\text{Gross}, 384\\text{ UVT}]" />),
            intereses de vivienda (art. 119: <MathView math="\le 1.200\\text{ UVT}" />), medicina prepagada (art. 387: <MathView math="\le 192\\text{ UVT}" />),
            ahorro voluntario FPV/AFC (arts. 126-1, 126-4) y el 25 % exento laboral (art. 206 num. 10):
          </p>
          <MathView
            block
            math={`\\begin{aligned}
\\text{Exenta}_{25\\%} &= \\min\\Big(0.25 \\cdot \\max(0, \\text{Neto}_t - \\text{Ded} - \\text{Exentas}), \\; \\text{Tope}_{25} \\cdot \\text{UVT}_t\\Big) \\\\[6pt]
\\text{Tope}_{\\text{global}} &= \\min\\Big(0.40 \\cdot \\text{Neto}_t, \\; \\text{Tope}_{\\text{UVT}} \\cdot \\text{UVT}_t\\Big) \\\\[6pt]
\\text{Dentro} &= \\min\\Big(\\text{Deducciones} + \\text{Exentas} + \\text{Exenta}_{25\\%}, \\; \\text{Tope}_{\\text{global}}\\Big)
\\end{aligned}`}
          />
          <p className="math-note">
            El proyecto reduce <MathView math="\\text{Tope}_{\\text{UVT}}" /> de 1.340 a 1.180 UVT (art. 49) y{' '}
            <MathView math="\\text{Tope}_{25}" /> de 790 a 630 UVT (art. 47).
          </p>
          <p>
            <b>Beneficios fuera del tope conjunto:</b>
          </p>
          <MathView
            block
            math={`\\text{Fuera} = \\begin{cases} 
0.50 \\cdot \\text{Base}_{12} \\cdot \\text{share}_{\\text{básico}} + 72\\,\\text{UVT} \\cdot \\min(\\text{dep}, 4) & \\text{(Ley vigente)} \\\\[4pt]
0 & \\text{(Proyecto de Ley)} 
\\end{cases}`}
          />
        </div>

        <div className="math-step">
          <h4>5. Base gravable, impuesto y tasa marginal interanual</h4>
          <MathView
            block
            math={`\\begin{aligned}
\\text{RentaLiquida}_t &= \\max(0, \\; \\text{Neto}_t - \\text{Dentro} - \\text{Fuera}) \\\\[6pt]
\\text{Impuesto}_t &= \\text{Tarifa}_{\\text{art. } 241}\\!\\left( \\frac{\\text{RentaLiquida}_t}{\\text{UVT}_t} \\right) \\cdot \\text{UVT}_t \\\\[6pt]
\\text{ImpuestoPorPeso}_t &= \\frac{\\text{Impuesto}_t - \\text{Impuesto}_{t-1}}{\\text{Gross}_t - \\text{Gross}_{t-1}}
\\end{aligned}`}
          />
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
            206 del ET. Esto genera que en el primer año gravable (2027) el 100 % de los gastos de representación pase a
            ser gravable dentro de la cédula general.
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
          Esta curva evalúa la respuesta del impuesto adicional ante variaciones paramétricas del aumento salarial (
          <MathView math="p \in [0.5\%, 30\%]" />) al transitar de la ley vigente previa al primer año de la reforma:
        </p>

        <div className="math-step">
          <h4>1. Línea base previa (2026, Ley Vigente)</h4>
          <p>
            A partir del salario inicial proyectado <MathView math="S_{2027}" /> y el aumento de transición asumido{' '}
            <MathView math="r_{\\text{trans}}" />:
          </p>
          <MathView
            block
            math={`\\begin{aligned}
S_{2026} &= \\frac{S_{2027}}{1 + r_{\\text{trans}}} \\\\[6pt]
\\text{Gross}_{2026} &= 12 \\cdot S_{2026} \\cdot (1 + \\alpha_{\\text{prest}} + \\alpha_{\\text{ces}})
\\end{aligned}`}
          />
          <p className="math-note">
            Se liquida el año 2026 con UVT 2026 ($52.374), exención del 50 % de gastos de representación, tope de 1.340
            UVT y tabla del art. 241 vigente, obteniendo <MathView math="\\text{Impuesto}_{\\text{vigente}}(2026)" /> y{' '}
            <MathView math="\\text{Aportes}_{\\text{vigente}}(2026)" />.
          </p>
        </div>

        <div className="math-step">
          <h4>2. Evaluación paramétrica del aumento (<MathView math="p \in [0.5\%, 30\%]" />)</h4>
          <p>Para cada porcentaje de aumento salarial evaluado en pasos de 0.5 %:</p>
          <MathView
            block
            math={`\\begin{aligned}
S_{2027}(p) &= S_{2026} \\cdot (1 + p) \\\\[4pt]
\\text{Gross}_{2027}(p) &= 12 \\cdot S_{2027}(p) \\cdot (1 + \\alpha_{\\text{prest}} + \\alpha_{\\text{ces}}) \\\\[4pt]
\\Delta \\text{Gross}(p) &= \\text{Gross}_{2027}(p) - \\text{Gross}_{2026} > 0
\\end{aligned}`}
          />
          <p className="math-note">
            Se liquida el año 2027 con las reglas del Proyecto de Ley (sin exención de gastos de representación, nuevo
            tope de 1.180 UVT y nueva tabla de tarifas), obteniendo <MathView math="\\text{Impuesto}_{\\text{proyecto}}(2027, p)" />.
          </p>
        </div>

        <div className="math-step">
          <h4>3. Razón marginal tributaria e impuesto por cada peso</h4>
          <MathView
            block
            math={`\\begin{aligned}
\\text{ImpuestoPorPeso}(p) &= \\frac{\\text{Impuesto}_{\\text{proyecto}}(2027, p) - \\text{Impuesto}_{\\text{vigente}}(2026)}{\\Delta \\text{Gross}(p)} \\\\[8pt]
\\text{CargasPorPeso}(p) &= \\frac{(\\text{Impuesto}_{2027} + \\text{Aportes}_{2027}) - (\\text{Impuesto}_{2026} + \\text{Aportes}_{2026})}{\\Delta \\text{Gross}(p)}
\\end{aligned}`}
          />
        </div>

        <div className="math-step">
          <h4>4. Ecuación del punto de equilibrio 1:1 (<MathView math="p^*" />)</h4>
          <p>
            El punto de equilibrio es el porcentaje mínimo de aumento donde el incremento del impuesto iguala
            exactamente al incremento del ingreso bruto:
          </p>
          <MathView
            block
            math={`p^* = \\min \\left\\{ p \\in (0, 30\\%] \\;\\middle|\\; \\text{ImpuestoPorPeso}(p) \\le 1.00 \\right\\}`}
          />
          <p className="math-note">
            Si el aumento <MathView math="p < p^*" />, el impuesto adicional supera el aumento del salario (
            <MathView math="\\Delta\\text{Impuesto} > \\Delta\\text{Gross}" />), haciendo que el ingreso disponible neto
            disminuya respecto al año anterior.
          </p>
        </div>

        <div className="math-step">
          <h4>5. Clasificación de zonas de impacto</h4>
          <MathView
            block
            math={`\\text{Zona}(p) = \\begin{cases}
\\text{Roja (Pérdida neta)}, & \\text{ImpuestoPorPeso}(p) > 1.10 \\\\[4pt]
\\text{Amarilla (Equilibrio)}, & 0.90 \\le \\text{ImpuestoPorPeso}(p) \\le 1.10 \\\\[4pt]
\\text{Verde (Ganancia neta)}, & \\text{ImpuestoPorPeso}(p) < 0.90
\\end{cases}`}
          />
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
