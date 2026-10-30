# Pulsar 2.0 port, behind existing screens only (2026-10-30, staging only, NOT pushed, NOT live)

## Hard look rule, how it was kept

No file under src/ was changed in this port. App.tsx, types.ts,
SpatialSidebar.tsx, and index.css are byte identical to GitHub
mirzasahab128/Pulsar-2.0 main (head 02423266). No new sidebar item, tab,
page, button, menu label, colour, or copy change was added. No Consent
Gates, After-call, Owner dashboard, Lead prep, or Billing visible menu
items were added. No copy rewire was done: the existing chatbot name and
industry wording are untouched.

## What was already in staging before this port

Staging already contained Phase 7.1 to 7.4 server modules (contactGate,
voiceAgent, afterCall, ownerDashboard), their server routes, client
methods, and an Outreach Gates tab inside the existing Admin Command
Center. Those files are dated 2026-10-28 in staging and are NOT in the
GitHub head, which is why staging differs from GitHub there. This port
did not add that tab and did not change it.

## What this port added (server only, master-admin routes only)

New server modules, copied from 3.0 and adapted only in header comments:
server/billing.ts, server/leadVerification.ts, server/companyResearch.ts,
server/signalMonitor.ts, server/places.ts, server/retellVoice.ts.
Changed: server/platform.ts (billing and leadPrep state plus migration),
server.ts (master-admin routes only). New tests: tests/billing.test.ts,
tests/leadVerification.test.ts, tests/companyResearch.test.ts,
tests/signalMonitor.test.ts, tests/places.test.ts, tests/retellVoice.test.ts.
No src file was changed, so the new functions below have no visible
control in 2.0. They are reachable only through the master-admin API
routes listed, or are server-only modules.

## Reachability, function by function

- Phase 7.1 consent ledger and suppression: reachable behind the existing
  Admin Command Center Outreach Gates tab (pre-existing staging tab, not
  added here), plus server routes /api/admin/phase71/*.
- Phase 7.2 voice brain: server-only logic in server/voiceAgent.ts
  (disclosure, recording notice, objection answers, live handoff logic).
  No visible control was added, and no live call route was added.
- Phase 7.3 after-call: reachable behind the existing Admin Command
  Center Outreach Gates tab (pre-existing staging tab), plus server
  routes /api/admin/phase73/* and phase74 actions. Draft follow-ups are
  draft only, never sent.
- Phase 7.4 owner dashboard logic: reachable behind the existing Admin
  Command Center Outreach Gates tab (pre-existing staging tab), plus
  server routes /api/admin/phase74/*.
- Lead prep email checks: server-only API, POST /api/admin/lead-prep/
  email-check, shape only, verdict needs_live_check without a live
  service, no invented score.
- Lead prep company briefs: server-only API, POST /api/admin/lead-prep/
  company-brief, from user-supplied text only, nothing fetched.
- Signal watchlist: server-only API, POST /api/admin/lead-prep/watch and
  /signal. Excluded sources (private messages, DMs, de-anonymising,
  bulk social surveillance, scraping) are rejected. A signal never
  authorises contact on its own.
- Google Places search: server-only API, POST /api/admin/lead-prep/
  places-search. Industry plus place required, 20 per search, aggregate
  rating and count only, dedupe, missing fields stay missing, drafts
  marked not verified, key only from server environment
  GOOGLE_PLACES_API_KEY, fail closed with no key, no live call made here.
- Retell voice adapter: server-only module server/retellVoice.ts, no
  route and no visible control. Key, phone number, and agent ID only
  from server environment, all three required or it refuses to start.
  Honest limits from 3.0 still apply: a recorded script line is not
  proof a prospect heard it live, and webhook wiring for a full live
  call is not built.
- Billing, test mode only: server-only API, /api/admin/billing/* (trial,
  select-plan, renew, cancel at period end, manual payment recording,
  lead use, test checkout). Nothing charges a card, no card details are
  stored, calling add-on price is not set so calling is never charged.

## Verification in staging

- Tests: 184 passed, 0 failed, 46 suites (new port tests: billing 9,
  lead verification 4, company research 2, signal monitor 3, Places 10,
  Retell 7, plus pre-existing suites).
- Type check: 4 errors only, all pre-existing, all in stray duplicate
  files src/SpatialSidebar.tsx and src/CalendarView.tsx that import
  ../types, ../context/ThemeContext, and ../services/api, which do not
  exist at that path. Those files were not touched in this port, and
  App.tsx imports the components version, not the stray copy. No error
  is in any file changed by this port.
- Client build: passed after a local no-save install of react-is, which
  recharts requires and which was missing from the staging install.
  package.json was not changed. Before that install, the build failed
  on the missing react-is import, a pre-existing dependency gap, not a
  port failure. dist/ is git-ignored and is not for push.
- No em dashes in the new server files (checked by grep).
- No src file changed, so no look, menu, copy, or colour change was
  introduced by this port.

## Deliberately left out, and why

- No client methods for billing or lead prep were added to
  src/services/api.ts, and no UI was added to any screen, because the
  hard look rule forbids a visible control for these functions. Adding
  dead client methods with no screen would not have made them usable.
- No live Places call, no live Retell call, no phone number purchase,
  no payment provider, no publishing, and no push or deploy, per task.
- No copy rewire, no new menu items, and no 3.0 pages (Consent Gates
  page, After-call page, Owner dashboard page, Lead prep page, Billing
  page) were ported as pages, because those are 3.0-only visible pages.
- HTTP route tests were not run (they need a Firebase token stub and a
  live test server, same limit as in 3.0). Routes are type-checked and
  the logic they call is unit-tested.
