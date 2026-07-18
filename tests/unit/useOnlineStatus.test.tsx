import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useOnlineStatus } from '../../src/hooks/useOnlineStatus';

function setNavigatorOnline(value: boolean) {
  Object.defineProperty(window.navigator, 'onLine', {
    configurable: true,
    value,
  });
}

describe('useOnlineStatus', () => {
  afterEach(() => {
    vi.useRealTimers();
    setNavigatorOnline(true);
  });

  it('オフラインとオンライン復帰の表示を反映する', async () => {
    vi.useFakeTimers();
    setNavigatorOnline(true);

    const { result } = renderHook(() => useOnlineStatus());

    act(() => {
      setNavigatorOnline(false);
      window.dispatchEvent(new Event('offline'));
    });

    expect(result.current.isOnline).toBe(false);
    expect(result.current.message).toBe('オフラインでも あそべるよ');

    act(() => {
      setNavigatorOnline(true);
      window.dispatchEvent(new Event('online'));
    });

    expect(result.current.isOnline).toBe(true);
    expect(result.current.message).toBe('つながったよ');

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(result.current.message).toBeNull();
  });
});
