import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { useGoal } from '@/contexts/GoalContext';
import { useReportStatistics } from '@/features/report/hooks/useReportStatistics';
import { MonthlyReport } from '@/features/report/api/report.api';
import { getGoalLimits, spentPercent, goalStatus, STATUS_COLORS } from '@/utils/calculateGoal';
import { formatCompact } from '@/utils/format';
import { styles } from './styles';

interface Props {
  report: MonthlyReport | undefined;
  year: number;
}

export const GoalTracker: React.FC<Props> = ({ report, year }) => {
  const { colors } = useTheme();
  const { goal } = useGoal();
  const router = useRouter();
  const { data: stats } = useReportStatistics();

  console.log("report:", report);


  const todayAnim = useRef(new Animated.Value(0)).current;
  const monthAnim = useRef(new Animated.Value(0)).current;
  const yearAnim = useRef(new Animated.Value(0)).current;

  // Derive today/month from the monthly report so data is always consistent
  // with the DailyBarChart (same data source). yearTotal comes from statistics
  // since the monthly report only covers the selected month.
  const todayStr = new Date().toLocaleDateString('sv-SE', { timeZone: 'Asia/Ho_Chi_Minh' });
  const todayGroup = report?.dailyGroups.find(g => g.date === todayStr);
  const todayTotal = todayGroup?.total ?? 0;
  const monthTotal = report?.totalAmount ?? 0;
  const yearTotal = stats?.yearTotal ?? 0;

  useEffect(() => {
    if (!goal) return;
    const limits = getGoalLimits(goal.sourceField, goal.sourceValue);
    const tPct = Math.min(spentPercent(todayTotal, limits.daily), 100);
    const mPct = Math.min(spentPercent(monthTotal, limits.monthly), 100);
    const yPct = Math.min(spentPercent(yearTotal, limits.yearly), 100);

    todayAnim.setValue(0);
    monthAnim.setValue(0);
    yearAnim.setValue(0);
    Animated.stagger(80, [
      Animated.spring(todayAnim, { toValue: tPct, damping: 16, stiffness: 130, useNativeDriver: false }),
      Animated.spring(monthAnim, { toValue: mPct, damping: 16, stiffness: 130, useNativeDriver: false }),
      Animated.spring(yearAnim, { toValue: yPct, damping: 16, stiffness: 130, useNativeDriver: false }),
    ]).start();
  }, [goal, todayTotal, monthTotal, yearTotal]);

  if (!goal) {
    return (
      <TouchableOpacity
        style={[styles.banner, { backgroundColor: colors.primaryLight, borderColor: colors.primary + '44' }]}
        onPress={() => router.push('/(onboarding)/goal-setup')}
        activeOpacity={0.8}
      >
        <Ionicons name="flag-outline" size={18} color={colors.primary} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.bannerTitle, { color: colors.primary }]}>Chưa có mục tiêu chi tiêu</Text>
          <Text style={[styles.bannerSub, { color: colors.primary }]}>Nhấn để thiết lập ngay →</Text>
        </View>
      </TouchableOpacity>
    );
  }

  const limits = getGoalLimits(goal.sourceField, goal.sourceValue);
  const isExceeded = monthTotal > limits.monthly;
  const monthDiff = Math.abs(monthTotal - limits.monthly);

  const rows: {
    label: string;
    icon: React.ComponentProps<typeof Ionicons>['name'];
    spent: number;
    limit: number;
    pct: number;
    anim: Animated.Value;
  }[] = [
      { label: 'Hôm nay', icon: 'sunny-outline', spent: todayTotal, limit: limits.daily, pct: spentPercent(todayTotal, limits.daily), anim: todayAnim },
      { label: 'Tháng hiện tại', icon: 'calendar-outline', spent: monthTotal, limit: limits.monthly, pct: spentPercent(monthTotal, limits.monthly), anim: monthAnim },
      { label: `Năm ${year || new Date().getFullYear()} `, icon: 'stats-chart-outline', spent: yearTotal, limit: limits.yearly, pct: spentPercent(yearTotal, limits.yearly), anim: yearAnim },
    ];

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      {/* Header */}
      <View style={styles.goalHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Mục tiêu chi tiêu</Text>
        {isExceeded && (
          <View style={styles.exceedBadge}>
            <Ionicons name="warning-outline" size={12} color="#EF4444" />
            <Text style={styles.exceedText}>Vượt mức</Text>
          </View>
        )}
      </View>

      {/* Progress rows */}
      <View style={styles.goalRows}>
        {rows.map(row => {
          const color = STATUS_COLORS[goalStatus(row.pct)];
          const barW = row.anim.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });

          return (
            <View key={row.label} style={styles.goalRow}>
              <View style={styles.goalRowTop}>
                <View style={styles.goalRowLeft}>
                  <Ionicons name={row.icon} size={14} color={colors.textTertiary} />
                  <Text style={[styles.goalRowLabel, { color: colors.text }]}>{row.label}</Text>
                </View>
                <View style={styles.goalRowRight}>
                  <Text style={[styles.goalSpent, { color: colors.text }]}>{formatCompact(row.spent)}</Text>
                  <Text style={[styles.goalLimit, { color: colors.textTertiary }]}>
                    {' / '}{formatCompact(row.limit)} ₫
                  </Text>
                  <View style={[styles.pctBadge, { backgroundColor: color + '22' }]}>
                    <Text style={[styles.pctText, { color }]}>{Math.round(row.pct)}%</Text>
                  </View>
                </View>
              </View>

              <View style={[styles.goalTrack, { backgroundColor: colors.border }]}>
                <Animated.View style={[styles.goalFill, { width: barW, backgroundColor: color }]} />
              </View>

              {row.pct >= 100 && (
                <Text style={[styles.goalWarning, { color: STATUS_COLORS.exceeded }]}>
                  ⚠ Đã vượt {formatCompact(row.spent - row.limit)} ₫
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {/* Monthly result summary */}
      <View style={[styles.resultRow, { borderTopColor: colors.border }]}>
        <Ionicons
          name={!isExceeded ? 'checkmark-circle' : 'close-circle'}
          size={16}
          color={!isExceeded ? STATUS_COLORS.safe : STATUS_COLORS.exceeded}
        />
        <Text style={[styles.resultText, { color: !isExceeded ? STATUS_COLORS.safe : STATUS_COLORS.exceeded }]}>
          {!isExceeded
            ? `Tháng này tiết kiệm ${formatCompact(monthDiff)} ₫`
            : `Tháng này vượt ${formatCompact(monthDiff)} ₫`}
        </Text>
      </View>
    </View>
  );
};
