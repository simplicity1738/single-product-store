export type CampaignTheme = "none" | "summer" | "winter" | "autumn";

export const CAMPAIGN_THEME_OPTIONS = [
  { value: "none" as const, label: "Standard (Minimalistisk)" },
  { value: "summer" as const, label: "Sommarkampanj (Blommor & Solsken)" },
  { value: "winter" as const, label: "Vinterkampanj (Snöflingor & Tomteluva)" },
];

const VALID_THEMES = new Set<CampaignTheme>(["none", "summer", "winter", "autumn"]);

export function normalizeCampaignTheme(value: unknown): CampaignTheme {
  return typeof value === "string" && VALID_THEMES.has(value as CampaignTheme)
    ? (value as CampaignTheme)
    : "summer";
}
