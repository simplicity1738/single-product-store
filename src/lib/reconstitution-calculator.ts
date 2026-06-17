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

export const DOSE_PRESET_MG = [
  0.1, 0.25, 0.5, 1, 2, 2.5, 5, 7.5, 10, 12.5, 15,
] as const;

export const STRENGTH_PRESET_MG = [1, 5, 10, 15, 20, 50] as const;

export const WATER_PRESET_ML = [0.5, 1, 1.5, 2, 2.5, 3] as const;

export function isPresetValue(value: number, preset: number): boolean {
  return Math.abs(value - preset) < 0.001;
}

export function formatDosePresetLabel(mg: number, unit: DoseUnit): string {
  if (unit === "mcg") {
    const mcg = mg * 1000;
    return `${formatCalculatorNumber(mcg, mcg % 100 === 0 ? 0 : 1)} mcg`;
  }

  const decimals = mg < 1 ? 2 : mg % 1 === 0 ? 0 : 1;
  return `${formatCalculatorNumber(mg, decimals)} mg`;
}

export function formatStrengthPresetLabel(mg: number): string {
  return `${formatCalculatorNumber(mg, mg % 1 === 0 ? 0 : 1)} mg`;
}

export function formatWaterPresetLabel(ml: number): string {
  return `${formatCalculatorNumber(ml, 1)} mL`;
}

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
