import React, { useEffect, useRef } from 'react';
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  PanResponder,
  StyleSheet,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { usePathname, useRouter } from 'expo-router';
import { useTheme } from '@/contexts/ThemeContext';
import { AppHeader } from './AppHeader';
import { AppFooter } from './AppFooter';

// Thứ tự swipe giữa 3 màn hình chính — định nghĩa 1 lần duy nhất ở đây
const MAIN_SCREEN_ORDER = [
  '/calendar',
  '/',
  '/report',
] as const;

const MIN_DISTANCE = 55;
const MIN_VELOCITY = 0.3;
const FADE_DURATION = 180;

interface AppLayoutProps {
  children:          React.ReactNode;
  showFooter?:       boolean;
  keyboardAvoiding?: boolean;
  /** Route to navigate when user swipes LEFT  (dx < 0) */
  swipeLeft?:        string;
  /** Route to navigate when user swipes RIGHT (dx > 0) */
  swipeRight?:       string;
  /** Disable swipe navigation (e.g. when a modal is open) */
  swipeDisabled?:    boolean;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  children,
  showFooter       = true,
  keyboardAvoiding = false,
  swipeLeft,
  swipeRight,
  swipeDisabled    = false,
}) => {
  const { colors } = useTheme();
  const router     = useRouter();
  const pathname   = usePathname();

  // Auto-compute swipe routes from screen order if not explicitly provided
  const screenIdx = MAIN_SCREEN_ORDER.indexOf(pathname as typeof MAIN_SCREEN_ORDER[number]);
  const autoLeft  = screenIdx >= 0 ? MAIN_SCREEN_ORDER[screenIdx + 1] : undefined;
  const autoRight = screenIdx >= 0 ? MAIN_SCREEN_ORDER[screenIdx - 1] : undefined;

  const effectiveLeft  = swipeLeft  ?? autoLeft;
  const effectiveRight = swipeRight ?? autoRight;

  // Stable refs so PanResponder closure always reads latest value
  const leftRef     = useRef(effectiveLeft);
  const rightRef    = useRef(effectiveRight);
  const disabledRef = useRef(swipeDisabled);
  leftRef.current     = effectiveLeft;
  rightRef.current    = effectiveRight;
  disabledRef.current = swipeDisabled;

  // Screen fade — fade in on mount, fade out before navigate
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue:         1,
      duration:        FADE_DURATION,
      useNativeDriver: true,
    }).start();
  }, []);

  const navigateTo = (route: string) => {
    Animated.timing(opacity, {
      toValue:         0,
      duration:        FADE_DURATION,
      useNativeDriver: true,
    }).start(() => {
      router.replace(route as never);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, { dx, dy }) => {
        if (disabledRef.current) return false;
        // Require clearly horizontal gesture
        return Math.abs(dx) > Math.abs(dy) * 2 && Math.abs(dx) > 12;
      },

      onPanResponderRelease: (_, { dx, vx }) => {
        if (disabledRef.current) return;
        const speed = Math.abs(vx);
        if (dx < -MIN_DISTANCE && speed > MIN_VELOCITY && leftRef.current) {
          navigateTo(leftRef.current);
        } else if (dx > MIN_DISTANCE && speed > MIN_VELOCITY && rightRef.current) {
          navigateTo(rightRef.current);
        }
      },

      // Don't steal touches from ScrollView / FlatList children
      onPanResponderTerminationRequest: () => true,
    }),
  ).current;

  const swipeHandlers = (effectiveLeft || effectiveRight) ? panResponder.panHandlers : {};

  const inner = (
    <SafeAreaView style={[styles.root, { backgroundColor: colors.background }]}>
      <AppHeader />
      <View style={styles.body}>
        {children}
      </View>
      {showFooter && (
        <View style={styles.footerSlot} pointerEvents="box-none">
          <AppFooter />
        </View>
      )}
    </SafeAreaView>
  );

  if (keyboardAvoiding) {
    return (
      <KeyboardAvoidingView
        style={[styles.root, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        {...swipeHandlers}
      >
        <Animated.View style={[styles.root, { opacity }]}>
          {inner}
        </Animated.View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <View
      style={[styles.root, { backgroundColor: colors.background }]}
      {...swipeHandlers}
    >
      <Animated.View style={[styles.root, { opacity }]}>
        {inner}
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  root:       { flex: 1 },
  body:       { flex: 1 },
  footerSlot: { position: 'absolute', bottom: 30, left: 0, right: 0 },
});
