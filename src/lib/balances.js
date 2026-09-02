import { sharesForExpense } from "./money.js";

export function computeBalances(members, expenses) {
  const bal = {};
  // Enforce consistent numeric tracking keys safely
  for (const m of members) bal[Number(m.id)] = 0;

  for (const exp of expenses) {
    const shares = sharesForExpense(exp);
    const payerId = Number(exp.paidBy);
    
    // Credit the payer the total gross amount spent
    bal[payerId] = (bal[payerId] || 0) + Number(exp.amount);

    // Debit each consumer their individual calculated share
    for (const [id, share] of Object.entries(shares)) {
      const key = Number(id);
      bal[key] = (bal[key] || 0) - share;
    }
  }

  return bal;
}

export function totalSpent(expenses) {
  return expenses.reduce((s, e) => s + Number(e.amount), 0);
}
