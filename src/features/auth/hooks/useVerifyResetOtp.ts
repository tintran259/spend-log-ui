import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { VerifyResetOtpRequest } from '@/types/auth.types';
import { showToast } from '@/utils/toast';

export const useVerifyResetOtp = () =>
  useMutation({
    mutationFn: (data: VerifyResetOtpRequest) => authApi.verifyResetOtp(data),
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast.error(err.response?.data?.message ?? 'Mã OTP không hợp lệ');
    },
  });
