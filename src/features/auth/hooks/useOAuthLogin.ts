import { useMutation } from '@tanstack/react-query';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as Facebook from 'expo-auth-session/providers/facebook';
import * as AuthSession from "expo-auth-session";
import { useEffect } from 'react';
import { authApi } from '../api/auth.api';
import { tokenService } from '@/services/token.service';
import { showToast } from '@/utils/toast';

WebBrowser.maybeCompleteAuthSession();

export const useGoogleLogin = (onSuccess?: () => void) => {
  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (idToken: string) => authApi.googleAuth({ idToken }),
    onSuccess: async (res) => {
      await tokenService.saveTokens(res.data.accessToken, res.data.refreshToken);
      onSuccess?.();
    },
    onError: () => showToast.error('Đăng nhập Google thất bại'),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const idToken = response.authentication?.idToken;
      if (idToken) mutateAsync(idToken);
      else showToast.error('Không lấy được thông tin từ Google');
    }
  }, [response]);

  return { promptAsync, isLoading: isPending, request };
};


export const useFacebookLogin = (onSuccess?: () => void) => {
  const [request, response, promptAsync] = Facebook.useAuthRequest({
    clientId: process.env.EXPO_PUBLIC_FACEBOOK_APP_ID ?? '',
    redirectUri: AuthSession.makeRedirectUri({
      scheme: 'spendlog',
      native: `fb${process.env.EXPO_PUBLIC_FACEBOOK_APP_ID}://authorize`,
    }),
  });

  const { mutateAsync, isPending } = useMutation({
    mutationFn: (accessToken: string) => authApi.facebookAuth({ accessToken }),
    onSuccess: async (res) => {
      await tokenService.saveTokens(res.data.accessToken, res.data.refreshToken);
      onSuccess?.();
    },
    onError: () => showToast.error('Đăng nhập Facebook thất bại'),
  });

  useEffect(() => {
    if (response?.type === 'success') {
      const token = response.authentication?.accessToken;
      if (token) mutateAsync(token);
      else showToast.error('Không lấy được thông tin từ Facebook');
    }
  }, [response]);

  return { promptAsync, isLoading: isPending, request };
};
