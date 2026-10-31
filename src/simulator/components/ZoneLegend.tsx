import type { Zone } from '../../tax/engine'
import { ZONE_FILL, ZONE_LABEL } from '../theme'

const ZONES: Zone[] = ['gain', 'balance', 'loss']

export function ZoneLegend() {
  return (
    <ul className="zone-legend">
      {ZONES.map((zone) => (
        <li key={zone}>
          <span className="swatch" style={{ background: ZONE_FILL[zone] }} />
          {ZONE_LABEL[zone]}
        </li>
      ))}
    </ul>
  )
}
