import { KV_KEYS, readKvData, writeKvData } from "@/lib/kv-store";
import { sendSecurityAlertNotification } from "@/lib/telegram";

const FAILURE_WINDOW_MS = 10 * 60 * 1000;
const MAX_FAILURES = 3;
const BLOCK_DURATION_MS = 30 * 60 * 1000;

type LoginAttemptRecord = {
  count: number;
  windowStart: number;
  lastUsername: string;
  lastUserAgent: string;
};

type AdminSecurityState = {
  attempts: Record<string, LoginAttemptRecord>;
  blocks: Record<string, number>;
};

const DEFAULT_STATE: AdminSecurityState = {
  attempts: {},
  blocks: {},
};

async function readAdminSecurityState(): Promise<AdminSecurityState> {
  return readKvData<AdminSecurityState>(
    KV_KEYS.ADMIN_SECURITY,
    "admin-security.json",
    DEFAULT_STATE,
    { seedFromJson: false },
  );
}

async function writeAdminSecurityState(state: AdminSecurityState): Promise<void> {
  await writeKvData(KV_KEYS.ADMIN_SECURITY, "admin-security.json", state);
}

function pruneExpiredAttempts(
  attempts: Record<string, LoginAttemptRecord>,
  now: number,
): Record<string, LoginAttemptRecord> {
  const next: Record<string, LoginAttemptRecord> = {};

  for (const [ip, record] of Object.entries(attempts)) {
    if (now - record.windowStart < FAILURE_WINDOW_MS) {
      next[ip] = record;
    }
  }

  return next;
}

function pruneExpiredBlocks(
  blocks: Record<string, number>,
  now: number,
): Record<string, number> {
  const next: Record<string, number> = {};

  for (const [ip, blockedUntil] of Object.entries(blocks)) {
    if (blockedUntil > now) {
      next[ip] = blockedUntil;
    }
  }

  return next;
}

export async function isAdminIpBlocked(ip: string): Promise<boolean> {
  const now = Date.now();
  const state = await readAdminSecurityState();
  const blockedUntil = state.blocks[ip];
  return typeof blockedUntil === "number" && blockedUntil > now;
}

export async function clearAdminLoginFailures(ip: string): Promise<void> {
  const state = await readAdminSecurityState();
  if (!state.attempts[ip]) return;

  delete state.attempts[ip];
  await writeAdminSecurityState(state);
}

export type AdminLoginFailureResult = {
  blocked: boolean;
  failureCount: number;
};

export async function recordAdminLoginFailure(
  ip: string,
  username: string,
  userAgent: string,
): Promise<AdminLoginFailureResult> {
  const now = Date.now();
  const state = await readAdminSecurityState();

  state.attempts = pruneExpiredAttempts(state.attempts, now);
  state.blocks = pruneExpiredBlocks(state.blocks, now);

  const current = state.attempts[ip];
  const withinWindow =
    current && now - current.windowStart < FAILURE_WINDOW_MS;

  const nextRecord: LoginAttemptRecord = withinWindow
    ? {
        count: current.count + 1,
        windowStart: current.windowStart,
        lastUsername: username,
        lastUserAgent: userAgent,
      }
    : {
        count: 1,
        windowStart: now,
        lastUsername: username,
        lastUserAgent: userAgent,
      };

  state.attempts[ip] = nextRecord;

  if (nextRecord.count >= MAX_FAILURES) {
    state.blocks[ip] = now + BLOCK_DURATION_MS;
    delete state.attempts[ip];

    await writeAdminSecurityState(state);

    void sendSecurityAlertNotification({
      ip,
      userAgent,
      username,
    });

    return { blocked: true, failureCount: nextRecord.count };
  }

  await writeAdminSecurityState(state);
  return { blocked: false, failureCount: nextRecord.count };
}

export function getAdminBlockRetryAfterSeconds(blockedUntil: number): number {
  return Math.max(1, Math.ceil((blockedUntil - Date.now()) / 1000));
}

export async function getAdminIpBlockExpiry(ip: string): Promise<number | null> {
  const state = await readAdminSecurityState();
  const blockedUntil = state.blocks[ip];
  if (typeof blockedUntil !== "number" || blockedUntil <= Date.now()) {
    return null;
  }
  return blockedUntil;
}
