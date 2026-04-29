import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'dark' | 'light';
}

const CONFIG = {
  sm: { outer: 40, inner: 32, radius: 12, sl: 13, dot: 4 },
  md: { outer: 64, inner: 52, radius: 18, sl: 20, dot: 6 },
  lg: { outer: 96, inner: 78, radius: 26, sl: 30, dot: 8 },
};

export const AppLogo: React.FC<Props> = ({ size = 'md', variant = 'dark' }) => {
  const c = CONFIG[size];
  const isLight = variant === 'light';

  return (
    <View style={[styles.outer, {
      width: c.outer,
      height: c.outer,
      borderRadius: c.outer * 0.28,
      backgroundColor: isLight ? 'rgba(255,255,255,0.15)' : '#7C3AED',
    }]}>
      {/* Inner card shape */}
      <View style={[styles.inner, {
        width: c.inner,
        height: c.inner,
        borderRadius: c.inner * 0.24,
        backgroundColor: isLight ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.12)',
        borderColor: isLight ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.2)',
      }]}>
        {/* SL monogram */}
        <Text style={[styles.monogram, { fontSize: c.sl, color: '#fff' }]}>
          SL
        </Text>
        {/* accent dot */}
        <View style={[styles.dot, {
          width: c.dot,
          height: c.dot,
          borderRadius: c.dot / 2,
          right: c.inner * 0.18,
          bottom: c.inner * 0.16,
          backgroundColor: isLight ? 'rgba(255,255,255,0.6)' : '#A78BFA',
        }]} />
      </View>
    </View>
  );
};

// ── Wordmark (logo + text side by side) ─────────────────────────────────────
interface WordmarkProps {
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

const WORDMARK_SIZE = { sm: 14, md: 20, lg: 28 };
const WORDMARK_LOGO = { sm: 'sm' as const, md: 'sm' as const, lg: 'md' as const };

export const AppWordmark: React.FC<WordmarkProps> = ({ color = '#fff', size = 'md' }) => (
  <View style={styles.wordmarkRow}>
    <AppLogo size={WORDMARK_LOGO[size]} variant="light" />
    <View style={styles.wordmarkText}>
      <Text style={[styles.wordmarkSpend, { fontSize: WORDMARK_SIZE[size], color }]}>Spend</Text>
      <Text style={[styles.wordmarkLog, { fontSize: WORDMARK_SIZE[size], color }]}>Log</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  outer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  inner: {
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  monogram: {
    fontWeight: '900',
    letterSpacing: -0.5,
    color: '#fff',
  },
  dot: {
    position: 'absolute',
  },
  wordmarkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  wordmarkText: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'baseline',
  },
  wordmarkSpend: {
    fontWeight: '300',
    letterSpacing: -0.3,
  },
  wordmarkLog: {
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
