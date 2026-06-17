export type SyringeType = "U100" | "U50";
export type DoseUnit = "mg" | "mcg";

export type ReconstitutionInput = {
  peptideMg: number;
  waterMl: number;
  doseMg: number;
  syringeType: SyringeType;
};

export function doseToMg(value: number, unit: DoseUnit): number {
  return unit === "mcg" ? value / 1000 : value;
}

export function doseFromMg(doseMg: number, unit: DoseUnit): number {
  return unit === "mcg" ? doseMg * 1000 : doseMg;
}

export type ReconstitutionResult = {
  concentrationMgPerMl: number;
  volumeMl: number;
  units: number;
  ticks: number;
  maxUnits: number;
  exceedsSyringe: boolean;
};

/** U100 and U50 both use 100 tick marks per 1 mL of fluid drawn. */
export const SYRINGE_UNITS_PER_ML = 100;

export function getSyringeMaxUnits(syringeType: SyringeType): number {
  return syringeType === "U100" ? 100 : 50;
}

export function calculateReconstitution(
  input: ReconstitutionInput,
): ReconstitutionResult {
  const { peptideMg, waterMl, doseMg, syringeType } = input;
  const maxUnits = getSyringeMaxUnits(syringeType);

  if (peptideMg <= 0 || waterMl <= 0 || doseMg <= 0) {
    return {
      concentrationMgPerMl: 0,
      volumeMl: 0,
      units: 0,
      ticks: 0,
      maxUnits,
      exceedsSyringe: false,
    };
  }

  const volumeMl = (doseMg / peptideMg) * waterMl;
  const units = volumeMl * SYRINGE_UNITS_PER_ML;
  const concentrationMgPerMl = peptideMg / waterMl;
  const ticks = units;
  const exceedsSyringe = units > maxUnits;

  return {
    concentrationMgPerMl,
    volumeMl,
    units,
    ticks,
    maxUnits,
    exceedsSyringe,
  };
}

export function formatCalculatorNumber(value: number, decimals = 2): string {
  return value.toLocaleString("sv-SE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
}
