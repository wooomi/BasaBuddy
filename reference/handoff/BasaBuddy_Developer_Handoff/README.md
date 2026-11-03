# BasaBuddy — UI/UX and Developer Handoff (v1.1)

## Current limits and evidence
- Built using prior conversation inventory. **No current Figma inspection or editing has occurred.**
- The 18 screen labels were **previously reported**, not freshly verified. There were **no current screen PNGs** available for a pixel-perfect audit.
- The 18-level JSON is a **curriculum outline**, not a complete reviewed question bank, audio library or fully working application.
- All prototype links are **proposed**; do not label them currently connected.

## Contents
1. `BasaBuddy_Complete_UIUX_Developer_Blueprint.md` — end-to-end specification, states, privacy, architecture and data model.
2. `BasaBuddy_18_Screen_Audit.csv` — the 18 screen types and audit questions.
3. `BasaBuddy_UI_Review_Worksheet.csv` — one not-inspected row per existing screen; attach observed findings later.
4. `BasaBuddy_Prototype_Wiring.csv` — 48 proposed route / action links.
5. `BasaBuddy_Manual_Figma_Prototype_Guide.md` — exact manual Figma clicks and test instructions.
6. `BasaBuddy_18_Level_Curriculum.json` — 18-level skill objectives with separate Filipino and English examples.
7. `BasaBuddy_Level_to_Screen_Map.csv` — practical mapping from each level to reusable existing activity screen types.
8. `BasaBuddy_Content_and_Progress_Contract.ts` — typed data and sample grading / mastery functions.
9. `BasaBuddy_Validation_Test_Matrix.csv` — 45 acceptance tests, all initially marked Not run.
10. `BasaBuddy_Codex_Master_Prompt.md` — copy into Codex with this pack and real design exports.

## Suggested immediate workflow
- Export each existing 393 × 852 frame as PNG, and separately export existing icons/mascot as SVG/PNG.
- Fill the UI review worksheet **after inspecting each export**.
- Rename and connect real buttons using the Figma manual guide and wiring CSV.
- Attach source code, actual exports and pack to Codex to begin with a repo audit and component mapping.
- Author and validate a production question and audio bank in both languages before claiming curriculum is complete.

## Release cautions
- A child-friendly app must restrict child data, support guardian controls and use least-privilege role access.
- An Android native build must be tested on real Android devices; 393 × 852 is a visual reference only.
- No automatic pronunciation assessment is included in this specification.
