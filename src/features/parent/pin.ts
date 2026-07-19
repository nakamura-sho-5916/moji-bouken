import { DEFAULT_PLAYER_ID } from '../../db/constants';
import { initializeAppData } from '../../db/initializeAppData';
import {
  getAppSettings,
  updateAppSettings,
} from '../../db/repositories/settingsRepository';

export const PIN_LENGTH = 4;
export const PIN_MAX_FAILURES = 5;
export const PIN_LOCK_MS = 30_000;
export const PARENT_SESSION_KEY = 'moji-bouken:parent-authenticated';

function isValidPin(pin: string) {
  return new RegExp(`^\\d{${PIN_LENGTH}}$`).test(pin);
}

function toBase64(bytes: Uint8Array) {
  return btoa(String.fromCharCode(...bytes));
}

function fromBase64(value: string) {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0));
}

async function sha256Base64(value: string, salt: string) {
  const saltBytes = fromBase64(salt);
  const valueBytes = new TextEncoder().encode(value);
  const combined = new Uint8Array(saltBytes.length + valueBytes.length);
  combined.set(saltBytes);
  combined.set(valueBytes, saltBytes.length);
  const digest = await crypto.subtle.digest('SHA-256', combined);
  return toBase64(new Uint8Array(digest));
}

function createSalt() {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return toBase64(bytes);
}

export async function configureParentPin(input: {
  pin: string;
  confirmPin: string;
  playerId?: string;
}) {
  await initializeAppData();
  if (!isValidPin(input.pin) || input.pin !== input.confirmPin) {
    return { ok: false, message: 'ばんごうを もういちど たしかめてください' };
  }
  const salt = createSalt();
  const hash = await sha256Base64(input.pin, salt);
  await updateAppSettings(input.playerId ?? DEFAULT_PLAYER_ID, {
    parentPinConfigured: true,
    parentPinHash: hash,
    parentPinSalt: salt,
    parentPinFailedAttempts: 0,
    parentPinLockUntil: null,
  });
  return { ok: true, message: 'ばんごうを せっていしました' };
}

export async function verifyParentPin(
  pin: string,
  playerId = DEFAULT_PLAYER_ID,
) {
  await initializeAppData();
  const settings = await getAppSettings(playerId);
  const now = Date.now();
  const lockUntil = settings?.parentPinLockUntil
    ? Date.parse(settings.parentPinLockUntil)
    : 0;
  if (lockUntil > now) {
    return { ok: false, locked: true, message: 'すこし まってください' };
  }
  if (!settings?.parentPinConfigured) {
    sessionStorage.setItem(PARENT_SESSION_KEY, 'true');
    return { ok: true, locked: false, message: 'ひらきました' };
  }
  if (!isValidPin(pin) || !settings.parentPinHash || !settings.parentPinSalt) {
    return {
      ok: false,
      locked: false,
      message: 'ばんごうを もういちど たしかめてください',
    };
  }
  const hash = await sha256Base64(pin, settings.parentPinSalt);
  if (hash === settings.parentPinHash) {
    await updateAppSettings(playerId, {
      parentPinFailedAttempts: 0,
      parentPinLockUntil: null,
    });
    sessionStorage.setItem(PARENT_SESSION_KEY, 'true');
    return { ok: true, locked: false, message: 'ひらきました' };
  }
  const failedAttempts = (settings.parentPinFailedAttempts ?? 0) + 1;
  const locked = failedAttempts >= PIN_MAX_FAILURES;
  await updateAppSettings(playerId, {
    parentPinFailedAttempts: failedAttempts,
    parentPinLockUntil: locked
      ? new Date(now + PIN_LOCK_MS).toISOString()
      : null,
  });
  return {
    ok: false,
    locked,
    message: locked
      ? 'すこし まってください'
      : 'ばんごうを もういちど たしかめてください',
  };
}

export async function changeParentPin(input: {
  currentPin: string;
  newPin: string;
  confirmPin: string;
}) {
  const verified = await verifyParentPin(input.currentPin);
  if (!verified.ok) {
    return verified;
  }
  return configureParentPin({
    pin: input.newPin,
    confirmPin: input.confirmPin,
  });
}

export async function clearParentPin(currentPin: string) {
  const verified = await verifyParentPin(currentPin);
  if (!verified.ok) {
    return verified;
  }
  await updateAppSettings(DEFAULT_PLAYER_ID, {
    parentPinConfigured: false,
    parentPinHash: null,
    parentPinSalt: null,
    parentPinFailedAttempts: 0,
    parentPinLockUntil: null,
  });
  return { ok: true, locked: false, message: 'PINを かいじょしました' };
}

export function isParentSessionAuthenticated() {
  return sessionStorage.getItem(PARENT_SESSION_KEY) === 'true';
}

export function lockParentSession() {
  sessionStorage.removeItem(PARENT_SESSION_KEY);
}
