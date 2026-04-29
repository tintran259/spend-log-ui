import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, Keyboard, KeyboardEvent, Animated, Easing,
} from 'react-native';
import { Image } from 'expo-image';
import { showToast } from '@/utils/toast';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import * as MediaLibrary from 'expo-media-library';
import { AppLayout } from '@/components/AppLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { styles, INPUT_ROW_DEFAULT_BOTTOM } from './styles';

interface PhotoMeta {
  coords?: { latitude: number; longitude: number };
  takenAt?: Date;
}

interface CapturePreviewPhaseProps {
  imageUri: string;
  isSubmitting: boolean;
  isUploading: boolean;
  onRetake: () => void;
  onSave: (amount: number, locationName?: string) => void;
  photoMeta?: PhotoMeta;
}

export const CapturePreviewPhase: React.FC<CapturePreviewPhaseProps> = ({
  imageUri,
  isSubmitting,
  isUploading,
  onRetake,
  onSave,
  photoMeta,
}) => {
  const [rawAmount, setRawAmount] = useState('');
  const [display, setDisplay] = useState('');
  const [locationName, setLocationName] = useState('');
  const [savedToDevice, setSavedToDevice] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  const amountRef = useRef<TextInput>(null);
  const animBottom = useRef(new Animated.Value(INPUT_ROW_DEFAULT_BOTTOM)).current;
  const barOpacity = useRef(new Animated.Value(1)).current;
  const { colors, isDark } = useTheme();

  useEffect(() => {
    const onShow = (e: KeyboardEvent) => {
      setKeyboardVisible(true);
      Animated.parallel([
        Animated.timing(animBottom, {
          toValue: e.endCoordinates.height,
          duration: e.duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(barOpacity, {
          toValue: 0,
          duration: Math.round(e.duration * 0.5),
          useNativeDriver: true,
        }),
      ]).start();
    };

    const onHide = (e: KeyboardEvent) => {
      Animated.parallel([
        Animated.timing(animBottom, {
          toValue: INPUT_ROW_DEFAULT_BOTTOM,
          duration: e.duration,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(barOpacity, {
          toValue: 1,
          duration: e.duration,
          useNativeDriver: true,
        }),
      ]).start(() => setKeyboardVisible(false));
    };

    const showSub = Keyboard.addListener('keyboardWillShow', onShow);
    const hideSub = Keyboard.addListener('keyboardWillHide', onHide);
    return () => { showSub.remove(); hideSub.remove(); };
  }, []);

  useEffect(() => {
    setLocationName('');
    let cancelled = false;

    (async () => {
      try {
        let coords = photoMeta?.coords;
        if (!coords) {
          const { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted' || cancelled) return;
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          coords = loc.coords;
        }
        if (cancelled) return;
        const [place] = await Location.reverseGeocodeAsync(coords);
        if (place && !cancelled) {
          const parts = [place.subregion ?? place.district, place.city ?? place.region].filter(Boolean);
          setLocationName(parts.join(', '));
        }
      } catch {
        if (!cancelled) showToast.info('Không lấy được vị trí hiện tại');
      }
    })();

    return () => { cancelled = true; };
  }, [photoMeta]);

  const handleAmountChange = (text: string) => {
    const raw = text.replace(/\D/g, '');
    setRawAmount(raw);
    setDisplay(raw ? Number(raw).toLocaleString('vi-VN') : '');
  };

  const handleSaveToDevice = async () => {
    if (savedToDevice || isSaving) return;
    setIsSaving(true);
    try {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        showToast.info('Vui lòng cấp quyền thư viện ảnh trong cài đặt.', 'Cần quyền truy cập');
        return;
      }
      await MediaLibrary.saveToLibraryAsync(imageUri);
      setSavedToDevice(true);
      showToast.success('Đã lưu ảnh vào thư viện');
    } catch {
      showToast.error('Không thể lưu ảnh xuống máy');
    } finally {
      setIsSaving(false);
    }
  };

  const sideColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
  const sideBorder = isDark ? 'rgba(255,255,255,0.1)' : colors.border;

  return (
    <AppLayout showFooter={false}>
      <View style={styles.flex}>

        {/* ── Photo card ── */}
        <View style={[styles.card, { borderColor: colors.border }]}>
          <Image
            source={{ uri: imageUri }}
            style={styles.cardImage}
            contentFit="cover"
            cachePolicy="memory"
          />

          <View style={styles.topRow}>
            <TouchableOpacity style={styles.circleBtn} onPress={onRetake}>
              <Ionicons name="arrow-back" size={18} color="#fff" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.circleBtn, savedToDevice && styles.circleBtnSaved]}
              onPress={handleSaveToDevice}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : savedToDevice ? (
                <Ionicons name="checkmark" size={18} color="#4ADE80" />
              ) : (
                <Ionicons name="download-outline" size={18} color="#fff" />
              )}
            </TouchableOpacity>
          </View>

          {/* Location overlaid at bottom of photo — visible regardless of keyboard state */}
          {locationName ? (
            <View style={styles.locationOverlay}>
              <Ionicons name="location-outline" size={12} color="rgba(255,255,255,0.85)" />
              <Text style={styles.locationOverlayText} numberOfLines={1}>{locationName}</Text>
            </View>
          ) : null}
        </View>

        {/* ── Action bar — fades with keyboard ── */}
        <Animated.View
          style={[styles.actionBar, { opacity: barOpacity }]}
          pointerEvents={keyboardVisible ? 'none' : 'auto'}
        >
          <TouchableOpacity
            style={[styles.sideActionBtn, { backgroundColor: sideColor, borderColor: sideBorder }]}
            onPress={onRetake}
            activeOpacity={0.75}
          >
            <Ionicons name="camera-outline" size={24} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.saveCircle,
              { backgroundColor: colors.primary, shadowColor: colors.primary },
              isSubmitting && styles.saveCircleDisabled,
            ]}
            onPress={() => onSave(Number(rawAmount), locationName || undefined)}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Ionicons name="checkmark" size={34} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.sideActionBtn, { backgroundColor: sideColor, borderColor: sideBorder }]}
            activeOpacity={0.75}
          >
            <Ionicons name="pricetag-outline" size={22} color={colors.text} />
          </TouchableOpacity>
        </Animated.View>

        {isSubmitting && (
          <Text style={[styles.loadingLabel, { color: colors.textSecondary }]}>
            {isUploading ? 'Đang tải ảnh lên...' : 'Đang lưu...'}
          </Text>
        )}

        {/* ── Amount input — absolute, animates in sync with keyboard ── */}
        <Animated.View style={[styles.inputRowAbsolute, { bottom: animBottom }]}>
          <TouchableOpacity
            style={[styles.inputRow, { backgroundColor: colors.surface, borderColor: colors.border }]}
            activeOpacity={0.9}
            onPress={() => amountRef.current?.focus()}
          >
            <Text style={[styles.currencySign, { color: colors.primary }]}>₫</Text>
            <TextInput
              ref={amountRef}
              style={[styles.amountInput, { color: colors.text }]}
              value={display}
              onChangeText={handleAmountChange}
              keyboardType="number-pad"
              placeholder="Nhập số tiền"
              placeholderTextColor={colors.placeholder}
            />
            {keyboardVisible && (
              <TouchableOpacity onPress={Keyboard.dismiss} style={styles.doneBtn}>
                <Text style={[styles.doneBtnText, { color: colors.primary }]}>Xong</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </Animated.View>

      </View>
    </AppLayout>
  );
};
