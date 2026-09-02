const KEY = "fairshare-v1";

function hydrate(data) {
  return {
    groupName: data.groupName,
    members: data.members.map((m) => ({ ...m, id: Number(m.id) })),
    expenses: data.expenses.map((e) => ({
      ...e,
      id: String(e.id),
      paidBy: Number(e.paidBy),
      splitWith: e.splitWith.map(Number),
      date: new Date(e.date),
    })),
  };
}

export function loadState(seed) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const initial = hydrate(seed);
      localStorage.setItem(KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    
    // FIXED: Enforce date object re-hydration on local storage page reloads
    parsed.expenses = parsed.expenses.map((e) => ({
      ...e,
      id: String(e.id),
      paidBy: Number(e.paidBy),
      splitWith: e.splitWith.map(Number),
      date: new Date(e.date),
    }));
    
    // Normalize member IDs to numbers
    parsed.members = parsed.members.map((m) => ({ ...m, id: Number(m.id) }));
    
    return parsed;
  } catch {
    return hydrate(seed);
  }
}

export function persistState(state) {
  localStorage.setItem(KEY, JSON.stringify(state));
}

export function nextExpenseId() {
  return `e-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function nextMemberId(members) {
  const max = members.reduce((m, x) => (Number(x.id) > m ? Number(x.id) : m), 0);
  return max + 1;
}

export function reducer(state, action) {
  switch (action.type) {
    case "ADD_EXPENSE": {
      return { ...state, expenses: [...state.expenses, action.expense] };
    }
    case "DELETE_EXPENSE": {
      // FIXED: Safely targets mutations using immutable element IDs
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.id),
      };
    }
    case "UPDATE_EXPENSE": {
      // FIXED: Safely applies structural edits using immutable element IDs
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === action.id ? { ...e, ...action.patch } : e
        ),
      };
    }
    case "ADD_MEMBER": {
      return { ...state, members: [...state.members, action.member] };
    }
    default:
      return state;
  }
}
