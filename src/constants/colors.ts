// ─────────────────────────────────────────────────────────────────────────────
//  Design System — Spend Log
//
//  Light  → Apple-inspired warm-neutral surfaces + Violet-600 primary
//  Dark   → True-dark AMOLED base + Violet-400 primary
//
//  Contrast ratios meet WCAG AA:
//    text / background      ≥ 7 : 1
//    textSecondary / bg     ≥ 4.5 : 1
//    primary / white        ≥ 4.8 : 1
// ─────────────────────────────────────────────────────────────────────────────

export const LightColors = {
  // Backgrounds
  background:    '#F5F5F7',  // Off-white — cards float above this
  surface:       '#FFFFFF',  // Card / sheet surface
  card:          '#FFFFFF',

  // Typography
  text:          '#1D1D1F',  // Near-black  (≈Apple label)
  textSecondary: '#6E6E73',  // Medium gray (≈Apple secondary label)
  textTertiary:  '#AEAEB2',  // Hint / caption (≈Apple tertiary label)
  label:         '#3C3C43',  // Form labels, section headers

  // Borders & separators
  border:        '#E5E5EA',  // Subtle dividers
  inputBorder:   '#C7C7CC',  // Input ring
  inputBg:       '#F2F2F7',  // Input fill

  // Placeholder
  placeholder:   '#AEAEB2',

  // Brand — Violet
  primary:       '#7C3AED',  // Violet-600  — bold, readable on white
  primaryLight:  '#F3EFFE',  // Violet-50   — chip backgrounds, subtle tint

  // Semantic
  error:         '#FF3B30',  // System Red (iOS)

  // Bar chart track
  barTrack:      'rgba(0,0,0,0.05)',
};

export const DarkColors = {
  // Backgrounds
  background:    '#000000',  // True-black — AMOLED + depth contrast
  surface:       '#1C1C1E',  // Elevated sheet (≈iOS grouped bg)
  card:          '#1C1C1E',

  // Typography
  text:          '#FFFFFF',  // Pure white
  textSecondary: '#8E8E93',  // Dim white — secondary info
  textTertiary:  '#636366',  // Quieter hints
  label:         '#EBEBF0',  // Form labels

  // Borders & separators
  border:        '#38383A',  // Dark dividers
  inputBorder:   '#48484A',  // Input ring
  inputBg:       '#2C2C2E',  // Input fill

  // Placeholder
  placeholder:   '#636366',

  // Brand — Violet (lighter for dark bg)
  primary:       '#A78BFA',  // Violet-400 — luminous on black
  primaryLight:  '#1A0F2E',  // Very dark violet — chip backgrounds

  // Semantic
  error:         '#FF453A',  // System Red dark (iOS)

  // Bar chart track
  barTrack:      'rgba(255,255,255,0.07)',
};

export type AppColors = typeof LightColors;

// ─────────────────────────────────────────────────────────────────────────────
//  Weather colours — icon tints per condition
// ─────────────────────────────────────────────────────────────────────────────
export const WeatherColors = {
  sunny:        '#F59E0B',
  partlyCloudy: '#F59E0B',
  cloudy:       '#8E8E93',
  rainy:        '#60A5FA',
  stormy:       '#8B5CF6',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
//  Semantic / Status colours — theme-independent
// ─────────────────────────────────────────────────────────────────────────────
export const SemanticColors = {
  // Status
  success:       '#10B981',
  successBg:     '#D1FAE5',
  warning:       '#F59E0B',
  danger:        '#EF4444',
  dangerBg:      '#FEE2E2',

  // Overlay / scrim
  overlay:       'rgba(0,0,0,0.45)',
  scrimTop:      'rgba(0,0,0,0.05)',
  scrimBottom:   'rgba(0,0,0,0.50)',
  dangerOverlay: 'rgba(239,68,68,0.88)',
} as const;
