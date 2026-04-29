import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { useTheme } from '@/contexts/ThemeContext';
import { Expense } from '@/types/expense.types';
import { styles } from './styles';

interface Props {
  day: number | null;
  expenses: Expense[];
  onPress: () => void;
}

const DayCellComponent: React.FC<Props> = ({ day, expenses, onPress }) => {
  const { isDark } = useTheme();
  const count       = expenses.length;
  const borderColor = isDark ? '#2C2C2E' : '#fff';
  const skeletonBg  = isDark ? '#2C2C2E' : '#E5E5EA';

  // Fade-out skeleton when the front image finishes loading
  const skeletonOpacity = useRef(new Animated.Value(1)).current;
  const [frontLoaded, setFrontLoaded] = useState(false);

  // Reset skeleton each time the front image URL changes
  const frontUrl = expenses[0]?.thumbnailUrl ?? expenses[0]?.imageUrl;
  useEffect(() => {
    skeletonOpacity.setValue(1);
    setFrontLoaded(false);
  }, [frontUrl]);

  const handleFrontLoad = useCallback(() => {
    Animated.timing(skeletonOpacity, {
      toValue: 0,
      duration: 180,
      useNativeDriver: true,
    }).start(() => setFrontLoaded(true));
  }, []);

  // ── Null day (padding cell) ─────────────────────────────────────────────
  if (day === null) return <View style={styles.cell} />;

  // ── Day with no expense (dot) ───────────────────────────────────────────
  if (count === 0) {
    return (
      <View style={styles.cell}>
        <View
          style={[
            styles.dot,
            { backgroundColor: isDark ? 'rgba(255,255,255,0.13)' : 'rgba(0,0,0,0.10)' },
          ]}
        />
      </View>
    );
  }

  // ── Day with expense(s) ─────────────────────────────────────────────────
  return (
    <TouchableOpacity style={styles.cell} activeOpacity={0.75} onPress={onPress}>
      {/* Back photo (stacked, slightly rotated) */}
      {count >= 2 && (
        <Image
          source={{ uri: expenses[1].thumbnailUrl ?? expenses[1].imageUrl }}
          style={[styles.photo, styles.photoBack, { borderColor }]}
          contentFit="cover"
          cachePolicy="disk"
          transition={0}
        />
      )}

      {/* Front photo */}
      <Image
        source={{ uri: frontUrl }}
        style={[styles.photo, styles.photoFront, { borderColor }]}
        contentFit="cover"
        cachePolicy="disk"
        transition={0}
        onLoad={handleFrontLoad}
      />

      {/* Skeleton overlay — fades out once front image is loaded */}
      {!frontLoaded && (
        <Animated.View
          pointerEvents="none"
          style={[
            styles.photo,
            styles.photoFront,
            styles.skeletonOverlay,
            { backgroundColor: skeletonBg, borderColor: skeletonBg, opacity: skeletonOpacity },
          ]}
        />
      )}

      {/* Badge for multiple expenses */}
      {count > 1 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>+{count - 1}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export const DayCell = memo(DayCellComponent);
