import { Redirect, Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { tokenService } from '@/services/token.service';

export default function ProtectedLayout() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    tokenService.getAccessToken().then((token) => {
      setIsAuthenticated(!!token);
    });
  }, []);

  if (isAuthenticated === null) return null;

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false }}>
      <Stack.Screen name="index" options={{ gestureEnabled: false }} />
      <Stack.Screen name="calendar" options={{ gestureEnabled: false }} />
      <Stack.Screen name="report" options={{ gestureEnabled: false }} />
    </Stack>
  );
}
