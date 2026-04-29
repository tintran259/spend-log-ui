import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppLayout } from '@/components/AppLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useExpenseMonths } from '@/features/expense/hooks/useExpenseMonths';
import { useMonthlyReport } from '../../hooks/useMonthlyReport';
import { ReportSkeleton } from './components/ReportSkeleton';
import { SummaryCard } from './components/SummaryCard';
import { GoalTracker } from './components/GoalTracker';
import { PastMonthGoalStatus } from './components/PastMonthGoalStatus';
import { DailyBarChart } from './components/DailyBarChart';
import { TopExpenseCard } from './components/TopExpenseCard';
import { StatsGrid } from './components/StatsGrid';
import { styles } from './styles';

export const ReportScreen: React.FC = () => {
  const { colors } = useTheme();
  const { data: months } = useExpenseMonths();

  const [selectedIdx, setSelectedIdx] = useState(-1);
  const [showYearPicker, setShowYearPicker] = useState(false);

  // Init to current month once months are loaded
  useEffect(() => {
    if (!months || months.length === 0 || selectedIdx >= 0) return;
    const now = new Date();
    const idx = months.findIndex(
      m => m.year === now.getFullYear() && m.month === now.getMonth() + 1,
    );
    setSelectedIdx(idx >= 0 ? idx : 0);
  }, [months]);

  // ── Derived values ────────────────────────────────────────────────────────
  const selectedMeta = months?.[selectedIdx];
  const year = selectedMeta?.year ?? 0;
  const month = selectedMeta?.month ?? 0;

  // Single report fetch — all child components receive this as a prop
  const { data: report } = useMonthlyReport(year, month);

  const now            = new Date();
  const isCurrentMonth = year === now.getFullYear() && month === (now.getMonth() + 1);

  // ── Month transition animations ───────────────────────────────────────────
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;

  const navigateMonth = (newIdx: number, dir: 'prev' | 'next') => {
    if (newIdx === selectedIdx) return;
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: dir === 'prev' ? 20 : -20, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setSelectedIdx(newIdx);
      fadeAnim.setValue(0);
      slideAnim.setValue(dir === 'prev' ? -20 : 20);
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.spring(slideAnim, { toValue: 0, damping: 20, stiffness: 200, useNativeDriver: true }),
      ]).start();
    });
  };

  // DESC array: prev (older) = higher index, next (newer) = lower index
  const canGoPrev = selectedIdx < (months?.length ?? 0) - 1;
  const canGoNext = selectedIdx > 0;

  const availableYears = useMemo(
    () => [...new Set((months ?? []).map(m => m.year))].sort((a, b) => a - b),
    [months],
  );
  const selectedYear = selectedMeta?.year ?? availableYears[availableYears.length - 1];

  const handleYearSelect = (year: number) => {
    setShowYearPicker(false);
    if (year === selectedYear) return;
    const targetIdx = (months ?? []).findIndex(m => m.year === year);
    if (targetIdx < 0) return;
    navigateMonth(targetIdx, year < selectedYear ? 'prev' : 'next');
  };

  // ── Loading / empty guards ────────────────────────────────────────────────
  // months === undefined → still fetching → skeleton
  if (!months) {
    return (
      <AppLayout>
        <ReportSkeleton />
      </AppLayout>
    );
  }

  // months loaded but empty (new account, no expenses yet)
  if (months.length === 0) {
    return (
      <AppLayout>
        <View style={styles.emptyContainer}>
          <Text style={{ color: colors.textSecondary }}>Chưa có khoản chi nào</Text>
        </View>
      </AppLayout>
    );
  }

  // months loaded and non-empty but selectedIdx not resolved yet → skeleton
  if (selectedIdx < 0) {
    return (
      <AppLayout>
        <ReportSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {/* ── Month navigator ─────────────────────────────────────────────── */}
      <View style={[styles.monthNav, { borderBottomColor: colors.border }]}>
        <View style={styles.monthNavCenter}>
          <TouchableOpacity
            onPress={() => navigateMonth(selectedIdx + 1, 'prev')}
            disabled={!canGoPrev}
            style={[styles.monthNavBtn, { backgroundColor: colors.surface }]}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={18} color={canGoPrev ? colors.text : colors.textTertiary} />
          </TouchableOpacity>

          <Text style={[styles.monthNavLabel, { color: colors.text }]}>
            Tháng {String(month).padStart(2, '0')}
          </Text>

          <TouchableOpacity
            onPress={() => navigateMonth(selectedIdx - 1, 'next')}
            disabled={!canGoNext}
            style={[styles.monthNavBtn, { backgroundColor: colors.surface }]}
            hitSlop={8}
          >
            <Ionicons name="chevron-forward" size={18} color={canGoNext ? colors.text : colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.yearBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => setShowYearPicker(true)}
          activeOpacity={0.75}
        >
          <Text style={[styles.yearBtnText, { color: colors.text }]}>{selectedYear}</Text>
          <Ionicons name="chevron-down" size={12} color={colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {/* <FilterReport
        month={month}
        year={year}
        onPrevMonth={() => navigateMonth(selectedIdx + 1, 'prev')}
        onNextMonth={() => navigateMonth(selectedIdx - 1, 'next')}
        canGoPrev={canGoPrev}
        canGoNext={canGoNext}
        setShowYearPicker={setShowYearPicker}
        selectedYear={selectedYear}
      /> */}

      {/* ── Content (fade/slide on month change) ────────────────────────── */}
      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <SummaryCard year={year} month={month} report={report} />
          {isCurrentMonth
            ? <GoalTracker report={report} year={year} />
            : <PastMonthGoalStatus report={report} year={year} month={month} />}
          <DailyBarChart report={report} />
          <TopExpenseCard report={report} />
          <StatsGrid report={report} />
        </ScrollView>
      </Animated.View>

      {/* ── Year picker modal ────────────────────────────────────────────── */}
      <Modal
        transparent
        visible={showYearPicker}
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <TouchableOpacity
          style={styles.yearOverlay}
          activeOpacity={1}
          onPress={() => setShowYearPicker(false)}
        >
          <TouchableOpacity activeOpacity={1}>
            <View style={[styles.yearDropdown, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.yearDropdownTitle, { color: colors.textTertiary }]}>Chọn năm</Text>
              {availableYears.map(y => (
                <TouchableOpacity
                  key={y}
                  style={[
                    styles.yearDropdownItem,
                    { borderColor: colors.border },
                    y === selectedYear && { backgroundColor: colors.primaryLight },
                  ]}
                  onPress={() => handleYearSelect(y)}
                >
                  <Text style={[
                    styles.yearDropdownItemText,
                    { color: y === selectedYear ? colors.primary : colors.text },
                  ]}>
                    {y}
                  </Text>
                  {y === selectedYear && <Ionicons name="checkmark" size={16} color={colors.primary} />}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </AppLayout>
  );
};
