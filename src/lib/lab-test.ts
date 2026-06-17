export type LabTest = {
  id: string;
  productName: string;
  purity: string;
  batchNumber: string;
  labName: string;
  testDate: string;
  reportUrl: string;
};

export const DEFAULT_LAB_NAME = "Janoshik Analytical";

export function sortLabTests(tests: LabTest[]): LabTest[] {
  return [...tests].sort(
    (left, right) =>
      new Date(right.testDate).getTime() - new Date(left.testDate).getTime(),
  );
}

export function parsePurityValue(purity: string): number | null {
  const match = purity.replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isFinite(value) ? value : null;
}

export function getLabTestStats(tests: LabTest[]) {
  const purityValues = tests
    .map((test) => parsePurityValue(test.purity))
    .filter((value): value is number => value !== null);

  const uniqueLabs = new Set(
    tests.map((test) => test.labName.trim()).filter(Boolean),
  );

  return {
    productCount: tests.length,
    averagePurity:
      purityValues.length > 0
        ? purityValues.reduce((sum, value) => sum + value, 0) / purityValues.length
        : null,
    labCount: uniqueLabs.size,
  };
}

export function isPdfReport(url: string): boolean {
  return url.toLowerCase().split("?")[0].endsWith(".pdf");
}
