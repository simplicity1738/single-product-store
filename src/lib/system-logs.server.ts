import { KV_KEYS, readKvData, writeKvData } from "@/lib/kv-store";

export type SystemLogEntry = {
  id: string;
  timestamp: string;
  message: string;
  source: string;
};

const MAX_LOGS = 50;

export async function readSystemLogs(): Promise<SystemLogEntry[]> {
  const parsed = await readKvData<SystemLogEntry[]>(
    KV_KEYS.SYSTEM_LOGS,
    "system-logs.json",
    [],
  );
  return Array.isArray(parsed) ? parsed : [];
}

export async function appendSystemLog(
  message: string,
  source: string,
): Promise<void> {
  const logs = await readSystemLogs();
  const entry: SystemLogEntry = {
    id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
    message,
    source,
  };

  const next = [entry, ...logs].slice(0, MAX_LOGS);
  await writeKvData(KV_KEYS.SYSTEM_LOGS, "system-logs.json", next);
}
