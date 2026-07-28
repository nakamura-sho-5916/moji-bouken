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

  it('does not play when sound effects are disabled', async () => {
    const manager = new AudioManager();
    const events: boolean[] = [];
    manager.subscribe((event) => {
      if (event.type === 'sfx') {
        events.push(event.played);
      }
    });
    manager.updateSettings({ soundEffectsEnabled: false });
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

  it('starts battle BGM once and supports a fast mission-end fade', async () => {
    const manager = new AudioManager();
    const played: string[] = [];
    manager.subscribe((event) => {
      if (event.type === 'bgm' && event.id && event.played) {
        played.push(event.id);
      }
    });

    await manager.unlock();
    manager.playBgm('battle');
    manager.playBgm('battle');

    expect(played).toEqual(['battle']);
    expect(manager.getState().currentBgm).toBe('battle');
    expect(manager.getState().currentBpm).toBe(128);

    manager.stopBgm(180);

    expect(manager.getState().currentBgm).toBeNull();
  });

  it('keeps result and boss BGM routing available without changing their tracks', async () => {
    const manager = new AudioManager();
    const played: string[] = [];
    manager.subscribe((event) => {
      if (event.type === 'bgm' && event.id && event.played) {
        played.push(event.id);
      }
    });

    await manager.unlock();
    manager.playBgm('boss');
    expect(manager.getState().currentBgm).toBe('boss');
    manager.playBgm('result');
    expect(manager.getState().currentBgm).toBe('result');

    expect(played).toEqual(['boss', 'result']);
  });

  it('stops battle BGM when muted and restarts when volume settings are active', async () => {
    const manager = new AudioManager();

    await manager.unlock();
    manager.playBgm('battle');
    expect(manager.getState().currentBgm).toBe('battle');

    manager.updateSettings({ muteAll: true });
    expect(manager.getState().currentBgm).toBeNull();

    manager.updateSettings({
      bgmEnabled: true,
      bgmVolume: 0.6,
      masterVolume: 0.7,
      muteAll: false,
    });
    manager.playBgm('battle');
    expect(manager.getState().currentBgm).toBe('battle');
  });

  it('resumes the active battle BGM after AudioContext suspension', async () => {
    const manager = new AudioManager();

    await manager.unlock();
    manager.playBgm('battle');
    manager.suspend();
    manager.resume();
    await Promise.resolve();

    expect(manager.getState().currentBgm).toBe('battle');
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

  it('keeps game flow safe when AudioContext is unavailable', async () => {
    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      value: undefined,
    });
    const manager = new AudioManager();
    const played: boolean[] = [];
    manager.subscribe((event) => {
      if (event.type === 'sfx') {
        played.push(event.played);
      }
    });

    await expect(manager.unlock()).resolves.toBe(false);
    manager.playSoundEffect('correct');

    expect(manager.getState().supported).toBe(false);
    expect(played.at(-1)).toBe(false);
  });
});
