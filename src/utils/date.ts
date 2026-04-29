const VN_OFFSET_MS = 7 * 60 * 60_000; // UTC+7

/**
 * Returns today's date in Vietnam timezone as YYYY-MM-DD.
 * Uses manual UTC+7 offset with getUTC* methods — reliable on all
 * React Native environments regardless of Intl/timeZone support.
 */
export const todayVNISO = (): string => {
  const d = new Date(Date.now() + VN_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

/**
 * Formats a YYYY-MM-DD string for display in Vietnamese locale.
 * Parses as local date to avoid UTC-to-local shift.
 */
export const formatVNDate = (iso: string): string => {
  const [y, m, d] = iso.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};
