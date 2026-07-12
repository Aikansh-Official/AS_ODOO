import type { LucideIcon } from 'lucide-react';
import { Navigation, Radar, Clock, TrainFront, BellRing, BarChart3 } from 'lucide-react';

export interface FeatureItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FEATURES: FeatureItem[] = [
  {
    icon: Navigation,
    title: 'Real-Time Routing',
    description: 'Routes recalculate on the fly as conditions shift, keeping every trip on the fastest path.',
  },
  {
    icon: Radar,
    title: 'Live Traffic Intelligence',
    description: 'City-wide congestion signals are fused into a single live picture of how the streets are moving.',
  },
  {
    icon: Clock,
    title: 'Predictive ETA',
    description: 'Arrival estimates learn from historical and live patterns, so timing stays honest end to end.',
  },
  {
    icon: TrainFront,
    title: 'Multi-Modal Transit',
    description: 'Bus, rail, and street-level routes are unified into one seamless way of getting anywhere.',
  },
  {
    icon: BellRing,
    title: 'Smart Alerts',
    description: 'Disruptions, delays, and route deviations surface instantly, before they become a problem.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Operational telemetry rendered clearly, turning raw movement data into decisions.',
  },
];
