import { createClient, type VercelKV } from "@vercel/kv";
import { readFile, writeFile } from "fs/promises";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "src/lib/data");

export const KV_KEYS = {
  ORDERS: "simplicity:orders",
  STORE_CONFIG: "simplicity:store-config",
  SUBSCRIBERS: "simplicity:subscribers",
  INFLUENCER_STATS: "simplicity:influencer-stats",
  SYSTEM_LOGS: "simplicity:system-logs",
  BLOG_POSTS: "simplicity:blog-posts",
  LAB_TESTS: "simplicity:lab-tests",
  ADMIN_SECURITY: "simplicity:admin-security",
  GUIDE_FEEDBACK: "simplicity:guide-feedback",
} as const;

type DataFile =
  | "orders.json"
  | "store-config.json"
  | "subscribers.json"
  | "influencer-stats.json"
  | "system-logs.json"
  | "blog-posts.json"
  | "lab-tests.json"
  | "admin-security.json"
  | "guide-feedback.json";

let kvClient: VercelKV | null | undefined;

function getRedisUrl(): string | undefined {
  return (
    process.env.KV_REST_API_URL?.trim() ||
    process.env.UPSTASH_REDIS_REST_URL?.trim()
  );
}

function getRedisToken(): string | undefined {
  return (
    process.env.KV_REST_API_TOKEN?.trim() ||
    process.env.UPSTASH_REDIS_REST_TOKEN?.trim()
  );
}

export function isKvConfigured(): boolean {
  return Boolean(getRedisUrl() && getRedisToken());
}

function getKvClient(): VercelKV | null {
  if (kvClient !== undefined) return kvClient;

  const url = getRedisUrl();
  const token = getRedisToken();
  if (!url || !token) {
    kvClient = null;
    return null;
  }

  kvClient = createClient({ url, token });
  return kvClient;
}

async function readJsonFile<T>(filename: DataFile, fallback: T): Promise<T> {
  try {
    const raw = await readFile(path.join(DATA_DIR, filename), "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

async function writeJsonFile<T>(filename: DataFile, data: T): Promise<void> {
  await writeFile(
    path.join(DATA_DIR, filename),
    `${JSON.stringify(data, null, 2)}\n`,
    "utf-8",
  );
}

export async function readKvData<T>(
  key: string,
  filename: DataFile,
  fallback: T,
  options?: { seedFromJson?: boolean },
): Promise<T> {
  const seedFromJson = options?.seedFromJson ?? true;
  const client = getKvClient();

  if (client) {
    const cached = await client.get<T>(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    if (seedFromJson) {
      const seeded = await readJsonFile<T>(filename, fallback);
      await client.set(key, seeded);
      return seeded;
    }

    return fallback;
  }

  return readJsonFile<T>(filename, fallback);
}

export async function writeKvData<T>(
  key: string,
  filename: DataFile,
  data: T,
): Promise<void> {
  const client = getKvClient();

  if (client) {
    await client.set(key, data);
    return;
  }

  await writeJsonFile(filename, data);
}
