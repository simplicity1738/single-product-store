import { KV_KEYS, readKvData, writeKvData } from "@/lib/kv-store";
import {
  DEFAULT_LAB_NAME,
  sortLabTests,
  type LabTest,
} from "@/lib/lab-test";
import { sanitizePlainText } from "@/lib/sanitize";

export const LAB_TEST_FIELD_LIMITS = {
  productName: 120,
  purity: 20,
  batchNumber: 80,
  labName: 120,
  reportUrl: 500,
} as const;

function normalizeReportUrl(value: string): string {
  const trimmed = sanitizePlainText(value, LAB_TEST_FIELD_LIMITS.reportUrl);
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
}

export function normalizeLabTest(
  entry: Partial<LabTest>,
  existing?: LabTest,
): LabTest {
  const testDateRaw = entry.testDate ?? existing?.testDate ?? new Date().toISOString();
  const parsedDate = new Date(testDateRaw);
  const testDate = Number.isNaN(parsedDate.getTime())
    ? new Date().toISOString()
    : parsedDate.toISOString();

  return {
    id: entry.id?.trim() || existing?.id || `lab-test-${Date.now()}`,
    productName: sanitizePlainText(
      entry.productName ?? existing?.productName ?? "",
      LAB_TEST_FIELD_LIMITS.productName,
    ),
    purity: sanitizePlainText(
      entry.purity ?? existing?.purity ?? "",
      LAB_TEST_FIELD_LIMITS.purity,
    ),
    batchNumber: sanitizePlainText(
      entry.batchNumber ?? existing?.batchNumber ?? "",
      LAB_TEST_FIELD_LIMITS.batchNumber,
    ),
    labName: sanitizePlainText(
      entry.labName ?? existing?.labName ?? DEFAULT_LAB_NAME,
      LAB_TEST_FIELD_LIMITS.labName,
    ) || DEFAULT_LAB_NAME,
    testDate,
    reportUrl: normalizeReportUrl(entry.reportUrl ?? existing?.reportUrl ?? ""),
  };
}

export async function readLabTests(): Promise<LabTest[]> {
  const parsed = await readKvData<LabTest[]>(
    KV_KEYS.LAB_TESTS,
    "lab-tests.json",
    [],
  );

  if (!Array.isArray(parsed)) return [];
  return sortLabTests(parsed.map((entry) => normalizeLabTest(entry)));
}

async function writeLabTests(tests: LabTest[]): Promise<void> {
  await writeKvData(KV_KEYS.LAB_TESTS, "lab-tests.json", sortLabTests(tests));
}

export async function getLabTestById(id: string): Promise<LabTest | null> {
  const tests = await readLabTests();
  return tests.find((entry) => entry.id === id) ?? null;
}

export async function createLabTest(input: Partial<LabTest>): Promise<LabTest> {
  const tests = await readLabTests();
  const test = normalizeLabTest(input);
  tests.push(test);
  await writeLabTests(tests);
  return test;
}

export async function updateLabTest(
  id: string,
  input: Partial<LabTest>,
): Promise<LabTest | null> {
  const tests = await readLabTests();
  const index = tests.findIndex((entry) => entry.id === id);
  if (index < 0) return null;

  const test = normalizeLabTest({ ...tests[index], ...input, id }, tests[index]);
  tests[index] = test;
  await writeLabTests(tests);
  return test;
}

export async function deleteLabTest(id: string): Promise<boolean> {
  const tests = await readLabTests();
  const next = tests.filter((entry) => entry.id !== id);
  if (next.length === tests.length) return false;
  await writeLabTests(next);
  return true;
}
