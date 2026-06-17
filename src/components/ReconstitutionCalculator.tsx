"use client";

import { useMemo, useState, type CSSProperties } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import SyringeVisual from "@/components/SyringeVisual";
import {
  calculateReconstitution,
  doseFromMg,
  doseToMg,
  formatCalculatorNumber,
  type DoseUnit,
  type SyringeType,
} from "@/lib/reconstitution-calculator";

type SliderFieldProps = {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
};

function SliderField({
  id,
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: SliderFieldProps) {
  const decimals = step < 1 ? String(step).split(".")[1]?.length ?? 1 : 0;

  return (
    <div className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-sm shadow-rose-100/60">
      <div className="flex items-end justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-zinc-800">
          {label}
        </label>
        <p className="text-lg font-bold tabular-nums text-rose-600">
          {formatCalculatorNumber(value, decimals)}
          <span className="ml-1 text-sm font-semibold text-zinc-500">{unit}</span>
        </p>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="calculator-slider mt-4 w-full"
        style={
          {
            "--slider-progress": `${((value - min) / (max - min)) * 100}%`,
          } as CSSProperties
        }
      />
      <div className="mt-2 flex justify-between text-xs text-zinc-400">
        <span>
          {formatCalculatorNumber(min, decimals)} {unit}
        </span>
        <span>
          {formatCalculatorNumber(max, decimals)} {unit}
        </span>
      </div>
    </div>
  );
}

type DoseSliderFieldProps = {
  label: string;
  doseUnit: DoseUnit;
  doseMg: number;
  onDoseMgChange: (doseMg: number) => void;
  onDoseUnitChange: (unit: DoseUnit) => void;
};

function DoseSliderField({
  label,
  doseUnit,
  doseMg,
  onDoseMgChange,
  onDoseUnitChange,
}: DoseSliderFieldProps) {
  const isMg = doseUnit === "mg";
  const min = isMg ? 0.05 : 50;
  const max = isMg ? 15 : 2000;
  const step = isMg ? 0.1 : 50;
  const unit = isMg ? "mg" : "mcg";
  const displayValue = doseFromMg(doseMg, doseUnit);
  const decimals = isMg ? 2 : 0;

  return (
    <div className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-sm shadow-rose-100/60">
      <div className="flex items-end justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-800">{label}</p>
        <p className="text-lg font-bold tabular-nums text-rose-600">
          {formatCalculatorNumber(displayValue, decimals)}
          <span className="ml-1 text-sm font-semibold text-zinc-500">{unit}</span>
        </p>
      </div>

      <div
        className="relative mt-4 grid grid-cols-2 rounded-full border border-rose-100 bg-rose-50/70 p-1"
        role="group"
        aria-label={label}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-white shadow-sm shadow-rose-100/80 transition-transform duration-300 ease-out"
          style={{
            transform: isMg ? "translateX(0)" : "translateX(100%)",
          }}
        />
        {(["mg", "mcg"] as const).map((unitOption) => {
          const selected = doseUnit === unitOption;

          return (
            <button
              key={unitOption}
              type="button"
              onClick={() => onDoseUnitChange(unitOption)}
              aria-pressed={selected}
              className={`relative z-10 rounded-full py-2 text-xs font-semibold uppercase tracking-wide transition-colors sm:text-sm ${
                selected ? "text-rose-700" : "text-zinc-500 hover:text-rose-600"
              }`}
            >
              {unitOption}
            </button>
          );
        })}
      </div>

      <input
        id="dose-amount"
        type="range"
        min={min}
        max={max}
        step={step}
        value={displayValue}
        onChange={(event) =>
          onDoseMgChange(doseToMg(Number(event.target.value), doseUnit))
        }
        className="calculator-slider mt-4 w-full"
        style={
          {
            "--slider-progress": `${((displayValue - min) / (max - min)) * 100}%`,
          } as CSSProperties
        }
      />
      <div className="mt-2 flex justify-between text-xs text-zinc-400">
        <span>
          {formatCalculatorNumber(min, decimals)} {unit}
        </span>
        <span>
          {formatCalculatorNumber(max, decimals)} {unit}
        </span>
      </div>
    </div>
  );
}

export default function ReconstitutionCalculator() {
  const { t } = useLanguage();
  const c = t.calculator;

  const [peptideMg, setPeptideMg] = useState(5);
  const [waterMl, setWaterMl] = useState(2);
  const [doseMg, setDoseMg] = useState(0.25);
  const [doseUnit, setDoseUnit] = useState<DoseUnit>("mg");
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

  const displayUnits = formatCalculatorNumber(result.units, 1);
  const displayTicks = formatCalculatorNumber(result.ticks, 1);

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <SliderField
        id="peptide-mg"
        label={c.peptideAmount}
        value={peptideMg}
        min={1}
        max={30}
        step={0.5}
        unit="mg"
        onChange={setPeptideMg}
      />
      <SliderField
        id="water-ml"
        label={c.waterVolume}
        value={waterMl}
        min={0.1}
        max={10}
        step={0.1}
        unit="mL"
        onChange={setWaterMl}
      />
      <DoseSliderField
        label={c.desiredDose}
        doseUnit={doseUnit}
        doseMg={doseMg}
        onDoseMgChange={setDoseMg}
        onDoseUnitChange={setDoseUnit}
      />

      <div className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-sm shadow-rose-100/60">
        <p className="text-sm font-semibold text-zinc-800">{c.syringeSize}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
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
                    ? "border-rose-300 bg-rose-50 text-rose-700 shadow-sm shadow-rose-100"
                    : "border-rose-100 bg-white text-zinc-600 hover:border-rose-200 hover:bg-rose-50/40"
                }`}
              >
                <span className="block font-semibold">{label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-white via-[#FDF3F3] to-rose-50/80 p-6 shadow-lg shadow-rose-200/40">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">
          {c.resultEyebrow}
        </p>
        <p className="mt-3 text-xl font-bold leading-snug text-zinc-900 sm:text-2xl">
          {c.resultUnits.replace("{units}", displayUnits)}
        </p>
        <p className="mt-2 text-base font-semibold text-zinc-700">
          {c.resultTicks.replace("{ticks}", displayTicks)}
        </p>

        {result.exceedsSyringe && (
          <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {c.exceedsWarning.replace("{max}", String(result.maxUnits))}
          </p>
        )}

        <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl border border-rose-100 bg-white/80 px-3 py-2.5">
            <p className="text-xs text-zinc-500">{c.concentration}</p>
            <p className="mt-1 font-semibold tabular-nums text-zinc-800">
              {formatCalculatorNumber(result.concentrationMgPerMl, 2)} mg/mL
            </p>
          </div>
          <div className="rounded-xl border border-rose-100 bg-white/80 px-3 py-2.5">
            <p className="text-xs text-zinc-500">{c.drawVolume}</p>
            <p className="mt-1 font-semibold tabular-nums text-zinc-800">
              {formatCalculatorNumber(result.volumeMl, 3)} mL
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-rose-100 bg-white/90 p-5 shadow-sm shadow-rose-100/60">
        <SyringeVisual
          units={result.units}
          maxUnits={result.maxUnits}
          unitLabel={
            syringeType === "U100" ? c.syringeU100Short : c.syringeU50Short
          }
        />
      </div>

      <p className="text-xs leading-relaxed text-zinc-500">{c.disclaimer}</p>
    </div>
  );
}
