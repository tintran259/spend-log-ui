import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { styles } from './styles';

interface CaptureTopBarProps {
  onSettingsPress: () => void;
  onMenuPress: () => void;
}

export const CaptureTopBar: React.FC<CaptureTopBarProps> = ({ onSettingsPress, onMenuPress }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.topBar, { backgroundColor: colors.background }]}>
      <View style={[styles.centerPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="wallet-outline" size={15} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={[styles.centerText, { color: colors.text }]}>Spend Log</Text>
      </View>

      <TouchableOpacity
        style={[styles.pill, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={onMenuPress}
      >
        <Ionicons name="menu" size={22} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
};
