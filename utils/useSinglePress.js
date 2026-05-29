import { useRef, useCallback } from 'react';

export function useSinglePress(handler, cooldown = 800) {
  const blocked = useRef(false);
  return useCallback((...args) => {
    if (blocked.current) return;
    blocked.current = true;
    handler(...args);
    setTimeout(() => { blocked.current = false; }, cooldown);
  }, [handler, cooldown]);
}
