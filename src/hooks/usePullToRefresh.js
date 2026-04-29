import { useState, useEffect, useRef } from 'react';

export default function usePullToRefresh(onRefresh) {
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef(null);
  const el = useRef(null);

  useEffect(() => {
    const container = el.current || document.documentElement;

    const onTouchStart = (e) => {
      if (window.scrollY === 0) startY.current = e.touches[0].clientY;
    };

    const onTouchEnd = async (e) => {
      if (startY.current === null) return;
      const diff = e.changedTouches[0].clientY - startY.current;
      startY.current = null;
      if (diff > 70 && !refreshing) {
        setRefreshing(true);
        await onRefresh();
        setRefreshing(false);
      }
    };

    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [onRefresh, refreshing]);

  return { refreshing };
}