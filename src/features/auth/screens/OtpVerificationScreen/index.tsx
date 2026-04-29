import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, ActivityIndicator, ScrollView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { OtpBoxInput } from '../../components/OtpBoxInput';
import { useVerifyEmail } from '../../hooks/useVerifyEmail';
import { useVerifyResetOtp } from '../../hooks/useVerifyResetOtp';
import { useResendOtp } from '../../hooks/useResendOtp';
import { styles } from './styles';

const RESEND_COOLDOWN = 60;

export const OtpVerificationScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { email, purpose } = useLocalSearchParams<{ email: string; purpose: 'VERIFY_EMAIL' | 'RESET_PASSWORD' }>();

  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(RESEND_COOLDOWN);

  const verifyEmail = useVerifyEmail();
  const verifyReset = useVerifyResetOtp();
  const resend = useResendOtp();

  const isVerifyEmail = purpose === 'VERIFY_EMAIL';
  const isPending = verifyEmail.isPending || verifyReset.isPending;

  useEffect(() => {
    if (countdown === 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleSubmit = useCallback(() => {
    if (otp.length < 6) return;

    if (isVerifyEmail) {
      verifyEmail.mutate({ email, otp }, {
        // New user — always go to goal setup first
        onSuccess: () => router.replace('/(onboarding)/goal-setup'),
      });
    } else {
      verifyReset.mutate({ email, otp }, {
        onSuccess: (res) => {
          router.push({ pathname: '/(auth)/reset-password', params: { resetToken: res.data.resetToken } });
        },
      });
    }
  }, [otp, email, isVerifyEmail]);

  const handleResend = () => {
    resend.mutate({ email, purpose }, {
      onSuccess: () => setCountdown(RESEND_COOLDOWN),
    });
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[styles.container, { paddingTop: insets.top + 16 }]}
      keyboardShouldPersistTaps="handled"
    >
      <TouchableOpacity
        style={[styles.backBtn, { backgroundColor: colors.surface }]}
        onPress={() => router.back()}
      >
        <Ionicons name="arrow-back" size={20} color={colors.text} />
      </TouchableOpacity>

      <Text style={[styles.title, { color: colors.text }]}>
        {isVerifyEmail ? 'Xác thực email' : 'Đặt lại mật khẩu'}
      </Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Mã OTP đã được gửi đến
      </Text>
      <Text style={[styles.email, { color: colors.primary }]}>{email}</Text>

      <View style={styles.boxRow}>
        <OtpBoxInput value={otp} onChange={setOtp} disabled={isPending} />
      </View>

      <TouchableOpacity
        style={[styles.submitBtn, { backgroundColor: otp.length < 6 ? colors.border : colors.primary }]}
        onPress={handleSubmit}
        disabled={isPending || otp.length < 6}
      >
        {isPending
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.submitText}>Xác nhận</Text>
        }
      </TouchableOpacity>

      <View style={styles.resendRow}>
        <Text style={[styles.resendHint, { color: colors.textSecondary }]}>Không nhận được mã?</Text>
        {countdown > 0 ? (
          <Text style={[styles.timerText, { color: colors.textTertiary }]}>Gửi lại sau {countdown}s</Text>
        ) : (
          <TouchableOpacity onPress={handleResend} disabled={resend.isPending}>
            <Text style={[styles.resendBtn, { color: colors.primary }]}>Gửi lại</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
};
