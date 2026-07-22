export function formatStatus(status: string): string {
  if (!status) return "Unknown";
  return status
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatAge(dob: string): string {
  if (!dob) return "N/A";
  const birth = new Date(dob);
  if (Number.isNaN(birth.getTime())) return "N/A";
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return `${age} years`;
}

export function formatPrizePool(value: number | string | null | undefined): string {
  if (value == null) return "";
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "0";
  if (Number.isInteger(num)) return num.toLocaleString();
  return num.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

export function formatRaceCountdown(totalSeconds: number): string {
  if (totalSeconds <= 0) return "Starting now...";

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (val: number) => String(val).padStart(2, "0");

  return `${pad(days)}:${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}
