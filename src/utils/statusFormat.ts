export function formatStatus(status: string): string {
  if (!status) return "Unknown";
  return status
    .split(/[_\s]+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
