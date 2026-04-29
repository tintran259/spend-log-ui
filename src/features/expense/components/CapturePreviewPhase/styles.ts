import { StyleSheet } from 'react-native';
import { CARD_MARGIN, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS } from '../../constants/captureLayout';

// Action bar: paddingTop(16) + saveCircle(76) + paddingBottom(6) + gap(14)
export const INPUT_ROW_DEFAULT_BOTTOM = 130;

export const styles = StyleSheet.create({
  flex: { flex: 1 },

  // ─── Photo card ────────────────────────────────────────────
  card: {
    alignSelf: 'center',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: CARD_RADIUS,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
    borderWidth: 1,
  },
  cardImage: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  // ─── Top controls ─────────────────────────────────────────
  topRow: {
    position: 'absolute',
    top: 14, left: 14, right: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  circleBtn: {
    width: 38, height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleBtnSaved: {
    backgroundColor: 'rgba(34,197,94,0.25)',
    borderColor: 'rgba(34,197,94,0.55)',
  },

  // ─── Location overlay (inside card) ───────────────────────
  locationOverlay: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  locationOverlayText: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontWeight: '500',
    flex: 1,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // ─── Amount input — always absolute, animated bottom ──────
  inputRowAbsolute: {
    position: 'absolute',
    left: CARD_MARGIN,
    right: CARD_MARGIN,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    gap: 10,
  },
  currencySign: {
    fontSize: 20,
    fontWeight: '700',
  },
  amountInput: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
  },
  doneBtn: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  doneBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // ─── Action bar ───────────────────────────────────────────
  actionBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: CARD_MARGIN + 20,
    paddingTop: 100,
    paddingBottom: 6,
  },
  sideActionBtn: {
    width: 58, height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  saveCircle: {
    width: 76, height: 76,
    borderRadius: 38,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 14,
    elevation: 10,
  },
  saveCircleDisabled: { opacity: 0.6 },

  // ─── Loading label ────────────────────────────────────────
  loadingLabel: { fontSize: 13, textAlign: 'center', marginTop: 8 },
});
