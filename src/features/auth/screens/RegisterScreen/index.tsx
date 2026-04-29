import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useTheme } from '@/contexts/ThemeContext';
import { useRegister } from '../../hooks/useRegister';
import { styles } from './styles';

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export const RegisterScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { mutate, isPending } = useRegister();

  const { control, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = (data: FormData) => {
    mutate({ name: data.name, email: data.email, password: data.password }, {
      onSuccess: () =>
        router.push({ pathname: '/(auth)/verify-otp', params: { email: data.email, purpose: 'VERIFY_EMAIL' } }),
    });
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>

        <Text style={[styles.title, { color: colors.text }]}>Tạo tài khoản</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Điền thông tin để bắt đầu sử dụng
        </Text>

        {/* Họ tên */}
        <Text style={[styles.fieldLabel, { color: colors.label }]}>Họ tên</Text>
        <Controller
          control={control}
          name="name"
          rules={{ required: true, minLength: 2 }}
          render={({ field: { onChange, value } }) => (
            <View style={[styles.inputWrap, {
              backgroundColor: colors.inputBg,
              borderColor: errors.name ? colors.error : colors.inputBorder,
            }]}>
              <Ionicons name="person-outline" size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Nguyễn Văn A"
                placeholderTextColor={colors.placeholder}
                value={value}
                onChangeText={onChange}
                autoCapitalize="words"
                autoCorrect={false}
              />
            </View>
          )}
        />
        {errors.name && (
          <Text style={[styles.errorText, { color: colors.error }]}>Tối thiểu 2 ký tự</Text>
        )}

        {/* Email */}
        <Text style={[styles.fieldLabel, { color: colors.label }]}>Email</Text>
        <Controller
          control={control}
          name="email"
          rules={{ required: true, pattern: /^\S+@\S+\.\S+$/ }}
          render={({ field: { onChange, value } }) => (
            <View style={[styles.inputWrap, {
              backgroundColor: colors.inputBg,
              borderColor: errors.email ? colors.error : colors.inputBorder,
            }]}>
              <Ionicons name="mail-outline" size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="you@example.com"
                placeholderTextColor={colors.placeholder}
                value={value}
                onChangeText={onChange}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
          )}
        />
        {errors.email && (
          <Text style={[styles.errorText, { color: colors.error }]}>Email không hợp lệ</Text>
        )}

        {/* Mật khẩu */}
        <Text style={[styles.fieldLabel, { color: colors.label }]}>Mật khẩu</Text>
        <Controller
          control={control}
          name="password"
          rules={{ required: true, minLength: 8 }}
          render={({ field: { onChange, value } }) => (
            <View style={[styles.inputWrap, {
              backgroundColor: colors.inputBg,
              borderColor: errors.password ? colors.error : colors.inputBorder,
            }]}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.textSecondary} style={{ marginRight: 10 }} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="Tối thiểu 8 ký tự"
                placeholderTextColor={colors.placeholder}
                value={value}
                onChangeText={onChange}
                secureTextEntry={!showPw}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPw(p => !p)}>
                <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.password && (
          <Text style={[styles.errorText, { color: colors.error }]}>Tối thiểu 8 ký tự</Text>
        )}

        {/* Xác nhận mật khẩu */}
        <Text style={[styles.fieldLabel, { color: colors.label }]}>Xác nhận mật khẩu</Text>
        <Controller
          control={control}
          name="confirmPassword"
          rules={{ required: true, validate: (v: string) => v === password }}
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
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(p => !p)}>
                <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}
        />
        {errors.confirmPassword && (
          <Text style={[styles.errorText, { color: colors.error }]}>Mật khẩu không khớp</Text>
        )}

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          {isPending
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Đăng ký</Text>
          }
        </TouchableOpacity>

        <View style={styles.loginRow}>
          <Text style={[styles.loginHint, { color: colors.textSecondary }]}>Đã có tài khoản?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>Đăng nhập</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
