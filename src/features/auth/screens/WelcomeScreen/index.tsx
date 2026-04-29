import React from 'react';
import { View, Text, TouchableOpacity, StatusBar } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGoogleLogin, useFacebookLogin } from '../../hooks/useOAuthLogin';
import { AppLogo } from '@/components/AppLogo';
import { tokenService } from '@/services/token.service';
import { styles } from './styles';

export const WelcomeScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const { promptAsync: googlePrompt, isLoading: googleLoading, request: googleReq } = useGoogleLogin();
  const { promptAsync: fbPrompt, isLoading: fbLoading, request: fbReq } = useFacebookLogin();

  const handleOAuthSuccess = async () => {
    const token = await tokenService.getAccessToken();
    if (token) router.replace('/');
  };

  return (
    <View style={[styles.container, { backgroundColor: '#5B21B6' }]}>
      <StatusBar barStyle="light-content" />
      <View style={[styles.gradient, { paddingTop: insets.top + 24 }]}>

        {/* Hero */}
        <View style={styles.topSection}>
          <AppLogo size="lg" variant="light" />

          <View style={styles.wordmarkRow}>
            <Text style={styles.wordmarkSpend}>Spend</Text>
            <Text style={styles.wordmarkLog}>Log</Text>
          </View>

          <Text style={styles.tagline}>
            Ghi lại khoản chi tiêu bằng ảnh.{'\n'}Đơn giản. Trực quan. Chính xác.
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.bottomSection}>
          <TouchableOpacity style={styles.btnPrimary} onPress={() => router.push('/(auth)/login')}>
            <Text style={styles.btnPrimaryText}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.btnSecondary} onPress={() => router.push('/(auth)/register')}>
            <Text style={styles.btnSecondaryText}>Tạo tài khoản</Text>
          </TouchableOpacity>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Hoặc tiếp tục với</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.oauthRow}>
            <TouchableOpacity
              style={styles.oauthBtn}
              disabled={!googleReq || googleLoading}
              onPress={() => googlePrompt().then(handleOAuthSuccess)}
            >
              <Ionicons name="logo-google" size={20} color="#fff" />
              <Text style={styles.oauthText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.oauthBtn}
              disabled={!fbReq || fbLoading}
              onPress={() => fbPrompt().then(handleOAuthSuccess)}
            >
              <Ionicons name="logo-facebook" size={20} color="#fff" />
              <Text style={styles.oauthText}>Facebook</Text>
            </TouchableOpacity>
          </View>
        </View>

      </View>
    </View>
  );
};
