import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { ResetPasswordRequest } from '@/types/auth.types';
import { showToast } from '@/utils/toast';

export const useResetPassword = () =>
  useMutation({
    mutationFn: (data: ResetPasswordRequest) => authApi.resetPassword(data),
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast.error(err.response?.data?.message ?? 'Đặt lại mật khẩu thất bại');
    },
  });
