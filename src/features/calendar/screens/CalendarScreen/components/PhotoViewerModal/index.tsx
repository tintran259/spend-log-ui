import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewToken,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Expense } from '@/types/expense.types';
import { styles, CARD_W, PEEK, THUMB_STRIDE, THUMB_H_PAD } from './styles';
import AntDesign from '@expo/vector-icons/AntDesign';

const DOW_VI = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

function parseDateLabel(dateStr: string): { year: string; dayLabel: string } {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dow = new Date(y, m - 1, d).getDay();
  return { year: String(y), dayLabel: `tháng ${m} ${DOW_VI[dow]}` };
}

// Append Cloudinary transform without breaking the URL structure
function cloudinaryTransform(url: string, transform: string): string {
  return url.replace('/upload/', `/upload/${transform}/`);
}

// ── Thumbnail item ────────────────────────────────────────────────────────────
interface ThumbItemProps {
  exp: Expense;
  idx: number;
  animIndex: Animated.Value;
  onPress: () => void;
}

const ThumbItem = memo<ThumbItemProps>(({ exp, idx, animIndex, onPress }) => {
  const scale = useRef(
    animIndex.interpolate({
      inputRange: [idx - 2, idx - 1, idx, idx + 1, idx + 2],
      outputRange: [0.58, 0.72, 1.0, 0.72, 0.58],
      extrapolate: 'clamp',
    }),
  ).current;

  const opacity = useRef(
    animIndex.interpolate({
      inputRange: [idx - 1, idx, idx + 1],
      outputRange: [0.45, 1.0, 0.45],
      extrapolate: 'clamp',
    }),
  ).current;

  const borderOpacity = useRef(
    animIndex.interpolate({
      inputRange: [idx - 0.4, idx, idx + 0.4],
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    }),
  ).current;

  const thumbSrc = exp.thumbnailUrl ?? exp.imageUrl;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={[styles.thumbBox, { transform: [{ scale }], opacity }]}>
        <Image
          source={{ uri: thumbSrc }}
          style={styles.thumbImg}
          contentFit="cover"
          cachePolicy="disk"
          transition={0}
        />
        <Animated.View style={[StyleSheet.absoluteFill, styles.thumbBorder, { opacity: borderOpacity }]} />
      </Animated.View>
    </TouchableOpacity>
  );
});

// ── Photo card — progressive: thumbnail → full-res ────────────────────────────
interface PhotoItemProps {
  item: Expense;
  photoScale: Animated.Value;
  photoOpacity: Animated.Value;
}

const PhotoItem = memo<PhotoItemProps>(({ item, photoScale, photoOpacity }) => {
  const thumbUrl = item.thumbnailUrl ?? item.imageUrl;
  const fullUrl  = item.imageUrl;

  return (
    <View style={styles.photoPage}>
      <Animated.View
        style={[styles.photoCard, { transform: [{ scale: photoScale }], opacity: photoOpacity }]}
      >
        <View style={styles.photoContainer}>
          <Image
            source={{ uri: fullUrl }}
            placeholder={{ uri: thumbUrl }}
            style={styles.photo}
            contentFit="cover"
            cachePolicy="disk"
            transition={{ duration: 200, effect: 'cross-dissolve' }}
            placeholderContentFit="cover"
          />
        </View>
        <View style={styles.captionRow}>
          <Text style={styles.captionAmount}>{item.amount.toLocaleString('vi-VN')} ₫</Text>
          <Text style={styles.captionDate}>{item.expenseDate}</Text>
        </View>
      </Animated.View>
    </View>
  );
});

// ── Modal ─────────────────────────────────────────────────────────────────────
interface PhotoViewerModalProps {
  visible: boolean;
  expenses: Expense[];
  initialIndex: number;
  onClose: () => void;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  visible,
  expenses,
  initialIndex,
  onClose,
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const listRef      = useRef<FlatList>(null);
  const thumbListRef = useRef<FlatList>(null);
  const hasInitialized = useRef(false);

  const { year, dayLabel } = parseDateLabel(
    expenses[activeIndex]?.expenseDate ?? expenses[0].expenseDate,
  );

  const bgOpacity    = useRef(new Animated.Value(0)).current;
  const photoOpacity = useRef(new Animated.Value(0)).current;
  const photoScale   = useRef(new Animated.Value(0.88)).current;
  const headerTransY = useRef(new Animated.Value(-24)).current;
  const stripTransY  = useRef(new Animated.Value(40)).current;
  const animIndex    = useRef(new Animated.Value(initialIndex)).current;

  // Tiny Cloudinary version for blur background (~3 KB instead of 2 MB)
  const blurBgUrl = useMemo(() => {
    const url = expenses[activeIndex]?.imageUrl ?? '';
    return url.includes('/upload/') ? cloudinaryTransform(url, 'w_80,q_10') : url;
  }, [expenses, activeIndex]);

  // Animate animIndex on swipe
  useEffect(() => {
    Animated.spring(animIndex, {
      toValue: activeIndex,
      damping: 15,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  }, [activeIndex]);

  // Prefetch adjacent images whenever active index changes
  useEffect(() => {
    [-1, 1, 2].forEach(offset => {
      const exp = expenses[activeIndex + offset];
      if (exp) {
        Image.prefetch(exp.imageUrl);
        if (exp.thumbnailUrl) Image.prefetch(exp.thumbnailUrl);
      }
    });
  }, [activeIndex, expenses]);

  // Open / close
  useEffect(() => {
    if (!visible) {
      hasInitialized.current = false;
      return;
    }

    bgOpacity.setValue(0);
    photoOpacity.setValue(0);
    photoScale.setValue(0.88);
    headerTransY.setValue(-24);
    stripTransY.setValue(40);
    animIndex.setValue(initialIndex);
    setActiveIndex(initialIndex);

    // Prefetch all images in the day's list immediately on open
    expenses.forEach(exp => {
      Image.prefetch(exp.imageUrl);
      if (exp.thumbnailUrl) Image.prefetch(exp.thumbnailUrl);
    });

    setTimeout(() => {
      listRef.current?.scrollToOffset({ offset: initialIndex * CARD_W, animated: false });
      thumbListRef.current?.scrollToIndex({
        index: initialIndex,
        animated: false,
        viewPosition: 0.5,
      });
      hasInitialized.current = true;
    }, 30);

    Animated.parallel([
      Animated.timing(bgOpacity,    { toValue: 1, duration: 260, useNativeDriver: true }),
      Animated.timing(photoOpacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.spring(photoScale,   { toValue: 1, damping: 18, stiffness: 200, useNativeDriver: true }),
      Animated.spring(headerTransY, { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: true }),
      Animated.spring(stripTransY,  { toValue: 0, damping: 18, stiffness: 200, useNativeDriver: true }),
    ]).start();
  }, [visible, initialIndex]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(bgOpacity,    { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(photoOpacity, { toValue: 0, duration: 180, useNativeDriver: true }),
      Animated.spring(photoScale,   { toValue: 0.9, damping: 20, stiffness: 260, useNativeDriver: true }),
      Animated.timing(headerTransY, { toValue: -20, duration: 180, useNativeDriver: true }),
      Animated.timing(stripTransY,  { toValue: 40, duration: 180, useNativeDriver: true }),
    ]);
    onClose();
  };

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (!hasInitialized.current || viewableItems.length === 0) return;
      const idx = viewableItems[0].index ?? 0;
      setActiveIndex(idx);
      thumbListRef.current?.scrollToIndex({ index: idx, animated: true, viewPosition: 0.5 });
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 });

  const goToIndex = useCallback((index: number) => {
    listRef.current?.scrollToOffset({ offset: index * CARD_W, animated: true });
  }, []);

  const renderPhoto = useCallback(
    ({ item }: { item: Expense }) => (
      <PhotoItem item={item} photoScale={photoScale} photoOpacity={photoOpacity} />
    ),
    [],
  );

  const photoItemLayout = useCallback(
    (_: unknown, index: number) => ({ length: CARD_W, offset: PEEK + index * CARD_W, index }),
    [],
  );

  const thumbItemLayout = useCallback(
    (_: unknown, index: number) => ({
      length: THUMB_STRIDE,
      offset: THUMB_H_PAD + index * THUMB_STRIDE,
      index,
    }),
    [],
  );

  const renderThumb = useCallback(
    ({ item, index }: { item: Expense; index: number }) => (
      <ThumbItem
        exp={item}
        idx={index}
        animIndex={animIndex}
        onPress={() => goToIndex(index)}
      />
    ),
    [goToIndex],
  );

  const thumbScrollFailed = useCallback(({ index }: { index: number }) => {
    setTimeout(() => {
      thumbListRef.current?.scrollToIndex({ index, animated: false, viewPosition: 0.5 });
    }, 100);
  }, []);

  return (
    <Modal visible={visible} transparent animationType="none" statusBarTranslucent>

      {/* ── Background: always-dark base + blurred tiny photo ─────────────── */}
      <View style={[StyleSheet.absoluteFill, styles.bgBase]} />
      <Animated.View style={[StyleSheet.absoluteFill, { opacity: bgOpacity }]}>
        <Image
          source={{ uri: blurBgUrl }}
          style={StyleSheet.absoluteFill}
          contentFit="cover"
          cachePolicy="disk"
          blurRadius={22}
        />
        <View style={[StyleSheet.absoluteFill, styles.bgOverlay]} />
      </Animated.View>

      <SafeAreaView style={styles.container}>

        {/* ── Top bar ─────────────────────────────────────────────────────── */}
        <Animated.View
          style={[styles.topBar, { transform: [{ translateY: headerTransY }], opacity: bgOpacity }]}
        >
          <TouchableOpacity onPress={handleClose} style={styles.iconBtn} hitSlop={12}>
            <AntDesign style={styles.closeIcon} name="close" size={24} />
          </TouchableOpacity>
          <View style={styles.dateBlock}>
            <Text style={styles.yearText}>{year}</Text>
            <Text style={styles.dayText}>{dayLabel}</Text>
          </View>
          <View style={styles.iconBtn} />
        </Animated.View>

        {/* ── Photo carousel ──────────────────────────────────────────────── */}
        <FlatList
          ref={listRef}
          data={expenses}
          keyExtractor={(item, i) => `photo-${item.id}-${i}`}
          horizontal
          snapToInterval={CARD_W}
          snapToAlignment="start"
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.photoList}
          renderItem={renderPhoto}
          getItemLayout={photoItemLayout}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewabilityConfig.current}
          initialNumToRender={3}
          maxToRenderPerBatch={3}
          windowSize={5}
          removeClippedSubviews
        />

        {/* ── Thumbnail strip ─────────────────────────────────────────────── */}
        <Animated.View style={{ transform: [{ translateY: stripTransY }], opacity: bgOpacity }}>
          <FlatList
            ref={thumbListRef}
            data={expenses}
            keyExtractor={(item, i) => `thumb-${item.id}-${i}`}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbStrip}
            renderItem={renderThumb}
            getItemLayout={thumbItemLayout}
            onScrollToIndexFailed={thumbScrollFailed}
            initialNumToRender={7}
            maxToRenderPerBatch={10}
            windowSize={9}
            removeClippedSubviews
          />
        </Animated.View>

      </SafeAreaView>
    </Modal>
  );
};
