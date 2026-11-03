# BasaBuddy

A local, mobile-first Filipino–English reading MVP built with React, TypeScript, Vite and Tailwind CSS. Original generated storybook artwork and retained illustration regions from the supplied Figma exports are used as assets; screens, controls, text, feedback and navigation are editable React components.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:5173. Start → Student → create a nickname → choose Filipino or English. Parent and Teacher use a separate local adult PIN. The first adult visit creates the PIN; later visits require it. This is a device-local gate, **not production authentication**.

```sh
npm run build
npm run preview
npm test
npx playwright install chromium
npm run test:e2e
```

## Implemented

- Onboarding, role choice, learner profiles, language choice, home, six learning worlds and 18 sequential levels per language.
- 180 independently identified draft assessment items (five per level per language), guided practice, answer feedback, results, 4/5 mastery, next-level unlock, replay, persistent best scores and rewards.
- Syllable/phoneme tile practice, word reading, Listen and Repeat, optional record/replay, Read Aloud, picture dictionary, Find the Word, Sentence Builder, Story Reading and comprehension checks.
- Daily three-step reading quest; per-learner, per-language, per-local-date completion; reading journey and earned world milestones.
- localStorage repository with versioned data, save-error and corrupt-data recovery, persisted lesson step, selected answer, submitted answers and result. Refresh resumes the exact saved step. Every selection is saved, so leaving does not discard an answer.
- Separate student, parent and teacher routes. Parent: local profiles, reports, export, deletion. Teacher: local learner overview, actual reports, assign/remove reading work. Assignment cards appear on the learner home screen and do not bypass prerequisites.
- Browser speech synthesis with locale checking and readable fallback; optional microphone recording with permission errors, 30-second limit, playback and cleanup. Recordings are only in tab memory and are never uploaded.
- Responsive layouts, keyboard focus styling, labeled controls, reduced motion, empty/loading/success/error/locked/offline states.

## Important MVP boundaries

The supplied curriculum JSON is explicitly an **outline**, not a reviewed content/audio library. All authored questions in `src/content/lessons.ts` are marked `draft`; do not describe this build as a reviewed school curriculum. A Filipino/English reading teacher must review each item, syllabification, difficulty, phoneme model, distractor and assessment before a child-facing production launch. The 4/5 threshold comes from the handoff and is provisional.

No prerecorded narration was supplied. Browser TTS is a functional fallback, not a validated phonics model. Some devices have no Filipino voice. In that case the app offers reading/adult support instead of using an incorrect-language voice. Single-letter TTS can say letter names rather than phonemes; recorded sound models are still required for production. Microphone input is never automatically graded.

Cloud auth, Supabase, guardian links, verified teacher rosters, server-side authorization/RLS and multi-device sync are **not implemented**. The adult PIN and local roles do not protect data from someone with browser developer tools. All adults sharing the PIN can access this browser’s local learners. Do not use this MVP with real school records.

The app works with already-loaded content when disconnected; cold-start offline installation/PWA caching is not implemented. Browser storage can be cleared or evicted. Export learner data before clearing it. Imports/backups restoration and PIN recovery are not implemented.

The dictionary has the six animal images and apple supplied in the exports. The Things category has an explicit empty state rather than invented illustrations. Reward badges are calculated from mastery and cannot be farmed by retrying completed lessons.

## Netlify

`netlify.toml` contains build (`npm run build`), publish directory (`dist`) and SPA route fallback. Set the Netlify Node version to **22.12 or newer** (development used Node 26). Publish the repository or upload `dist` after building. No secrets or environment variables are required for this local MVP. This task did not publish a live website.

## Structure

- `src/app/` — role screens, learning flow and state provider
- `src/components/` — shared design, audio and recorder components
- `src/content/lessons.ts` — bilingual draft question bank, titles, dictionary, validation
- `src/data/BasaBuddy_18_Level_Curriculum.json` — original supplied 18-level outline
- `src/data/repository.ts` — persistence adapter boundary
- `src/domain/model.ts` — scoring, attempts and unlocking
- `public/assets/` — original illustration crops, no screenshot screens
- `reference/` — untouched extracted handoff and all nine supplied PNG boards
- `tests/` — Playwright flows and screenshots
- `docs/IMPLEMENTATION_NOTES.md` — design decisions and scope assumptions
- `docs/VALIDATION.md` — executed checks and outstanding verification

To add Supabase, implement the repository interface and move identity/role/roster enforcement server-side. The current progress keys are `studentId:language:levelId`. Preserve best-score monotonicity and atomic mastery/attempt updates in the backend. A local PIN must never become a cloud credential or authorization rule.

## Child-friendly refresh

See `docs/CHILD_FRIENDLY_REFRESH.md` for the sound controls, visual refresh, verification and remaining voice limitations, and `docs/IMAGE_PROMPTS.md` for generated asset provenance and prompts.
