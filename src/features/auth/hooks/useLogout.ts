import { Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useQueryClient } from '@tanstack/react-query';
import { tokenService } from '@/services/token.service';
import { useGoal } from '@/contexts/GoalContext';

export const useLogout = () => {
  const router      = useRouter();
  const { clearGoal } = useGoal();
  const queryClient = useQueryClient();

  const logout = () => {
    Alert.alert('Đăng xuất', 'Bạn có chắc muốn đăng xuất?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Đăng xuất',
        style: 'destructive',
        onPress: async () => {
          await Promise.all([
            tokenService.clearTokens(),
            clearGoal(),
          ]);
          // Clear toàn bộ React Query cache — user mới sẽ không thấy data của user cũ
          queryClient.clear();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  return { logout };
};
