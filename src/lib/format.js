export function formatDate(date) {
  const d = date instanceof Date ? date : new Date(date);
  if (!Number.isNaN(d.getTime())) {
    return d.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }
  return typeof date === "string" ? date.slice(0, 10) : String(date);
}

export function dateValue(date) {
  // FIXED: Standardizes sorting calculations by parsing all parameters to a number
  const d = date instanceof Date ? date : new Date(date);
  return Number.isNaN(d.getTime()) ? 0 : d.getTime();
}
