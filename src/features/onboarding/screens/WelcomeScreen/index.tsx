import React, { useEffect, useRef } from 'react';
import { Animated, Text, TouchableOpacity, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { AppLogo } from '@/components/AppLogo';
import { styles } from './styles';

const FEATURES: { icon: React.ComponentProps<typeof Ionicons>['name']; title: string; desc: string }[] = [
  { icon: 'camera-outline',      title: 'Chụp khoảnh khắc',   desc: 'Gắn ảnh vào mỗi khoản chi tiêu hàng ngày' },
  { icon: 'wallet-outline',      title: 'Theo dõi chi tiêu',   desc: 'Biết chính xác bạn đang tiêu bao nhiêu' },
  { icon: 'stats-chart-outline', title: 'Báo cáo thông minh',  desc: 'So sánh với mục tiêu, kiểm soát tài chính' },
];

export const WelcomeScreen: React.FC = () => {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const logoAnim     = useRef(new Animated.Value(0)).current;
  const titleAnim    = useRef(new Animated.Value(0)).current;
  const featuresAnim = useRef(new Animated.Value(0)).current;
  const ctaAnim      = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.stagger(160, [
      Animated.spring(logoAnim,     { toValue: 1, damping: 14, stiffness: 100, useNativeDriver: true }),
      Animated.spring(titleAnim,    { toValue: 1, damping: 14, stiffness: 100, useNativeDriver: true }),
      Animated.spring(featuresAnim, { toValue: 1, damping: 14, stiffness: 100, useNativeDriver: true }),
      Animated.spring(ctaAnim,      { toValue: 1, damping: 14, stiffness: 100, useNativeDriver: true }),
    ]).start();
  }, []);

  const fade = (anim: Animated.Value) => ({
    opacity: anim,
    transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }) }],
  });

  return (
    <View style={[styles.container, { backgroundColor: isDark ? '#0A0F1E' : colors.primary }]}>
      <View style={[styles.circle, styles.circleTop, { opacity: 0.12 }]} />
      <View style={[styles.circle, styles.circleBottom, { opacity: 0.08 }]} />

      <Animated.View style={[styles.logoBlock, fade(logoAnim)]}>
        <AppLogo size="lg" variant="light" />
        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 12 }}>
          <Text style={[styles.appName, { fontWeight: '300' }]}>Spend</Text>
          <Text style={styles.appName}>Log</Text>
        </View>
      </Animated.View>

      <Animated.View style={[styles.titleBlock, fade(titleAnim)]}>
        <Text style={styles.tagline}>Ghi lại khoảnh khắc.</Text>
        <Text style={styles.tagline}>Kiểm soát chi tiêu.</Text>
        <Text style={styles.subtitle}>
          Mỗi bức ảnh là một câu chuyện — và một khoản chi tiêu cần được ghi nhớ.
        </Text>
      </Animated.View>

      <Animated.View style={[styles.features, fade(featuresAnim)]}>
        {FEATURES.map((f) => (
          <View key={f.icon} style={styles.featureRow}>
            <View style={styles.featureIcon}>
              <Ionicons name={f.icon} size={18} color="#fff" />
            </View>
            <View style={styles.featureText}>
              <Text style={styles.featureTitle}>{f.title}</Text>
              <Text style={styles.featureDesc}>{f.desc}</Text>
            </View>
          </View>
        ))}
      </Animated.View>

      <Animated.View style={[styles.ctaBlock, fade(ctaAnim)]}>
        <TouchableOpacity
          style={styles.ctaButton}
          activeOpacity={0.85}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.ctaText}>Bắt đầu ngay</Text>
          <Ionicons name="arrow-forward" size={18} color={colors.primary} />
        </TouchableOpacity>
        <Text style={styles.terms}>
          Bằng cách tiếp tục, bạn đồng ý với{' '}
          <Text style={styles.termsLink}>Điều khoản sử dụng</Text>
        </Text>
      </Animated.View>
    </View>
  );
};
