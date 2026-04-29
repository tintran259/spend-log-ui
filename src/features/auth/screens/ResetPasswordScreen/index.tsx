import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useTheme } from '@/contexts/ThemeContext';
import { useResetPassword } from '../../hooks/useResetPassword';
import { showToast } from '@/utils/toast';
import { styles } from './styles';

interface FormData {
  newPassword: string;
  confirmPassword: string;
}

export const ResetPasswordScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { resetToken } = useLocalSearchParams<{ resetToken: string }>();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate, isPending } = useResetPassword();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const newPassword = watch('newPassword');

  const onSubmit = (data: FormData) => {
    mutate({ resetToken, newPassword: data.newPassword }, {
      onSuccess: () => {
        showToast.success('Đặt lại mật khẩu thành công');
        router.replace('/(auth)/login');
      },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
          <Ionicons name="shield-checkmark-outline" size={36} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Mật khẩu mới</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Tạo mật khẩu mới mạnh và dễ nhớ
        </Text>

        {/* New password */}
        <Text style={[styles.fieldLabel, { color: colors.label }]}>Mật khẩu mới</Text>
        <Controller
          control={control}
          name="newPassword"
          rules={{ required: true, minLength: 8 }}
          render={({ field: { onChange, value } }) => (
            <View style={[styles.inputWrap, {
              backgroundColor: colors.inputBg,
              borderColor: errors.newPassword ? colors.error : colors.inputBorder,
            }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Tối thiểu 8 ký tự"
                placeholderTextColor={colors.placeholder}
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPw}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(p => !p)}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        />

        {/* Confirm */}
        <Text style={[styles.fieldLabel, { color: colors.label }]}>Xác nhận mật khẩu</Text>
        <Controller
          control={control}
          name="confirmPassword"
          rules={{ required: true, validate: v => v === newPassword }}
          render={({ field: { onChange, value } }) => (
            <View style={[styles.inputWrap, {
              backgroundColor: colors.inputBg,
              borderColor: errors.confirmPassword ? colors.error : colors.inputBorder,
            }]}>
              <Ionicons name="shield-checkmark-outline" size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nhập lại mật khẩu"
                placeholderTextColor={colors.placeholder}
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showConfirm}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(p => !p)}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        />

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          {isPending
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Cập nhật mật khẩu</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
