import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { useQueryClient } from '@tanstack/react-query';
import { AppLayout } from '@/components/AppLayout';
import { Expense, MonthMeta } from '@/types/expense.types';
import { useExpenseMonths } from '@/features/expense/hooks/useExpenseMonths';
import { MonthSection } from './components/MonthSection';
import { PhotoViewerModal } from './components/PhotoViewerModal';
import { styles } from './styles';

export const CalendarScreen: React.FC = () => {
  const queryClient = useQueryClient();
  const { data: months, isLoading, refetch, isRefetching } = useExpenseMonths();

  const [viewerExpenses, setViewerExpenses] = useState<Expense[]>([]);
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['expenses'] });
    await refetch();
  }, [queryClient, refetch]);

  const handleDayPress = useCallback((expenses: Expense[], startIndex: number) => {
    setViewerExpenses(expenses);
    setViewerIndex(startIndex);
  }, []);

  const renderMonth = useCallback(
    ({ item }: { item: MonthMeta }) => (
      <MonthSection
        year={item.year}
        month={item.month}
        onDayPress={handleDayPress}
      />
    ),
    [handleDayPress],
  );

  const keyExtractor = useCallback(
    (item: MonthMeta) => `${item.year}-${item.month}`,
    [],
  );

  const ListFooter = useCallback(() => (
    <View style={styles.footer}>
      <Text style={styles.footerText}>· · ·</Text>
    </View>
  ), []);

  return (
    <AppLayout swipeDisabled={viewerIndex !== null}>
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
        </View>
      ) : (months ?? []).length === 0 ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.emptyText}>Chưa có khoản chi nào</Text>
        </View>
      ) : (
        <FlatList
          data={months}
          keyExtractor={keyExtractor}
          renderItem={renderMonth}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          initialNumToRender={2}
          maxToRenderPerBatch={2}
          windowSize={5}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#8E8E93"
            />
          }
          ListFooterComponent={ListFooter}
        />
      )}

      {viewerIndex !== null && (
        <PhotoViewerModal
          visible
          expenses={viewerExpenses}
          initialIndex={viewerIndex}
          onClose={() => setViewerIndex(null)}
        />
      )}
    </AppLayout>
  );
};
