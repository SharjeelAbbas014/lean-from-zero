# Lean, from zero

Personal notes / a 14-day walkthrough of interactive theorem proving with Lean 4. Share a day with friends via `/day/1` … `/day/14`.

## Run locally

```bash
npm install
npm run build
npx serve out
```

For the vinext/Cloudflare-style dev server:

```bash
npm run dev
```

## Share on Netlify

Static export (`netlify.toml` → `npx next build` → `out`).

1. **Add new site → Import** `lean-from-zero`
2. Build: `npx next build`, publish: `out`
3. Deploy and share `/day/1`

**Lean editor note:** Netlify hosts the course only. The Practice tab embeds [live.lean-lang.org](https://live.lean-lang.org) (real Lean server). If the iframe fails, use **Open fullscreen**.

## How to use it

1. **Learn** — read + per-day mini-game (local drills, not a compiler).
2. **Practice** — embedded Lean lab, optional Natural Number Game / Logic Game side quests.
3. **Review** — quiz (answers saved in this browser) + reflection notes.

## Layout

- `app/course-data.ts` — chapters, labs, quizzes
- `app/play-content.ts` — mini-games, side quests, extra quiz items
- `app/LeanEditor.tsx` — iframe playground
- `app/CourseApp.tsx` — UI shell

Grounded in [Theorem Proving in Lean 4](https://leanprover.github.io/theorem_proving_in_lean4/) and related official material.
