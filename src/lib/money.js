export function formatMoney(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n)) return "$0.00";
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export function splitEqual(amount, ids) {
  if (!ids.length) return {};
  const n = ids.length;
  
  // Calculate the standard base share truncated down to two decimal places
  const baseShare = Math.floor((amount / n) * 100) / 100;
  
  // Track remaining dust/pennies precisely
  const totalAllocated = baseShare * n;
  const remainder = Math.round((amount - totalAllocated) * 100) / 100;
  
  const shares = {};
  ids.forEach((id, index) => {
    // The very last participant absorbs any leftover rounding pennies to balance cleanly
    shares[id] = index === n - 1 ? Math.round((baseShare + remainder) * 100) / 100 : baseShare;
  });
  
  return shares;
}

export function percentsSumTo100(percents) {
  const values = Object.values(percents).map(Number);
  const sum = values.reduce((a, b) => a + b, 0);
  // Replaced strict check with an epsilon tolerance threshold check
  return Math.abs(sum - 100) < 0.01;
}

export function splitByPercent(amount, percents) {
  const shares = {};
  for (const [id, pct] of Object.entries(percents)) {
    shares[id] = Number(((amount * Number(pct)) / 100).toFixed(2));
  }
  return shares;
}

export function sharesForExpense(expense) {
  if (expense.splitType === "percent" && expense.percents) {
    return splitByPercent(expense.amount, expense.percents);
  }
  return splitEqual(expense.amount, expense.splitWith);
}
