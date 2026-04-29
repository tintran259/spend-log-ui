import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { tokenService } from '@/services/token.service';
import { goalService } from '@/services/goal.service';
import { userApi } from '@/features/user/api/user.api';
import { useGoal } from '@/contexts/GoalContext';

type AppState = 'loading' | 'welcome' | 'goal-setup' | 'main';

export default function Index() {
  const [state, setState] = useState<AppState>('loading');
  const { saveGoal } = useGoal();

  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await tokenService.getAccessToken();
        if (!token) {
          setState('welcome');
          return;
        }

        // 1. Check local cache first
        let goal = await goalService.getGoal();

        // 2. If not in cache (new device / reinstall / OAuth merge), fetch from server
        if (!goal) {
          try {
            const serverGoal = await userApi.getGoal();
            if (serverGoal) {
              // saveGoal updates BOTH AsyncStorage AND GoalContext state
              await saveGoal(serverGoal);
              goal = serverGoal;
            }
          } catch {
            // Server unreachable — treat as no goal, user can set later
          }
        }

        setState(goal ? 'main' : 'goal-setup');
      } catch {
        setState('welcome');
      }
    }
    bootstrap();
  }, []);

  if (state === 'loading')    return null;
  if (state === 'welcome')    return <Redirect href="/(onboarding)/welcome" />;
  if (state === 'goal-setup') return <Redirect href="/(onboarding)/goal-setup" />;
  return <Redirect href="/(protected)" />;
}
