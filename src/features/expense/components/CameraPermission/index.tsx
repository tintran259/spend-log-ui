import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { styles } from './styles';

interface CameraPermissionProps {
  onRequestPermission: () => void;
}

export const CameraPermission: React.FC<CameraPermissionProps> = ({ onRequestPermission }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <Ionicons name="camera-outline" size={64} color={colors.primary} style={styles.icon} />
      <Text style={[styles.title, { color: colors.text }]}>Cần quyền camera</Text>
      <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
        Spend Log cần camera để chụp khoảnh khắc chi tiêu
      </Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={onRequestPermission}
      >
        <Text style={styles.buttonText}>Cấp quyền</Text>
      </TouchableOpacity>
    </View>
  );
};
