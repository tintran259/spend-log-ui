import React, { useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Image, ScrollView,
  TextInput, ActivityIndicator, Animated,
} from 'react-native';
import { showToast } from '@/utils/toast';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { useUploadImage } from '../../hooks/useUploadImage';
import { useCreateExpense } from '../../hooks/useCreateExpense';
import { todayVNISO, formatVNDate } from '@/utils/date';
import { styles } from './styles';
const formatVND = (raw: string) => (raw ? Number(raw).toLocaleString('vi-VN') : '');

export const CreateExpenseScreen: React.FC = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const [imageUri, setImageUri] = useState('');
  const [rawAmount, setRawAmount] = useState('');
  const [displayAmt, setDisplayAmt] = useState('');
  const [note, setNote] = useState('');
  const [date] = useState(todayVNISO());
  const [amountError, setAmountError] = useState('');

  const noteRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    Animated.spring(fadeAnim, { toValue: 1, damping: 22, stiffness: 190, useNativeDriver: true }).start();
  }, []);

  const { upload, isUploading } = useUploadImage();
  const { mutate: createExpense, isPending: isCreating } = useCreateExpense();
  const isSubmitting = isUploading || isCreating;

  const handleAmountChange = (text: string) => {
    const raw = text.replace(/\D/g, '');
    setRawAmount(raw);
    setDisplayAmt(formatVND(raw));
    if (amountError) setAmountError('');
  };

  const pickFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast.info('Vui lòng cấp quyền thư viện ảnh trong cài đặt.', 'Cần quyền truy cập');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const handleSubmit = async () => {
    if (!rawAmount || Number(rawAmount) <= 0) {
      setAmountError('Vui lòng nhập số tiền');
      return;
    }
    try {
      const { imageUrl, thumbnailUrl } = await upload(imageUri);
      createExpense(
        { imageUrl, thumbnailUrl, amount: Number(rawAmount), note: note.trim() || undefined, expenseDate: date },
        {
          onSuccess: () => {
            showToast.success('Đã lưu khoản chi thành công!');
            router.back();
          },
          onError: (err) => showToast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra'),
        },
      );
    } catch {
      showToast.error('Tải ảnh lên thất bại, vui lòng thử lại.');
    }
  };

  const iconBg = isDark ? 'rgba(99,102,241,0.18)' : colors.primaryLight;
  const divColor = { backgroundColor: colors.border };
  const animStyle = {
    flex: 1,
    opacity: fadeAnim,
    transform: [{ scale: fadeAnim.interpolate({ inputRange: [0, 1], outputRange: [0.97, 1] }) }],
  };

  return (
    <Animated.View style={[styles.flex, { backgroundColor: colors.background }, animStyle]}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Chi tiết khoản chi</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.formScroll}
        contentContainerStyle={styles.formContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Photo preview */}
        <TouchableOpacity style={styles.photoWrapper} onPress={pickFromGallery} activeOpacity={0.92}>
          <Image source={{ uri: imageUri }} style={styles.photoImage} resizeMode="cover" />
          <View style={styles.photoChangeOverlay}>
            <Ionicons name="images-outline" size={15} color="#fff" />
            <Text style={styles.photoChangeTxt}>Đổi ảnh</Text>
          </View>
        </TouchableOpacity>

        {/* Form card */}
        <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Amount */}
          <View style={styles.fieldRow}>
            <View style={[styles.fieldIconWrap, { backgroundColor: iconBg }]}>
              <Ionicons name="wallet-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.fieldBody}>
              <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>Số tiền</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TextInput
                  style={[styles.amountInput, { color: amountError ? colors.error : colors.text }]}
                  value={displayAmt}
                  onChangeText={handleAmountChange}
                  keyboardType="number-pad"
                  placeholder="0"
                  placeholderTextColor={colors.placeholder}
                  returnKeyType="next"
                  onSubmitEditing={() => noteRef.current?.focus()}
                />
                <Text style={[styles.amountCurrency, { color: colors.primary }]}>₫</Text>
              </View>
              {amountError ? (
                <Text style={{ fontSize: 12, color: colors.error, marginTop: 2 }}>{amountError}</Text>
              ) : null}
            </View>
          </View>

          <View style={[styles.fieldDivider, divColor]} />

          {/* Note */}
          <View style={styles.fieldRow}>
            <View style={[styles.fieldIconWrap, { backgroundColor: iconBg }]}>
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.fieldBody}>
              <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>Ghi chú</Text>
              <TextInput
                ref={noteRef}
                style={[styles.noteInput, { color: colors.text }]}
                value={note}
                onChangeText={setNote}
                placeholder="Ví dụ: Cà phê buổi sáng..."
                placeholderTextColor={colors.placeholder}
                multiline
                returnKeyType="done"
              />
            </View>
          </View>

          <View style={[styles.fieldDivider, divColor]} />

          {/* Date */}
          <TouchableOpacity style={styles.fieldRow} activeOpacity={0.7}>
            <View style={[styles.fieldIconWrap, { backgroundColor: iconBg }]}>
              <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            </View>
            <View style={styles.fieldBody}>
              <Text style={[styles.fieldLabel, { color: colors.textTertiary }]}>Ngày chi</Text>
              <Text style={[styles.fieldValue, { color: colors.text }]}>{formatVNDate(date)}</Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Submit */}
        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }, isSubmitting && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
          activeOpacity={0.85}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.submitBtnText}>
                {isUploading ? 'Đang tải ảnh...' : 'Đang lưu...'}
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="checkmark-circle" size={20} color="#fff" />
              <Text style={styles.submitBtnText}>Lưu khoản chi</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </Animated.View>
  );
};
