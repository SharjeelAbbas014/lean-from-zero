# Lean, from zero

Personal notes / a 14-day walkthrough of interactive theorem proving with Lean 4. Share a day with friends via `/day/1` … `/day/14`.

## Run locally

```bash
npm install
npm run dev
```

## How to use it

1. Start at the course map, or jump straight to a day URL.
2. Read **Learn**, try the lab in the [Lean web editor](https://live.lean-lang.org/).
3. Use **Review** for retrieval + quiz. Progress is stored in this browser only.

## Layout

- `app/course-data.ts` — day chapters, labs, quizzes
- `app/deep-dives-*.ts` — longer supplements per day
- `app/CourseApp.tsx` — UI shell

Grounded in [Theorem Proving in Lean 4](https://leanprover.github.io/theorem_proving_in_lean4/) and related official material.
