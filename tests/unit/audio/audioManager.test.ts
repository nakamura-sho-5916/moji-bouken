import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AudioManager } from '../../../src/features/audio';

class MockParam {
  value = 0;
  setValueAtTime(value: number) {
    this.value = value;
  }
  linearRampToValueAtTime(value: number) {
    this.value = value;
  }
  exponentialRampToValueAtTime(value: number) {
    this.value = value;
  }
  cancelAndHoldAtTime() {
    return undefined;
  }
  setTargetAtTime(value: number) {
    this.value = value;
  }
  cancelScheduledValues() {
    return undefined;
  }
}

class MockNode {
  connect = vi.fn();
  disconnect = vi.fn();
}

class MockGain extends MockNode {
  gain = new MockParam();
}

class MockOscillator extends MockNode {
  frequency = new MockParam();
  type: OscillatorType = 'sine';
  start = vi.fn();
  stop = vi.fn();
}

class MockAudioContext {
  currentTime = 0;
  destination = new MockNode();
  state: AudioContextState = 'running';
  createGain = vi.fn(() => new MockGain());
  createOscillator = vi.fn(() => new MockOscillator());
  resume = vi.fn(async () => undefined);
  suspend = vi.fn(async () => undefined);
}

describe('AudioManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-07-20T00:00:00.000Z'));
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: MockAudioContext,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes and unlocks after a user gesture', async () => {
    const manager = new AudioManager();

    expect(manager.getState().supported).toBe(true);
    expect(manager.getState().unlocked).toBe(false);
    await expect(manager.unlock()).resolves.toBe(true);
    expect(manager.getState().unlocked).toBe(true);
  });

  it('queues sound effects before unlock without crashing', async () => {
    const manager = new AudioManager();
    const events: string[] = [];
    manager.subscribe((event) => events.push(event.type));

    manager.playSoundEffect('correct');
    expect(manager.getState().queuedRequests).toBe(1);
    await manager.unlock();

    expect(events).toContain('sfx');
    expect(manager.getState().queuedRequests).toBe(0);
  });

  it('does not play when muted', async () => {
    const manager = new AudioManager();
    const events: boolean[] = [];
    manager.subscribe((event) => {
      if (event.type === 'sfx') {
        events.push(event.played);
      }
    });
    manager.updateSettings({ muteAll: true });
    await manager.unlock();
    manager.playSoundEffect('correct');

    expect(events.at(-1)).toBe(false);
  });

  it('prevents repeated sound effects inside cooldown', async () => {
    const manager = new AudioManager();
    const played: boolean[] = [];
    manager.subscribe((event) => {
      if (event.type === 'sfx') {
        played.push(event.played);
      }
    });
    await manager.unlock();
    manager.playSoundEffect('correct');
    manager.playSoundEffect('correct');

    expect(played).toEqual([true, false]);
  });

  it('switches BGM without duplicating the same track', async () => {
    const manager = new AudioManager();
    const played: string[] = [];
    manager.subscribe((event) => {
      if (event.type === 'bgm' && event.id && event.played) {
        played.push(event.id);
      }
    });

    await manager.unlock();
    manager.playBgm('home');
    manager.playBgm('home');
    manager.playBgm('mission');

    expect(played).toEqual(['home', 'mission']);
    expect(manager.getState().currentBgm).toBe('mission');
    expect(manager.getState().currentBpm).toBeGreaterThan(0);
    manager.stopBgm(0);
  });

  it('ducks BGM during large reward sound effects and releases nodes', async () => {
    const manager = new AudioManager();
    const duckEvents: boolean[] = [];
    manager.subscribe((event) => {
      if (event.type === 'duck') {
        duckEvents.push(event.active);
      }
    });

    await manager.unlock();
    manager.playBgm('home');
    manager.playSoundEffect('level-up');

    expect(manager.getState().ducking).toBe(true);
    expect(duckEvents).toContain(true);

    await vi.advanceTimersByTimeAsync(1200);

    expect(manager.getState().ducking).toBe(false);
    expect(duckEvents).toContain(false);
    manager.stopBgm(0);
  });
});
