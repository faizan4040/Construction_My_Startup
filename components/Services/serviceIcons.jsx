import {
  Wrench, Zap, PaintRoller, Hammer, Wind, House, Settings, HardHat, ShieldCheck, Bug, Sparkles,
  Drill, Ruler, Lightbulb, Fan, Layers, Droplet, Construction,
} from 'lucide-react'

export const ICONS = { Wrench, Zap, PaintRoller, Hammer, Wind, House, Settings, HardHat, ShieldCheck, Bug, Sparkles, Drill, Ruler, Lightbulb, Fan, Layers, Droplet, Construction }

export function IconFor({ name, ...props }) {
  const I = ICONS[name] || Wrench
  return <I {...props} />
}