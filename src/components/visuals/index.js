// Every visual gets `active` (card hovered, or centered on touch screens) and the `project`.
import Gauge from './Gauge'
import Rings from './Rings'
import Wave from './Wave'
import Timetable from './Timetable'
import Beads from './Beads'
import Dns from './Dns'
import Widget from './Widget'
import Panel from './Panel'
import Glass from './Glass'
import Spring from './Spring'
export { default as Monogram } from './Monogram'

export const visuals = {
  gauge: Gauge,
  rings: Rings,
  wave: Wave,
  timetable: Timetable,
  beads: Beads,
  dns: Dns,
  widget: Widget,
  panel: Panel,
  glass: Glass,
  spring: Spring,
}
