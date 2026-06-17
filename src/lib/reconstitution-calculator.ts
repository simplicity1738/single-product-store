export type SyringeType = "U100" | "U50";
export type DoseUnit = "mg" | "mcg";
export type CalculationMode = "raw" | "premixed";

/** Factory fill volume for pre-mixed single-dose vials (e.g. Mounjaro / Zepbound). */
export const PREMIXED_VIAL_VOLUME_ML = 0.5;

export const PREMIXED_VIAL_STRENGTHS = [2.5, 5, 7.5, 10, 12.5, 15] as const;

export type PremixedVialStrength = (typeof PREMIXED_VIAL_STRENGTHS)[number];

export type ReconstitutionInput = {
  mode?: CalculationMode;
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

export function getSyringeMaxUnits(syringeType: SyringeType): number {
  return syringeType === "U100" ? 100 : 50;
}

export function getPremixedDoseOptions(vialStrengthMg: number): PremixedVialStrength[] {
  return PREMIXED_VIAL_STRENGTHS.filter((strength) => strength <= vialStrengthMg);
}

export function calculateReconstitution(
  input: ReconstitutionInput,
): ReconstitutionResult {
  const mode = input.mode ?? "raw";
  const { peptideMg, doseMg, syringeType } = input;
  const waterMl =
    mode === "premixed" ? PREMIXED_VIAL_VOLUME_ML : input.waterMl;
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

  const concentrationMgPerMl = peptideMg / waterMl;
  const volumeMl = doseMg / concentrationMgPerMl;
  const units = volumeMl * 100;
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
