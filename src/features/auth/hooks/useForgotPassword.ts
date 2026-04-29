import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { ForgotPasswordRequest } from '@/types/auth.types';
import { showToast } from '@/utils/toast';

export const useForgotPassword = () =>
  useMutation({
    mutationFn: (data: ForgotPasswordRequest) => authApi.forgotPassword(data),
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast.error(err.response?.data?.message ?? 'Thao tác thất bại');
    },
  });
