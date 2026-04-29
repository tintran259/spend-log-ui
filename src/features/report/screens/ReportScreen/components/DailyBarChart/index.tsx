import React, { useEffect, useRef } from 'react';
import { Animated, Text, View } from 'react-native';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoal } from '@/contexts/GoalContext';
import { MonthlyReport } from '@/features/report/api/report.api';
import { getGoalLimits } from '@/utils/calculateGoal';
import { formatCompact } from '@/utils/format';
import { SemanticColors } from '@/constants/colors';
import { styles, BAR_MAX_W, MAX_BARS, N_BAR_ANIMS } from './styles';

interface Props {
  report: MonthlyReport | undefined;
}

export const DailyBarChart: React.FC<Props> = ({ report }) => {
  const { colors, isDark } = useTheme();
  const { goal } = useGoal();

  const barAnims = useRef(
    Array.from({ length: N_BAR_ANIMS }, () => new Animated.Value(0)),
  ).current;

  const topDays = (report?.dailyGroups ?? []).slice(0, MAX_BARS);
  const maxDayTotal = topDays.length > 0 ? Math.max(...topDays.map(d => d.total)) : 1;
  const dailyLimit = goal ? getGoalLimits(goal.sourceField, goal.sourceValue).daily : 0;

  useEffect(() => {
    if (!report) return;
    barAnims.forEach(b => b.setValue(0));
    Animated.stagger(55, topDays.map((_, i) =>
      Animated.spring(barAnims[i], { toValue: 1, damping: 14, stiffness: 110, useNativeDriver: false }),
    )).start();
  }, [report?.dailyGroups]);

  const getBarColor = (rank: number, total: number) => {
    if (goal && dailyLimit > 0) {
      const pct = total / dailyLimit;
      if (pct >= 1) return SemanticColors.danger;
      if (pct >= 0.80) return SemanticColors.warning;
      return SemanticColors.success;
    }
    const opacity = Math.max(0.35, 1 - rank * 0.1);
    return isDark ? `rgba(167,139,250,${opacity})` : `rgba(124,58,237,${opacity})`;
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        Chi tiêu theo ngày (7 ngày gần nhất)
      </Text>

      {topDays.length > 0 ? (
        <View style={styles.barList}>
          {topDays.map((d, i) => {
            const hasGoal = goal && dailyLimit > 0;
            const exceeded = hasGoal && d.total > dailyLimit;
            const targetW = hasGoal
              ? Math.min(d.total / dailyLimit, 1) * BAR_MAX_W
              : (d.total / maxDayTotal) * BAR_MAX_W;

            const barWidth = barAnims[i].interpolate({
              inputRange: [0, 1],
              outputRange: [0, targetW],
            });

            const [, mm, dd] = d.date.split('-');
            const dateLabel = `${dd}/${mm}`;

            return (
              <View key={`${d.date}-${i}`} style={styles.barRow}>
                <Text style={[styles.barDayLabel, { color: colors.textSecondary }]}>
                  {dateLabel}
                </Text>
                <View style={[styles.barTrack, { backgroundColor: colors.barTrack }]}>
                  <Animated.View
                    style={[styles.barFill, { width: barWidth, backgroundColor: getBarColor(i, d.total) }]}
                  />
                </View>
                <Text style={[styles.barAmount, { color: exceeded ? SemanticColors.danger : colors.textSecondary }]}>
                  {formatCompact(d.total)}
                </Text>
              </View>
            );
          })}
        </View>
      ) : (
        <Text style={[styles.emptyChart, { color: colors.textTertiary }]}>
          Không có dữ liệu trong tháng này.
        </Text>
      )}
    </View>
  );
};
