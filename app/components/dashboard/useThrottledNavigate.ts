import { useCallback, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';

const NAV_THROTTLE_MS = 700;

/**
 * useThrottledNavigate — drops rapid repeat taps on the same control so a
 * double-tap can never push the same route twice. Each component instance
 * keeps its own throttle timer, so independent buttons stay responsive.
 */
export const useThrottledNavigate = () => {
  const navigation = useNavigation<any>();
  const lastNavRef = useRef(0);

  return useCallback(
    (route: string, params?: Record<string, unknown>) => {
      const now = Date.now();
      if (now - lastNavRef.current < NAV_THROTTLE_MS) return;
      lastNavRef.current = now;
      navigation.navigate(route, params);
    },
    [navigation]
  );
};
