/**
 * Shared Presentation Coach Constants and Configuration Types
 */

export const PRESENTATION_CONTEXTS = [
  "Project Demo",
  "Keynote",
  "Class Presentation",
  "Pitch",
  "Team Presentation",
  "Conference Talk",
  "General",
] as const;

export type PresentationContextType = typeof PRESENTATION_CONTEXTS[number];

export interface DurationOption {
  label: string;
  value: number; // in seconds, 0 = custom
}

export const DURATION_OPTIONS: DurationOption[] = [
  { label: "1 min", value: 60 },
  { label: "3 min", value: 180 },
  { label: "5 min", value: 300 },
  { label: "10 min", value: 600 },
  { label: "Custom", value: 0 },
];

export interface PaceOption {
  label: string;
  min: number;
  max: number;
}

export const PACE_OPTIONS: PaceOption[] = [
  { label: "120–130 WPM (Deliberate & Measured)", min: 120, max: 130 },
  { label: "130–140 WPM (Conversational)", min: 130, max: 140 },
  { label: "140–150 WPM (Standard Presentation)", min: 140, max: 150 },
  { label: "150–160 WPM (High Energy / Dynamic)", min: 150, max: 160 },
  { label: "Custom Range", min: 0, max: 0 },
];
