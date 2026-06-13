import { KV_KEYS, readKvData, writeKvData } from "@/lib/kv-store";

export type Subscriber = {
  email: string;
  subscribedAt: string;
};

export async function readSubscribers(): Promise<Subscriber[]> {
  const parsed = await readKvData<Subscriber[]>(
    KV_KEYS.SUBSCRIBERS,
    "subscribers.json",
    [],
  );
  return Array.isArray(parsed) ? parsed : [];
}

export async function writeSubscribers(subscribers: Subscriber[]): Promise<void> {
  await writeKvData(KV_KEYS.SUBSCRIBERS, "subscribers.json", subscribers);
}

export async function addSubscriber(email: string): Promise<Subscriber[]> {
  const normalized = email.trim().toLowerCase();
  const subscribers = await readSubscribers();

  if (subscribers.some((entry) => entry.email === normalized)) {
    return subscribers;
  }

  const next = [
    ...subscribers,
    { email: normalized, subscribedAt: new Date().toISOString() },
  ];
  await writeSubscribers(next);
  return next;
}

export async function removeSubscriber(email: string): Promise<Subscriber[]> {
  const normalized = email.trim().toLowerCase();
  const subscribers = await readSubscribers();
  const next = subscribers.filter((entry) => entry.email !== normalized);
  await writeSubscribers(next);
  return next;
}

export async function getSubscriberVelocity(): Promise<{
  signupsToday: number;
  signupsThisWeek: number;
}> {
  const subscribers = await readSubscribers();
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - 7);
  startOfWeek.setHours(0, 0, 0, 0);

  let signupsToday = 0;
  let signupsThisWeek = 0;

  for (const subscriber of subscribers) {
    const subscribedAt = new Date(subscriber.subscribedAt);
    if (Number.isNaN(subscribedAt.getTime())) continue;
    if (subscribedAt >= startOfToday) signupsToday += 1;
    if (subscribedAt >= startOfWeek) signupsThisWeek += 1;
  }

  return { signupsToday, signupsThisWeek };
}
