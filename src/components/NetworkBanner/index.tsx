import React, { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { BANNER_HEIGHT, OFFLINE_COLORS, ONLINE_COLORS, styles } from './styles';

type BannerState = 'offline' | 'online';

export const NetworkBanner: React.FC = () => {
  const { isConnected } = useNetworkStatus();
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(-BANNER_HEIGHT - 20)).current;
  const [shouldRender, setShouldRender] = useState(false);
  const [bannerState, setBannerState] = useState<BannerState>('offline');
  const autoHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevConnected = useRef<boolean | null>(null);
  const isShown = useRef(false);

  const slideIn = (top: number) => {
    isShown.current = true;
    Animated.spring(translateY, {
      toValue: top,
      damping: 18,
      stiffness: 180,
      useNativeDriver: true,
    }).start();
  };

  const slideOut = (onDone?: () => void) => {
    Animated.timing(translateY, {
      toValue: -BANNER_HEIGHT - 20,
      duration: 260,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        isShown.current = false;
        if (onDone) {
          onDone();
        } else {
          setShouldRender(false);
        }
      }
    });
  };

  useEffect(() => {
    if (isConnected === null) return;

    const wasOffline = prevConnected.current === false;
    prevConnected.current = isConnected;

    if (autoHideTimer.current) {
      clearTimeout(autoHideTimer.current);
      autoHideTimer.current = null;
    }

    if (!isConnected) {
      translateY.stopAnimation();
      setBannerState('offline');
      setShouldRender(true);
      slideIn(insets.top + 8);
    } else if (wasOffline) {
      const top = insets.top + 8;
      const showOnlineBanner = () => {
        setBannerState('online');
        setShouldRender(true);
        slideIn(top);
        autoHideTimer.current = setTimeout(() => slideOut(), 2500);
      };

      if (isShown.current) {
        // Offline banner is visible — slide it out first, then slide in online banner
        slideOut(showOnlineBanner);
      } else {
        showOnlineBanner();
      }
    }

    return () => {
      if (autoHideTimer.current) clearTimeout(autoHideTimer.current);
    };
  }, [isConnected, insets.top]);

  if (!shouldRender) return null;

  const c = bannerState === 'offline' ? OFFLINE_COLORS : ONLINE_COLORS;
  const icon = bannerState === 'offline' ? 'cloud-offline-outline' : 'cloud-done-outline';
  const label = bannerState === 'offline' ? 'Không có kết nối internet' : 'Đã kết nối internet';

  return (
    <Animated.View style={[styles.banner, { transform: [{ translateY }] }]} pointerEvents="none">
      <View style={[styles.inner, { backgroundColor: c.bg, borderColor: c.border }]}>
        <Ionicons name={icon} size={16} color={c.icon} />
        <Text style={[styles.text, { color: c.text }]}>{label}</Text>
      </View>
    </Animated.View>
  );
};
