import { StyleSheet } from 'react-native';
import { CARD_MARGIN, CARD_WIDTH, CARD_HEIGHT, CARD_RADIUS } from '../../constants/captureLayout';

export const styles = StyleSheet.create({
  // ─── Camera card ──────────────────────────────────────────
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
  },
  cardFill: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },

  // ─── Top scrim (dark gradient effect) ─────────────────────
  topScrim: {
    position: 'absolute',
    top: 0, left: 0, right: 0,
    height: 90,
    // backgroundColor: 'rgba(0,0,0,0.0)',
  },
  topScrimInner: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(0,0,0,0.38)',
  },

  // ─── Flash button ─────────────────────────────────────────
  flashBtn: {
    position: 'absolute',
    top: 16, left: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 22,
    paddingHorizontal: 13,
    paddingVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.52)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  flashBtnOn: {
    backgroundColor: 'rgba(245,158,11,0.22)',
    borderColor: 'rgba(245,158,11,0.55)',
  },
  flashBtnAuto: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderColor: 'rgba(255,255,255,0.28)',
  },
  flashLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    color: 'rgba(255,255,255,0.75)',
  },
  flashLabelOn: { color: '#F59E0B' },
  flashLabelAuto: { color: '#fff' },

  // ─── Bottom overlay (gradient sim) ────────────────────────
  bottomOverlay: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: 96,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 16,
    gap: 10,
  },
  bottomOverlayBg: {
    ...StyleSheet.absoluteFillObject,
    // backgroundColor: 'rgba(0,0,0,0.42)',
  },

  // ─── Zoom pills ───────────────────────────────────────────
  zoomRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 22,
    padding: 3,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  zoomPill: {
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 18,
    minWidth: 46,
    alignItems: 'center',
    justifyContent: 'center',
  },
  zoomPillActive: { backgroundColor: '#fff' },
  zoomText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.65)' },
  zoomTextActive: { color: '#111' },

  // ─── Shutter row ──────────────────────────────────────────
  shutterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: CARD_MARGIN + 20,
    paddingTop: 22,
    paddingBottom: 6,
  },

  // ─── Gallery thumb ────────────────────────────────────────
  galleryThumb: {
    width: 58, height: 58,
    borderRadius: 16,
  },
  galleryEmpty: {
    width: 58, height: 58,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },

  // ─── Flip button ──────────────────────────────────────────
  flipBtn: {
    width: 58, height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // ─── Shutter ──────────────────────────────────────────────
  shutterOuter: {
    width: 82, height: 82,
    borderRadius: 41,
    borderWidth: 3.5,
    borderColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 8,
  },
  shutterInner: {
    width: 66, height: 66,
    borderRadius: 33,
  },
  shutterPressed: { opacity: 0.8, transform: [{ scale: 0.94 }] },

  // ─── History row ──────────────────────────────────────────
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    gap: 6,
  },
  historyLabel: { fontSize: 13, fontWeight: '500' },
});
