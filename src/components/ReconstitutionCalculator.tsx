"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SyringeVisual from "@/components/SyringeVisual";
import {
  calculateReconstitution,
  DOSE_PRESET_MG,
  doseFromMg,
  formatCalculatorNumber,
  formatDosePresetLabel,
  formatStrengthPresetLabel,
  formatWaterPresetLabel,
  isPresetValue,
  STRENGTH_PRESET_MG,
  WATER_PRESET_ML,
  type DoseUnit,
  type SyringeType,
} from "@/lib/reconstitution-calculator";

const pillBaseClass =
  "rounded-xl border px-3 py-2.5 text-sm font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ECE5D8]/40";

function pillClass(selected: boolean): string {
  return selected
    ? `${pillBaseClass} border-[#ECE5D8] bg-[#ECE5D8] text-[#0F0C0B]`
    : `${pillBaseClass} border-white/10 bg-white/5 text-white hover:border-[#ECE5D8]`;
}

type CalculatorSectionProps = {
  title: string;
  children: ReactNode;
};

function CalculatorSection({ title, children }: CalculatorSectionProps) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 text-white shadow-xl backdrop-blur-md sm:p-6 md:p-8">
      <h2 className="text-base font-semibold tracking-tight text-white sm:text-lg">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

type CustomNumberInputProps = {
  id: string;
  label: string;
  value: number;
  onChange: (value: number) => void;
  unit: string;
};

function CustomNumberInput({
  id,
  label,
  value,
  onChange,
  unit,
}: CustomNumberInputProps) {
  return (
    <label htmlFor={id} className="mt-4 block">
      <span className="text-sm font-medium text-[#CFC4BD]">{label}</span>
      <div className="relative mt-2">
        <input
          id={id}
          type="number"
          min={0}
          step="0.01"
          value={Number.isFinite(value) ? value : ""}
          onChange={(event) => {
            const next = Number(event.target.value);
            if (Number.isFinite(next) && next > 0) {
              onChange(next);
            }
          }}
          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-14 text-sm font-semibold tabular-nums text-white outline-none transition placeholder:text-neutral-500 focus:border-[#ECE5D8] focus:outline-none"
        />
        <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
          {unit}
        </span>
      </div>
    </label>
  );
}

function UnitToggle({
  unit,
  onChange,
  ariaLabel,
}: {
  unit: DoseUnit;
  onChange: (unit: DoseUnit) => void;
  ariaLabel: string;
}) {
  return (
    <div
      className="relative mt-4 grid max-w-xs grid-cols-2 rounded-full border border-white/10 bg-white/5 p-1"
      role="group"
      aria-label={ariaLabel}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-[#ECE5D8] shadow-sm transition-transform duration-300 ease-out"
        style={{
          transform: unit === "mg" ? "translateX(0)" : "translateX(100%)",
        }}
      />
      {(["mg", "mcg"] as const).map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onChange(option)}
          aria-pressed={unit === option}
          className={`relative z-10 rounded-full py-2 text-xs font-semibold uppercase tracking-wide transition-colors sm:text-sm ${
            unit === option ? "text-[#0F0C0B]" : "text-[#A89A92] hover:text-white"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}

export default function ReconstitutionCalculator() {
  const { t } = useLanguage();
  const c = t.calculator;

  const [doseMg, setDoseMg] = useState(0.25);
  const [doseUnit, setDoseUnit] = useState<DoseUnit>("mg");
  const [peptideMg, setPeptideMg] = useState(5);
  const [waterMl, setWaterMl] = useState(2);
  const [syringeType, setSyringeType] = useState<SyringeType>("U100");

  const result = useMemo(
    () =>
      calculateReconstitution({
        peptideMg,
        waterMl,
        doseMg,
        syringeType,
      }),
    [peptideMg, waterMl, doseMg, syringeType],
  );

  const hasValidInputs = peptideMg > 0 && waterMl > 0 && doseMg > 0;

  const doseDisplay =
    doseUnit === "mcg"
      ? `${formatCalculatorNumber(doseFromMg(doseMg, "mcg"), 0)} mcg`
      : `${formatCalculatorNumber(doseMg, doseMg < 1 ? 2 : 1)} mg`;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <CalculatorSection title={c.doseSectionTitle}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {DOSE_PRESET_MG.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setDoseMg(preset)}
              aria-pressed={isPresetValue(doseMg, preset)}
              className={pillClass(isPresetValue(doseMg, preset))}
            >
              {formatDosePresetLabel(preset, doseUnit)}
            </button>
          ))}
        </div>

        <UnitToggle
          unit={doseUnit}
          onChange={setDoseUnit}
          ariaLabel={c.desiredDose}
        />

        <CustomNumberInput
          id="custom-dose"
          label={c.customDoseLabel}
          value={doseMg}
          onChange={setDoseMg}
          unit="mg"
        />
      </CalculatorSection>

      <CalculatorSection title={c.strengthSectionTitle}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {STRENGTH_PRESET_MG.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setPeptideMg(preset)}
              aria-pressed={isPresetValue(peptideMg, preset)}
              className={pillClass(isPresetValue(peptideMg, preset))}
            >
              {formatStrengthPresetLabel(preset)}
            </button>
          ))}
        </div>

        <CustomNumberInput
          id="custom-strength"
          label={c.customStrengthLabel}
          value={peptideMg}
          onChange={setPeptideMg}
          unit="mg"
        />
      </CalculatorSection>

      <CalculatorSection title={c.waterSectionTitle}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {WATER_PRESET_ML.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setWaterMl(preset)}
              aria-pressed={isPresetValue(waterMl, preset)}
              className={pillClass(isPresetValue(waterMl, preset))}
            >
              {formatWaterPresetLabel(preset)}
            </button>
          ))}
        </div>

        <CustomNumberInput
          id="custom-water"
          label={c.customWaterLabel}
          value={waterMl}
          onChange={setWaterMl}
          unit="mL"
        />
      </CalculatorSection>

      <CalculatorSection title={c.syringeSize}>
        <div className="grid grid-cols-2 gap-3">
          {(["U100", "U50"] as const).map((type) => {
            const selected = syringeType === type;
            const label = type === "U100" ? c.syringeU100 : c.syringeU50;

            return (
              <button
                key={type}
                type="button"
                onClick={() => setSyringeType(type)}
                aria-pressed={selected}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  selected
                    ? "border-[#ECE5D8] bg-[#ECE5D8] font-semibold text-[#0F0C0B]"
                    : "border-white/10 bg-white/5 text-[#CFC4BD] hover:border-[#ECE5D8] hover:text-white"
                }`}
              >
                <span className="block font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      </CalculatorSection>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 text-white shadow-xl backdrop-blur-md sm:p-8">
        <h2 className="text-lg font-semibold text-white">{c.resultsTitle}</h2>

        <dl className="mt-5 space-y-4">
          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
              {c.resultPeptideDose}
            </dt>
            <dd className="mt-1 text-lg font-bold tabular-nums text-white">
              {hasValidInputs ? doseDisplay : c.selectValues}
            </dd>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
            <dt className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
              {c.resultDrawSyringe}
            </dt>
            <dd className="mt-1 text-lg font-bold tabular-nums text-[#ECE5D8]">
              {hasValidInputs
                ? `${formatCalculatorNumber(result.units, 1)} ${c.unitsLabel}`
                : c.selectValues}
            </dd>
            {hasValidInputs ? (
              <p className="mt-1 text-sm font-medium text-[#CFC4BD]">
                {c.resultTicks.replace(
                  "{ticks}",
                  formatCalculatorNumber(result.ticks, 1),
                )}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                {c.resultVialContains}
              </dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-white">
                {hasValidInputs
                  ? c.vialContainsValue
                      .replace("{mg}", formatCalculatorNumber(peptideMg, 1))
                      .replace("{ml}", formatCalculatorNumber(waterMl, 1))
                  : c.selectValues}
              </dd>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
              <dt className="text-xs font-semibold uppercase tracking-wide text-[#A89A92]">
                {c.concentration}
              </dt>
              <dd className="mt-1 text-sm font-semibold tabular-nums text-white">
                {hasValidInputs
                  ? `${formatCalculatorNumber(result.concentrationMgPerMl, 2)} mg/mL`
                  : c.selectValues}
              </dd>
            </div>
          </div>
        </dl>

        {result.exceedsSyringe ? (
          <p className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-[#CFC4BD]">
            {c.exceedsWarning.replace("{max}", String(result.maxUnits))}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 shadow-xl backdrop-blur-md sm:p-8">
        <SyringeVisual
          units={result.units}
          maxUnits={result.maxUnits}
          unitLabel={
            syringeType === "U100" ? c.syringeU100Short : c.syringeU50Short
          }
        />
      </section>

      <p className="text-xs leading-relaxed text-[#A89A92]">{c.disclaimer}</p>
    </div>
  );
}
