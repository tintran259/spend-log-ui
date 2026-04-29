import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { RegisterRequest } from '@/types/auth.types';
import { showToast } from '@/utils/toast';

export const useRegister = () =>
  useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast.error(err.response?.data?.message ?? 'Đăng ký thất bại');
    },
  });
