import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Image, Text, TouchableOpacity, Animated,
} from 'react-native';
import { showToast } from '@/utils/toast';
import { CameraView, CameraType, FlashMode, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons, FontAwesome6 } from '@expo/vector-icons';
import { useUploadImage } from '../../hooks/useUploadImage';
import { useCreateExpense } from '../../hooks/useCreateExpense';
import { useTheme } from '@/contexts/ThemeContext';
import { CameraPermission } from '../../components/CameraPermission';
import { CapturePreviewPhase } from '../../components/CapturePreviewPhase';
import { AppLayout } from '@/components/AppLayout';
import { todayVNISO } from '@/utils/date';
import { styles } from './styles';

type Phase = 'camera' | 'preview';

const ZOOM_PRESETS: { label: string; value: number }[] = [
  { label: '1×', value: 0 },
  { label: '2×', value: 0.06 },
  { label: '3×', value: 0.14 },
];

const FLASH_STATES: FlashMode[] = ['off', 'auto', 'on'];

const FLASH_CONFIG: Record<'off' | 'auto' | 'on', { icon: React.ComponentProps<typeof Ionicons>['name']; label: string }> = {
  off: { icon: 'flash-off', label: 'OFF' },
  auto: { icon: 'flash', label: 'AUTO' },
  on: { icon: 'flash', label: 'ON' },
};

export const CaptureScreen: React.FC = () => {
  const [phase, setPhase] = useState<Phase>('camera');
  const [facing, setFacing] = useState<CameraType>('back');
  const [flash, setFlash] = useState<FlashMode>('off');
  const [zoomIndex, setZoomIndex] = useState(0);
  const [imageUri, setImageUri] = useState('');
  const [photoMeta, setPhotoMeta] = useState<{
    coords?: { latitude: number; longitude: number };
    takenAt?: Date;
  }>();

  const flipScale = useRef(new Animated.Value(1)).current;
  const previewAnim = useRef(new Animated.Value(0)).current;
  const cameraRef = useRef<CameraView>(null);

  // Animate preview in whenever phase switches to 'preview'
  useEffect(() => {
    if (phase === 'preview') {
      Animated.spring(previewAnim, { toValue: 1, damping: 22, stiffness: 180, useNativeDriver: true }).start();
    }
  }, [phase]);

  const [permission, requestPermission] = useCameraPermissions();
  const { upload, isUploading } = useUploadImage();
  const { mutate: createExpense, isPending: isCreating } = useCreateExpense();
  const { colors, isDark } = useTheme();

  const handleFlip = useCallback(() => {
    Animated.sequence([
      Animated.timing(flipScale, { toValue: 0.82, duration: 110, useNativeDriver: true }),
      Animated.timing(flipScale, { toValue: 1, duration: 130, useNativeDriver: true }),
    ]).start();
    setFacing(f => (f === 'back' ? 'front' : 'back'));
  }, [flipScale]);

  const cycleFlash = useCallback(() => {
    setFlash(f => {
      const idx = FLASH_STATES.indexOf(f);
      return FLASH_STATES[(idx + 1) % FLASH_STATES.length];
    });
  }, []);

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.85 });
      if (photo) {
        previewAnim.setValue(0);
        setImageUri(photo.uri);
        setPhase('preview');
      }
    } catch {
      showToast.error('Không thể chụp ảnh, vui lòng thử lại');
    }
  };

  const handleOpenGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      showToast.info('Vui lòng cấp quyền thư viện ảnh trong cài đặt.', 'Cần quyền truy cập');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.85,
      exif: true,
    });
    if (!result.canceled) {
      const asset = result.assets[0];
      const exif = asset.exif as Record<string, unknown> | undefined;
      const meta: { coords?: { latitude: number; longitude: number }; takenAt?: Date } = {};
      if (exif) {
        const lat = exif['GPSLatitude'];
        const lon = exif['GPSLongitude'];
        if (typeof lat === 'number' && typeof lon === 'number') {
          meta.coords = {
            latitude: exif['GPSLatitudeRef'] === 'S' ? -(lat as number) : (lat as number),
            longitude: exif['GPSLongitudeRef'] === 'W' ? -(lon as number) : (lon as number),
          };
        }
        const dt = exif['DateTimeOriginal'] ?? exif['DateTime'];
        if (typeof dt === 'string') {
          const parsed = new Date(dt.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3'));
          if (!isNaN(parsed.getTime())) meta.takenAt = parsed;
        }
      }
      previewAnim.setValue(0);
      setPhotoMeta(meta);
      setImageUri(asset.uri);
      setPhase('preview');
    }
  };

  const handleRetake = () => {
    Animated.timing(previewAnim, { toValue: 0, duration: 160, useNativeDriver: true }).start(() => {
      setPhase('camera');
      setImageUri('');
      setPhotoMeta(undefined);
    });
  };

  const handleSave = async (amount: number, locationName?: string) => {
    if (!amount || amount <= 0) {
      showToast.info('Vui lòng nhập số tiền');
      return;
    }
    try {
      const { imageUrl, thumbnailUrl } = await upload(imageUri);
      createExpense(
        {
          imageUrl,
          thumbnailUrl,
          amount,
          expenseDate: todayVNISO(),
          latitude: photoMeta?.coords?.latitude,
          longitude: photoMeta?.coords?.longitude,
          locationName: locationName ?? undefined,
        },
        {
          onSuccess: () => {
            showToast.success('Đã lưu khoản chi thành công');
            handleRetake();
          },
          onError: (err) => {
            showToast.error(err instanceof Error ? err.message : 'Có lỗi xảy ra');
          },
        },
      );
    } catch {
      showToast.error('Tải ảnh lên thất bại, vui lòng thử lại');
    }
  };

  if (!permission) return <View style={{ flex: 1 }} />;
  if (!permission.granted) return <CameraPermission onRequestPermission={requestPermission} />;

  if (phase === 'preview') {
    return (
      <Animated.View style={{
        flex: 1,
        opacity: previewAnim,
        transform: [{
          translateY: previewAnim.interpolate({ inputRange: [0, 1], outputRange: [28, 0] }),
        }],
      }}>
        <CapturePreviewPhase
          imageUri={imageUri}
          isSubmitting={isUploading || isCreating}
          isUploading={isUploading}
          onRetake={handleRetake}
          onSave={handleSave}
          photoMeta={photoMeta}
        />
      </Animated.View>
    );
  }

  const flashCfg = FLASH_CONFIG[flash as 'off' | 'auto' | 'on'] ?? FLASH_CONFIG['off'];
  const isFlashOn = flash === 'on';
  const isAuto = flash === 'auto';

  return (
    <AppLayout>
      {/* ── Camera Card ── */}
      <View style={styles.card}>
        <CameraView
          ref={cameraRef}
          style={styles.cardFill}
          facing={facing}
          flash={flash}
          zoom={ZOOM_PRESETS[zoomIndex].value}
        />

        {/* Top scrim */}
        <View style={styles.topScrim} pointerEvents="none">
          <View style={styles.topScrimInner} />
        </View>

        {/* Flash toggle */}
        <TouchableOpacity
          style={[styles.flashBtn, isFlashOn && styles.flashBtnOn, isAuto && styles.flashBtnAuto]}
          onPress={cycleFlash}
          activeOpacity={0.75}
        >
          <Ionicons
            name={flashCfg.icon}
            size={15}
            color={isFlashOn ? '#F59E0B' : '#fff'}
          />
          <Text style={[styles.flashLabel, isFlashOn && styles.flashLabelOn, isAuto && styles.flashLabelAuto]}>
            {flashCfg.label}
          </Text>
        </TouchableOpacity>

        {/* Bottom overlay with zoom */}
        <View style={styles.bottomOverlay} pointerEvents="box-none">
          <View style={styles.bottomOverlayBg} pointerEvents="none" />
          <View style={styles.zoomRow}>
            {ZOOM_PRESETS.map((preset, i) => (
              <TouchableOpacity
                key={preset.label}
                style={[styles.zoomPill, i === zoomIndex && styles.zoomPillActive]}
                onPress={() => setZoomIndex(i)}
                activeOpacity={0.75}
              >
                <Text style={[styles.zoomText, i === zoomIndex && styles.zoomTextActive]}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* ── Shutter Row ── */}
      <View style={styles.shutterRow}>
        {/* Gallery */}
        <TouchableOpacity onPress={handleOpenGallery} activeOpacity={1}>
          <View style={[styles.galleryEmpty, { borderColor: colors.border }]}>
            <FontAwesome6 name="images" size={24} color={colors.textSecondary} />
          </View>
        </TouchableOpacity>

        {/* Shutter */}
        <TouchableOpacity
          style={styles.shutterOuter}
          onPress={handleCapture}
          activeOpacity={0.85}
        >
          <View style={[styles.shutterInner, { backgroundColor: colors.primary }]} />
        </TouchableOpacity>

        {/* Flip */}
        <Animated.View style={{ transform: [{ scale: flipScale }] }}>
          <TouchableOpacity
            onPress={handleFlip}
            activeOpacity={0.75}
          >
            <View style={[styles.galleryEmpty, { borderColor: colors.border }]}>
              <Ionicons name="camera-reverse-outline" size={26} color={colors.textSecondary} />
            </View>
          </TouchableOpacity>
        </Animated.View>
      </View>

    </AppLayout>
  );
};
