import React from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useTheme } from '@/contexts/ThemeContext';
import { useForgotPassword } from '../../hooks/useForgotPassword';
import { styles } from './styles';

export const ForgotPasswordScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { mutate, isPending } = useForgotPassword();

  const { control, handleSubmit, formState: { errors } } = useForm<{ email: string }>({
    defaultValues: { email: '' },
  });

  const onSubmit = ({ email }: { email: string }) => {
    mutate({ email }, {
      onSuccess: () => {
        router.push({ pathname: '/(auth)/verify-otp', params: { email, purpose: 'RESET_PASSWORD' } });
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
          <Ionicons name="key-outline" size={36} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>Quên mật khẩu?</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Nhập email đã đăng ký, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu.
        </Text>

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

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
        >
          {isPending
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Gửi mã OTP</Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
