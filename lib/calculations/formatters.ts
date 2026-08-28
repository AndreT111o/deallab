export function formatCurrencyM(value: number, currency = "€"): string {
  if (!Number.isFinite(value)) return "N/A";
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return `${value < 0 ? "-" : ""}${currency}${(abs / 1000).toFixed(1)}bn`;
  }
  return `${value < 0 ? "-" : ""}${currency}${abs.toFixed(0)}m`;
}

export function formatPercent(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "N/A";
  return `${(value * 100).toFixed(decimals)}%`;
}

export function formatMultiple(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "N/A";
  return `${value.toFixed(decimals)}x`;
}

export function formatPrice(value: number, currency = "€"): string {
  if (!Number.isFinite(value)) return "N/A";
  return `${currency}${value.toFixed(2)}`;
}

export function formatSignedPercent(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return "N/A";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(decimals)}%`;
}
