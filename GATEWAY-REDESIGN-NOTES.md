# Pulsar Access Gateway — Sliding Split-Card Redesign (2026-10-24)

## What changed (presentation only)

`src/components/SignInPage.tsx` was rebuilt and a new stylesheet
`src/styles/signin-gateway.css` added. No server code, no `src/services/api.ts`
contracts, no `src/firebase.ts` behaviour, and no `AuthGate` logic were touched.

Design (from the founder's "React Logins" reference screenshots):

- Centred card, `min(980px, 94vw)`, 28px radius, subtle frame ring + soft shadow,
  on Pulsar's first-theme page background (cream/sage `#F3F5EC → #E9EDE0` gradient,
  deep-ink variant in dark mode).
- A deep forest-green **hero panel** (50% width, inset 10px, 20px radius) that
  **slides left ↔ right with a 0.65s ease-in-out transition** when switching
  between Sign In and Request Access; the two form panels cross-fade/slide on the
  opposite side. On narrow screens (<900px) the hero becomes a top banner and
  only the active form shows.
- Hero artwork is pure CSS + inline SVG — layered mountain-ridge silhouettes over
  a `#0E4A2C → #0B3D24 → #062315` gradient sky, a soft moon glow, and star dots.
  No external images. Hero content cross-fades: "Hello there / Begin your
  journey using Pulsar…" with a ghost **Request Access** button in sign-in mode;
  "Welcome back / Login to review your latest pipeline, calls, and growth." with
  a ghost **Sign In** button in request mode.
- Forms: soft filled inputs (`#F0F3EC`, 12px radius, green `#0B5D3B` focus ring),
  labels above inputs, deep-green primary button. Fonts unchanged (the project
  has no Nunito; existing Outfit display + Plus Jakarta Sans stack kept).
- Small text-link toggles under each form ("New to Pulsar? Request access" /
  "Already have an account? Sign in" / "Back to Sign In") alongside the hero
  switch buttons; the hidden panel is `inert` + `visibility:hidden` so it stays
  out of the tab order.

## Functionality preserved exactly

- Sign In: Work Email + Password, show/hide password, **Remember this
  workstation** (default on) wired to `signInWithEmail(email, pass, remember)`
  Firebase persistence, **Continue with Google** (same popup handler), and the
  **Forgot password?** flow with its reset success copy and Back to Sign In.
- Request Access: Full Name / Title, Work Email, Organization, Requested Plan
  select (Trial/Starter/Growth with the same descriptors + the administrator
  review hint), Password (≥8) + Confirm Password with hints, and the required
  Terms/Privacy checkbox with the "accounts require administrator approval"
  wording. Submit still runs `signUpWithEmail` then the never-throwing
  `submitAccessRequest()` (localStorage stash `pulsar_access_request_<uid>` on
  API failure; AuthGate pending-screen retry untouched), and shows the same
  pending-approval success copy.
- All validation and Firebase error-message mappings are byte-identical to the
  previous component; the shared email/password state carries across the slide.
- Duplicate form-field IDs avoided: the request panel uses `email-signup` /
  `password-signup` ids since both panels are mounted during the slide.

## Verification

- `npx tsc --noEmit` — clean.
- `npm test` — **88/88 pass**.
- `npm run build` — OK.
- `python3 tests-access-gateway.py` — **13/13 pass**.
- Push: repo head verified before pushing (SignInPage.tsx blob
  `31899c697c63459be3210cdd179e7a9632ab44de` matched staging; head commit
  `0e98b056e00eca12b997a8ab1cc3304adb90e148` matched the sync record).
- Commit + live verification: recorded below after the push.

## Deviations

- Nunito was not available in the project, so the existing font stack was kept
  (per the task's fallback instruction).
- The old in-card tab switcher was replaced by the hero switch buttons plus the
  small text-link toggles (the design's switching affordances).
- The Google button + "Or with email" divider now render in both panels (they
  were previously above the single shared form) so each mode keeps the exact
  same Google behaviour after the slide.
