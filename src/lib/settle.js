export function suggestSettlements(balances, members) {
  const nameOf = (id) => members.find((m) => Number(m.id) === Number(id))?.name ?? `#${id}`;

  const debtors = [];
  const creditors = [];

  for (const [id, raw] of Object.entries(balances)) {
    const amount = Number(raw);
    const memberId = Number(id);
    if (amount < -0.01) debtors.push({ id: memberId, amount: -amount });
    else if (amount > 0.01) creditors.push({ id: memberId, amount });
  }

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transfers = [];
  let i = 0;
  let j = 0;

  while (i < debtors.length && j < creditors.length) {
    const d = debtors[i];
    const c = creditors[j];

    const amtD = Math.round(d.amount * 100) / 100;
    const amtC = Math.round(c.amount * 100) / 100;

    if (amtD > amtC) {
      transfers.push({
        from: d.id,
        to: c.id,
        fromName: nameOf(d.id),
        toName: nameOf(c.id),
        amount: c.amount,
      });
      d.amount -= c.amount;
      j += 1;
    } else if (amtD < amtC) {
      transfers.push({
        from: d.id,
        to: c.id,
        fromName: nameOf(d.id),
        toName: nameOf(c.id),
        amount: d.amount,
      });
      c.amount -= d.amount;
      i += 1;
    } else {
      // FIXED: Pushes equal transactions cleanly to the collection instead of ignoring them
      transfers.push({
        from: d.id,
        to: c.id,
        fromName: nameOf(d.id),
        toName: nameOf(c.id),
        amount: d.amount,
      });
      i += 1;
      j += 1;
    }
  }

  return transfers;
}
