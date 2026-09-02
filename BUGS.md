# Bugs found

---

## Bug 1

**How to reproduce:** Open the app. The expense list says “Newest first”. The first row is Wine (7 Mar). Board game (15 Mar) is further down.

**What is wrong:** The list is showing oldest expenses first. Newest should be at the top.

**What I changed:** Fixed the sorting comparison inside `ExpenseList.jsx` by swapping `dateValue(a.date) - dateValue(b.date)` to `dateValue(b.date) - dateValue(a.date)`. This correctly forces a descending chronological order.

---

## Bug 2

**How to reproduce:** Search for an expense (like "Uber") or select a category filter to narrow down the list. Try deleting or editing the amount of any visible item in that filtered view.

**What is wrong:** The app updates or deletes the completely wrong expense. Because the component passes the index of the *filtered* array back to the reducer, the reducer inadvertently modifies that same index position in the *global* array. We cannot rely on array indices for mutations when the list order is dynamic.

**What I changed:** Refactored the delete and update actions in `App.jsx`, `ExpenseList.jsx`, and the state reducer in `store.js` to target records using their unique, immutable `id` rather than their temporary array index.

---

## Bug 3

**How to reproduce:** Use the "Paid by" dropdown filter to look at expenses paid by a specific person.

**What is wrong:** The filter hides every single expense, showing an empty list. Native HTML `<select>` elements emit values as strings (e.g., `"1"`). However, the initial group member IDs in our data seed are stored as numbers (`1`). The strict inequality check (`!==`) fails to match them due to the mismatched data types.

**What I changed:** Updated the `onChange` handler inside `Filters.jsx` to explicitly cast string values back into numbers before sending them upstream: `onPaidBy(value === "" ? "" : Number(value))`.

---

## Bug 4

**How to reproduce:** Choose the "Custom %" split type in the form and check or uncheck different members to change who is included.

**What is wrong:** The custom percentages state resets randomly or falls out of sync. Inside `AddExpenseForm.jsx`, `setPercents` is being called inside the functional updater block of `setSplitWith`. This triggers a React state batching race condition where percentages are calculated using an uncommitted version of the members array.

**What I changed:** Separated the logic hooks. The next member state is now calculated in a local variable first, which is then used to safely and independently update both states back-to-back.

---

## Bug 5

**How to reproduce:** Choose "Custom %" and try using the backspace key to completely clear out a person's percentage input box so you can type a new number.

**What is wrong:** The input box acts buggy and fights your typing. The inline `onChange` handler runs a strict `Number(e.target.value)` on every single keystroke. Clearing the field turns the string into an empty value, which evaluates to `0` or `NaN`, breaking a normal keyboard backspace experience.

**What I changed:** Allowed the input field to accept raw string text values locally, delaying the numeric verification check until the form is submitted or the field loses focus (`onBlur`).

---

## Bug 6

**How to reproduce:** Open the app and log a brand new expense without clicking into or manually overriding the date picker.

**What is wrong:** The date field initiates with a hardcoded default string (`"2026-03-16"`). This means every single newly created expense defaults to that specific date unless the user explicitly remembers to change it.

**What I changed:** Changed the initial state value in `AddExpenseForm.jsx` to dynamically fall back to the current day using `new Date().toISOString().split('T')[0]`.

---

## Bug 7

**How to reproduce:** Create an uneven split that leaves a user with a tiny fraction of a penny outstanding (e.g., `$0.003`).

**What is wrong:** The Balances panel displays their status as `"settled up"`, even though they mathematically still owe money in the system state. The boundary logic checks look for numbers strictly greater than `0.005` or less than `-0.005`, completely missing values that sit inside that small fractional gap.

**What I changed:** Normalized the balance checks inside `BalancesPanel.jsx` by rounding the currency values to two decimal places before checking them against an absolute zero fallback (`=== 0`).

---

## Bug 8

**How to reproduce:** Look at the user initials icons rendered inside the balance ledger or expense rows.

**What is wrong:** If a member is assigned a light background color (like a pale hex code from the database seed), the white text initials become completely unreadable due to poor color contrast.

**What I changed:** Wrote a lightweight helper function that measures the brightness of the profile background color, automatically toggling the text color between dark gray and white to satisfy accessibility rules.

---

## Bug 9

**How to reproduce:** Add a few expenses, open an input field to edit an amount, and then change your search filter settings.

**What is wrong:** The local draft inputs stay open on the wrong rows, or text values get mixed up across different expenses. The code uses the array loop `index` as the React `key` property when rendering the list.

**What I changed:** Replaced `key={index}` with `key={expense.id}` in `ExpenseList.jsx` to ensure React tracks row identity accurately during sorting or filtering updates.

---

## Bug 10

**How to reproduce:** Clear out or delete expenses until everyone in the group is completely balanced.

**What is wrong:** Even when the list shows `"Everyone is settled"`, the instructional footer text permanently claims: `"After these payments, every member's net should be $0.00"`. Showing payment instructions when no payments are needed is confusing.

**What I changed:** Wrapped the text block in a conditional check so it only renders when active debts exist: `transfers.length > 0 && (...)`.

---

## Bug 11

**How to reproduce:** Use the inline form at the bottom of the Summary container to register a brand new friend.

**What is wrong:** The newly added friend completely fails to appear under the "Paid so far" ledger listing. The `useMemo` block optimized to calculate individual spending totals tracks updates to `[expenses]` but omits the `members` directory array entirely.

**What I changed:** Added `members` to the `useMemo` dependency array inside `SummaryCards.jsx` to force the cache to clear whenever the group roster changes.

---

## Bug 12

**How to reproduce:** Log an expense where the person who paid for it is completely left out of the split (for instance, if Ben paid for an Uber ride that only Aisha and Carlos took).

**What is wrong:** The final math engine breaks completely, and the total group balance fails to add up to zero. The function features an erroneous fallback condition that tries to penalize the payer by subtracting an extra share from their total if they aren't included in the split array.

**What I changed:** Deleted the incorrect `if` statement block from the bottom of the calculation loop inside `src/lib/balances.js`.

---

## Bug 13

**How to reproduce:** Open the app, log a few expenses, and then press refresh on your browser tab.

**What is wrong:** The app layout breaks, sorting stops working, and dates turn into raw unformatted text strings. When saving state, `JSON.stringify` converts real JavaScript `Date` instances into simple strings. Upon reload, `JSON.parse` does not restore them as Date objects.

**What I changed:** Updated the `loadState` initialization process inside `store.js` to explicitly map over the cached expenses array and re-hydrate text strings back into real native `Date` objects.

---

## Bug 14

**How to reproduce:** Log a `$100.00` expense split equally between three people.

**What is wrong:** A penny vanishes from the system ledger. The `splitEqual` logic rounds each user's share to two decimal places upfront (`$33.33`). Multiplying this across three people totals `$99.99`, creating an accounting discrepancy.

**What I changed:** Refactored the math loop inside `money.js` so that the final person in the split array automatically absorbs the rounding remainder: `totalAmount - (baseShare * (totalMembers - 1))`.

---

## Bug 15

**How to reproduce:** Try to save a custom percentage split where three people divide an item by `33.33%`, `33.33%`, and `33.34%`.

**What is wrong:** The form blocks you from saving and displays a validation error claiming the percentages do not equal 100. Standard binary floating-point precision errors cause the sum to evaluate to `100.00000000000001` in JavaScript, failing a strict `=== 100` check.

**What I changed:** Swapped out the strict check inside `money.js` for an epsilon tolerance threshold check: `Math.abs(sum - 100) < 0.001`.

---

## Bug 16

**How to reproduce:** Check the "Settle up" list when a debtor owes the exact same amount that a creditor is owed.

**What is wrong:** The payment disappears from the list entirely, leaving the group unsettled. Inside the debt matching loop in `settle.js`, the equal fallback branch increments loop pointers without actually pushing the transaction into the transfers results array.

**What I changed:** Added the missing array push statement inside the equal branch of the lookup loop before the pointers advance.

---
## Bug 17

**How to reproduce:** Review the final transfer details displayed inside the "Settle up" panel.

**What is wrong:** The UI displays unformatted, broken placeholder text like `#1` instead of actual user names. JavaScript's `Object.entries(balances)` automatically converts object keys into strings, which causes our strict name lookup comparison (`m.id === id`) to fail.

**What I changed:** Fixed the internal `nameOf` helper logic inside `settle.js` by casting both values to numbers before comparing them: `Number(m.id) === Number(id)`.

---

## Bug 18

**How to reproduce:** Add a new user to the group roster and log a payment under their name.

**What is wrong:** The user avatar layout renders as empty or grayed out. The state reducer configuration block for `ADD_MEMBER` skips merging style assets or hex color strings when updating the global state object.

**What I changed:** Updated the state reducer within `store.js` to ensure generated colors are properly merged and preserved during the member creation step.

---

## Bug 19

**How to reproduce:** Type a search filter into the query box to isolate a single expense, and observe the summary dashboard cards on the right.

**What is wrong:** The summary panel information continues to display global trip metrics instead of updating to reflect the active filters on screen.

**What I changed:** Connected the right-hand metrics panels in `App.jsx` to track the dynamic filtered dataset rather than defaulting to the global unfiltered array.

---

## Bug 20

**How to reproduce:** Boot up the application locally and inspect your browser developer console.

**What is wrong:** Hooks and data operations double-fire during initialization because `React.StrictMode` mounts components twice in development to flag side effects. This can cause sync warnings if data operations run eagerly outside lifecycle hooks.

**What I changed:** Relocated the eager local storage loading logic out of the immediate component rendering path into a dedicated `useEffect` block.

---

## Bug 21

**How to reproduce:** Open the application on a smaller tablet device or resize your browser window.

**What is wrong:** The inline editing action layout columns wrap poorly or misalign with the static right-hand currency columns.

**What I changed:** Cleaned up the `.actions` container layouts inside `index.css` by switching the alignment properties to use a standard left margin flow.

---

## Bug 22

**How to reproduce:** Click into an expense row amount box and enter a large figure (e.g., $2,500.00).

**What is wrong:** The text gets clipped and looks cut off. The style rule enforces a rigid fixed width configuration of `88px`, which doesn't leave enough horizontal room once text paddings are factored in.

**What I changed:** Swapped out the fixed width value in `index.css` for a responsive minimum width rule: `min-width: 110px; width: auto;`.

---

## Bug 23

**How to reproduce:** Try launching the project development server while another frontend app is running locally on your computer.

**What is wrong:** The server crashes immediately. The configuration forces a hardcoded port allocation on `5173` without enabling fallbacks.

**What I changed:** Updated `vite.config.js` to set `strictPort: false` so Vite can dynamically find the next available port if `5173` is busy.

---

## Bug 24

**How to reproduce:** Run `git status` after making code updates or opening the project directory inside an editor like VS Code or WebStorm.

**What is wrong:** Local workspace configuration directories (like `.vscode/` or `.idea/`) leak into your tracking logs, polluting the repository.

**What I changed:** Appended standard code editor build artifact and configuration paths to the bottom of the `.gitignore` exclusions list.

---

## Bug 25

**How to reproduce:** Launch the application root index file while disconnected from the internet.

**What is wrong:** The headings look plain and default back to standard system fonts because the application is missing its font asset declarations.

**What I changed:** Embedded the missing web font link declarations directly into the `<head>` metadata layer of `index.html`.

---

## Bug 26

**How to reproduce:** Modify or append a field inside `seed.json` while an existing session is cached inside your browser storage.

**What is wrong:** The UI ignores your file updates entirely. The state hydration engine defaults blindly to reading whatever old string is saved in local storage, ignoring code changes to the underlying file.

**What I changed:** Added a schema version tracking attribute to the storage logic to automatically wipe old local cache data if the source dataset changes.

---

## Bug 27

**How to reproduce:** Inspect the order of the items in the expenses array inside `seed.json`.

**What is wrong:** The transactions are entered completely out of chronological order. When front-end list filters apply sorting methods, it creates structural index shifts.

**What I changed:** Reordered the records chronologically inside `seed.json` to keep the data structured predictably.

---

## Bug 28

**How to reproduce:** Compare the identification data types used across different collections inside `seed.json`.

**What is wrong:** Member profiles use standard numeric integers for IDs, while individual expenses map percentage splits using string keys (`"1"`). This inconsistent formatting breaks strict equality checks down the line.

**What I changed:** Standardized object keys to use consistent numeric formats across both schemas.

---

## Bug 29

**How to reproduce:** Compare dates across older seed transactions and freshly logged form items in the main feed.

**What is wrong:** The entries look visually mismatched. Seed records render as plain ISO text strings, while form items render as localized regional string layouts.

**What I changed:** Normalized all incoming entries to true native date structures inside `format.js` before executing localized text transformations.

---

## Bug 30

**How to reproduce:** Open the application and look at the order of the expense feed list rows.

**What is wrong:** The chronological sorting logic fails silently, leaving your transactions out of order. The `dateValue` utility function simply returns raw values, so subtracting strings or mixed date instances returns `NaN`.

**What I changed:** Updated `dateValue` inside `format.js` to parse all incoming parameters into absolute epoch millisecond timestamps: `return new Date(date).getTime();`.

---

## Bug 31

**How to reproduce:** Select the "Anyone" choice inside the user filter dropdown tool menu.

**What is wrong:** The filter logic drops records because it tries to pass an empty string to a strict inequality matcher.

**What I changed:** Added a protective conditional check to the filter wrapper inside `App.jsx` to safely handle empty string filters.

---

## Bug 32

**How to reproduce:** Add a new group member to a trip that already has several logged expenses, and look at the "Avg / person" card.

**What is wrong:** The calculated average drops instantly and becomes incorrect. The logic divides the total group spend by the new number of members, even though the new member wasn't part of those past expenses.

**What I changed:** Updated the summary calculation logic inside `SummaryCards.jsx` to calculate individual member averages based on their actual expense shares instead of the global group size.

---

## Bug 33

**How to reproduce:** Look at the static description text inside the main header container.

**What is wrong:** The topbar claims the app is tracking "Shared expenses for four friends". This layout text becomes incorrect as soon as you add a fifth or sixth member to the group roster.

**What I changed:** Swapped out the static hardcoded header description string in `App.jsx` for a dynamic template literal that updates automatically: `` `Shared expenses for ${state.members.length} friends.` ``.