import { useMutation } from '@tanstack/react-query';
import { authApi } from '../api/auth.api';
import { ResendOtpRequest } from '@/types/auth.types';
import { showToast } from '@/utils/toast';

export const useResendOtp = () =>
  useMutation({
    mutationFn: (data: ResendOtpRequest) => authApi.resendOtp(data),
    onSuccess: () => showToast.success('Đã gửi lại mã OTP về email của bạn'),
    onError: (err: { response?: { data?: { message?: string } } }) => {
      showToast.error(err.response?.data?.message ?? 'Gửi lại OTP thất bại');
    },
  });
