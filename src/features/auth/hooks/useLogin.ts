import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { LoginRequest } from '@/types/auth.types';
import { tokenService } from '@/services/token.service';
import { showToast } from '@/utils/toast';

export const useLogin = () =>
  useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: async (res) => {
      await tokenService.saveTokens(res.data.accessToken, res.data.refreshToken);
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast.error(err.response?.data?.message ?? 'Đăng nhập thất bại');
    },
  });
