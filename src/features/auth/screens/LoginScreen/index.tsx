import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';
import { useForm, Controller } from 'react-hook-form';
import { useTheme } from '@/contexts/ThemeContext';
import { useLogin } from '../../hooks/useLogin';
import { useGoogleLogin, useFacebookLogin } from '../../hooks/useOAuthLogin';
import { styles } from './styles';

interface FormData {
  email: string;
  password: string;
}

const goHome = () => router.replace('/');

export const LoginScreen: React.FC = () => {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [showPw, setShowPw] = useState(false);
  const { mutate, isPending } = useLogin();

  const { promptAsync: googlePrompt, isLoading: googleLoading, request: googleRequest } = useGoogleLogin(goHome);
  const { promptAsync: fbPrompt, isLoading: fbLoading, request: fbRequest } = useFacebookLogin(goHome);

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: FormData) => {
    mutate(data, { onSuccess: goHome });
  };

  const isSocialLoading = googleLoading || fbLoading;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingTop: insets.top + 16 }]}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={[styles.title, { color: colors.text }]}>Xin chào bạn.</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
          Đăng nhập vào tài khoản của bạn
        </Text>

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

        {/* Password */}
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
                placeholder="Mật khẩu"
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

        <TouchableOpacity style={styles.forgotBtn} onPress={() => router.push('/(auth)/forgot-password')}>
          <Text style={[styles.forgotText, { color: colors.primary }]}>Quên mật khẩu?</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, { backgroundColor: colors.primary }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending || isSocialLoading}
        >
          {isPending
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.submitText}>Đăng nhập</Text>
          }
        </TouchableOpacity>

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.textTertiary }]}>Hoặc đăng nhập với</Text>
          <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
        </View>

        {/* Google */}
        <TouchableOpacity
          style={[styles.socialBtn, { backgroundColor: colors.surface, borderColor: colors.border }]}
          onPress={() => googlePrompt()}
          disabled={!googleRequest || isSocialLoading || isPending}
          activeOpacity={0.8}
        >
          {googleLoading
            ? <ActivityIndicator size="small" color="#EA4335" />
            : <FontAwesome5 name="google" size={18} color="#EA4335" />
          }
          <Text style={[styles.socialBtnText, { color: colors.text }]}>Tiếp tục với Google</Text>
        </TouchableOpacity>

        {/* Facebook */}
        <TouchableOpacity
          style={[styles.socialBtn, { backgroundColor: '#1877F2', borderColor: '#1877F2' }]}
          onPress={() => fbPrompt()}
          disabled={!fbRequest || isSocialLoading || isPending}
          activeOpacity={0.8}
        >
          {fbLoading
            ? <ActivityIndicator size="small" color="#fff" />
            : <FontAwesome5 name="facebook-f" size={18} color="#fff" />
          }
          <Text style={[styles.socialBtnText, { color: '#fff' }]}>Tiếp tục với Facebook</Text>
        </TouchableOpacity>

        <View style={styles.registerRow}>
          <Text style={[styles.registerHint, { color: colors.textSecondary }]}>Chưa có tài khoản?</Text>
          <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
            <Text style={[styles.registerLink, { color: colors.primary }]}>Đăng ký</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
