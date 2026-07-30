"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { courseDays, glossary, sources, type CourseDay } from "./course-data";
import { deepDiveByDay } from "./deep-dives";
import type { DeepDiveChapter } from "./deep-dive-types";

type View = "overview" | "lesson" | "glossary";
type LessonTab = "learn" | "practice" | "review";

const STORAGE_KEY = "lean-field-guide-progress-v1";

function parseRoute(pathname: string): { view: View; day: number } {
  if (pathname === "/glossary" || pathname.startsWith("/glossary/")) {
    return { view: "glossary", day: 1 };
  }

  const dayMatch = pathname.match(/^\/day\/(\d+)\/?$/);
  if (dayMatch) {
    const day = Number(dayMatch[1]);
    if (Number.isInteger(day) && day >= 1 && day <= courseDays.length) {
      return { view: "lesson", day };
    }
  }

  return { view: "overview", day: 1 };
}

function CodeBlock({ code, note }: { code: string; note?: string }) {
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div className="code-wrap">
      <div className="code-bar">
        <span>Lean 4</span>
        <button type="button" onClick={copyCode} aria-label="Copy Lean code">
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
      {note && <p className="code-note">{note}</p>}
    </div>
  );
}

function ConceptDiagram({
  kind,
  items,
}: {
  kind: "pipeline" | "proof" | "types" | "induction";
  items: string[];
}) {
  return (
    <figure className={`concept-diagram ${kind}`} aria-label={`${kind} concept diagram`}>
      <div className="diagram-track">
        {items.map((item, index) => (
          <div className="diagram-step" key={item}>
            <span className="step-number">{String(index + 1).padStart(2, "0")}</span>
            <strong>{item}</strong>
          </div>
        ))}
      </div>
      <figcaption>
        {kind === "induction"
          ? "Each step is justified by the structure beneath it."
          : "Follow the idea from left to right."}
      </figcaption>
    </figure>
  );
}

function DeepDiveBook({ chapter }: { chapter: DeepDiveChapter }) {
  return (
    <section className="deep-book" aria-labelledby={`deep-book-${chapter.day}`}>
      <header className="deep-book-header">
        <span className="eyebrow">The full chapter</span>
        <h2 id={`deep-book-${chapter.day}`}>Slow down. Build the mental model.</h2>
        <div className="deep-opening">
          {chapter.opening.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
        </div>
        <div className="prerequisite-strip">
          <strong>Ideas we are reusing</strong>
          <div>
            {chapter.prerequisites.map((item) => <span key={item}>{item}</span>)}
          </div>
        </div>
      </header>

      {chapter.topics.map((topic, topicIndex) => (
        <article className="deep-topic" key={topic.title}>
          <div className="deep-topic-number">
            DEEP DIVE {String(topicIndex + 1).padStart(2, "0")}
          </div>
          <h3>{topic.title}</h3>
          <p className="guiding-question">{topic.question}</p>

          <div className="why-card">
            <span>Why this matters</span>
            <p>{topic.whyItMatters}</p>
          </div>

          <div className="deep-prose">
            {topic.explanation.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>

          <aside className="analogy-card">
            <div>
              <span className="eyebrow">Mental model</span>
              <h4>{topic.analogy.title}</h4>
              <p>{topic.analogy.body}</p>
            </div>
            <div className="analogy-limit">
              <strong>Where the analogy stops</strong>
              <p>{topic.analogy.limit}</p>
            </div>
          </aside>

          <section className="worked-example">
            <span className="eyebrow">Worked example · one move at a time</span>
            <h4>{topic.workedExample.title}</h4>
            <p>{topic.workedExample.setup}</p>
            <CodeBlock code={topic.workedExample.code} />
            <ol className="worked-steps">
              {topic.workedExample.steps.map((step, stepIndex) => (
                <li key={`${step.label}-${stepIndex}`}>
                  <span>{String(stepIndex + 1).padStart(2, "0")}</span>
                  <div>
                    <strong>{step.label}</strong>
                    <p>{step.explanation}</p>
                    {step.proofState && (
                      <pre className="mini-proof-state"><code>{step.proofState}</code></pre>
                    )}
                  </div>
                </li>
              ))}
            </ol>
            <p className="worked-conclusion">
              <strong>What just happened:</strong> {topic.workedExample.conclusion}
            </p>
          </section>

          <section className="mistake-clinic">
            <div className="subsection-heading">
              <span className="eyebrow">Mistake clinic</span>
              <h4>Three ways this idea commonly goes wrong.</h4>
            </div>
            <div className="mistake-grid">
              {topic.commonMistakes.map((item, mistakeIndex) => (
                <article key={item.mistake}>
                  <span>{String(mistakeIndex + 1).padStart(2, "0")}</span>
                  <h5>{item.mistake}</h5>
                  <p><strong>Why:</strong> {item.why}</p>
                  <p><strong>Repair:</strong> {item.repair}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="self-checks">
            <div className="subsection-heading">
              <span className="eyebrow">Stop and retrieve</span>
              <h4>Answer before you reveal.</h4>
            </div>
            {topic.selfCheck.map((check, checkIndex) => (
              <details key={check.prompt}>
                <summary>
                  <span>{String(checkIndex + 1).padStart(2, "0")}</span>
                  {check.prompt}
                </summary>
                <p>{check.answer}</p>
              </details>
            ))}
          </section>
        </article>
      ))}

      <footer className="deep-closing">
        <span className="eyebrow">Close the book for five minutes</span>
        <h3>Questions worth answering from memory</h3>
        <ol>
          {chapter.closingQuestions.map((question) => <li key={question}>{question}</li>)}
        </ol>
      </footer>
    </section>
  );
}

function ProofSimulator() {
  const [step, setStep] = useState(0);
  const [message, setMessage] = useState("Choose the move that matches the outer shape of the goal.");

  const states = [
    { context: ["P : Prop"], goal: "P → P" },
    { context: ["P : Prop", "h : P"], goal: "P" },
    { context: ["P : Prop", "h : P"], goal: "No goals. Proof complete." },
  ];

  function choose(choice: string) {
    if (step === 0 && choice === "intro h") {
      setStep(1);
      setMessage("Correct. intro assumes the left side of the arrow and names that evidence h.");
      return;
    }

    if (step === 1 && choice === "exact h") {
      setStep(2);
      setMessage("Complete. The goal asks for P, and h is evidence of exactly P.");
      return;
    }

    setMessage(
      choice === "rfl"
        ? "rfl is for equalities that reduce to the same expression. This goal is not an equality."
        : "That move does not fit this goal yet. Read the goal’s outermost symbol first.",
    );
  }

  return (
    <section className="simulator" aria-labelledby="simulator-title">
      <div className="simulator-copy">
        <span className="eyebrow">Learning simulator</span>
        <h3 id="simulator-title">Watch a proof state change</h3>
        <p>
          This models common Lean moves; it is not a Lean compiler. Predict the new goal before
          pressing a tactic.
        </p>
        <CodeBlock code={`example (P : Prop) : P → P := by\n  ?`} />
      </div>
      <div className="proof-workbench">
        <div className="state-panel">
          <span>Context</span>
          {states[step].context.map((line) => (
            <code key={line}>{line}</code>
          ))}
        </div>
        <div className="turnstile" aria-hidden="true">⊢</div>
        <div className="state-panel goal-panel">
          <span>Goal</span>
          <code>{states[step].goal}</code>
        </div>
        <div className="tactic-choices" aria-label="Available tactics">
          {step < 2 ? (
            (step === 0 ? ["intro h", "rfl", "constructor"] : ["exact h", "rfl", "intro q"]).map(
              (choice) => (
                <button type="button" key={choice} onClick={() => choose(choice)}>
                  {choice}
                </button>
              ),
            )
          ) : (
            <button
              type="button"
              onClick={() => {
                setStep(0);
                setMessage("Choose the move that matches the outer shape of the goal.");
              }}
            >
              Try again
            </button>
          )}
        </div>
        <p className={step === 2 ? "sim-feedback success" : "sim-feedback"} aria-live="polite">
          {message}
        </p>
      </div>
    </section>
  );
}

function Quiz({
  day,
  onMastered,
}: {
  day: CourseDay;
  onMastered: () => void;
}) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const hasRecordedMastery = useRef(false);
  const answeredCount = Object.keys(answers).length;
  const correctCount = day.quiz.reduce(
    (total, question, index) => total + (answers[index] === question.answer ? 1 : 0),
    0,
  );

  useEffect(() => {
    if (
      answeredCount === day.quiz.length &&
      correctCount === day.quiz.length &&
      !hasRecordedMastery.current
    ) {
      hasRecordedMastery.current = true;
      onMastered();
    }
  }, [answeredCount, correctCount, day.quiz.length, onMastered]);

  return (
    <div className="quiz-stack">
      {day.quiz.map((question, questionIndex) => (
        <fieldset className="quiz-card" key={question.question}>
          <legend>
            <span>{String(questionIndex + 1).padStart(2, "0")}</span>
            {question.question}
          </legend>
          <div className="quiz-options">
            {question.options.map((option, optionIndex) => {
              const selected = answers[questionIndex] === optionIndex;
              const isAnswered = answers[questionIndex] !== undefined;
              const className = isAnswered
                ? optionIndex === question.answer
                  ? "correct"
                  : selected
                    ? "incorrect"
                    : ""
                : "";

              return (
                <button
                  type="button"
                  className={className}
                  key={option}
                  disabled={isAnswered}
                  onClick={() =>
                    setAnswers((current) => ({ ...current, [questionIndex]: optionIndex }))
                  }
                >
                  <span>{String.fromCharCode(65 + optionIndex)}</span>
                  {option}
                </button>
              );
            })}
          </div>
          {answers[questionIndex] !== undefined && (
            <p className="quiz-explanation">
              {answers[questionIndex] === question.answer ? "That’s it. " : "Not quite. "}
              {question.explanation}
            </p>
          )}
        </fieldset>
      ))}
      {answeredCount === day.quiz.length && (
        <div className="quiz-score">
          <strong>{correctCount}/{day.quiz.length}</strong>
          <span>
            {correctCount === day.quiz.length
              ? "Mastered. This day is now marked complete."
              : "Review the explanations, then revisit this day tomorrow."}
          </span>
          {correctCount < day.quiz.length && (
            <button type="button" onClick={() => setAnswers({})}>
              Retry quiz
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function Overview({
  completed,
  openDay,
}: {
  completed: number[];
  openDay: (day: number) => void;
}) {
  const nextDay = courseDays.find((day) => !completed.includes(day.day)) ?? courseDays.at(-1)!;

  return (
    <main className="overview">
      <section className="hero">
        <div className="hero-copy">
          <div className="hero-kicker">
            <span className="brand-mark">λ</span>
            <span>Zero prerequisites · Lean 4 · 14 days</span>
          </div>
          <h1>
            Learn to make
            <em>certainty.</em>
          </h1>
          <p>
            A two-week field guide to interactive theorem proving with Lean. Built for the moment
            before any of this makes sense.
          </p>
          <div className="hero-actions">
            <button className="primary-action" type="button" onClick={() => openDay(nextDay.day)}>
              {completed.length ? `Continue day ${nextDay.day}` : "Begin day one"}
              <span aria-hidden="true">→</span>
            </button>
            <span className="time-note">14 chapters · progress stays on this device · share any day via its URL</span>
          </div>
        </div>
        <div className="hero-object" aria-label="Course concept illustration">
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="proof-card proof-card-back">
            <span>GOAL</span>
            <code>⊢ P → P</code>
          </div>
          <div className="proof-card proof-card-front">
            <span>CHECKED</span>
            <strong>Evidence<br />matches<br />the claim.</strong>
            <small>kernel approved / 00 errors</small>
          </div>
        </div>
      </section>

      <section className="how-to-use" aria-label="How to use this">
        <span className="eyebrow">How to use this</span>
        <p>
          Open a day, read Learn, try the lab in the{" "}
          <a href="https://live.lean-lang.org/" target="_blank" rel="noreferrer">
            Lean web editor
          </a>
          , then quiz yourself under Review. Send a friend{" "}
          <code>/day/1</code> (or any day) if you want them to jump straight in.
        </p>
      </section>

      <section className="manifesto">
        <p className="manifesto-number">01</p>
        <div>
          <span className="eyebrow">First, the honest version</span>
          <h2>Lean proves exactly what you state—not necessarily what you meant.</h2>
        </div>
        <p>
          You will learn two crafts together: expressing the right claim and constructing evidence
          Lean can check. Tests remain useful. Intuition remains useful. Proof adds a different kind
          of confidence.
        </p>
      </section>

      <section className="comparison" aria-label="Testing and proving comparison">
        <article>
          <span className="comparison-label">Testing</span>
          <div className="sample-field" aria-hidden="true">
            {Array.from({ length: 24 }).map((_, index) => (
              <i className={[2, 8, 13, 21].includes(index) ? "sampled" : ""} key={index} />
            ))}
          </div>
          <h3>Selected cases</h3>
          <p>Excellent for finding failures and checking real executions.</p>
        </article>
        <div className="versus">+</div>
        <article>
          <span className="comparison-label">Formal proof</span>
          <div className="coverage-field" aria-hidden="true">
            <span>∀</span>
          </div>
          <h3>Every stated case</h3>
          <p>A checked argument for the whole region covered by your assumptions.</p>
        </article>
      </section>

      <section className="journey">
        <div className="section-heading">
          <div>
            <span className="eyebrow">Your two-week map</span>
            <h2>From “why?” to a verified tiny system.</h2>
          </div>
          <div className="progress-ring" style={{ "--progress": `${(completed.length / 14) * 360}deg` } as React.CSSProperties}>
            <span>{completed.length}<small>/14</small></span>
          </div>
        </div>
        <div className="day-grid">
          {courseDays.map((day) => (
            <button
              type="button"
              className={completed.includes(day.day) ? "day-card complete" : "day-card"}
              key={day.day}
              onClick={() => openDay(day.day)}
            >
              <span className="day-index">D{String(day.day).padStart(2, "0")}</span>
              <span className="day-phase">{day.phase}</span>
              <strong>{day.title}</strong>
              <small>{day.subtitle}</small>
              <span className="day-open">{completed.includes(day.day) ? "Completed ✓" : "Open chapter →"}</span>
            </button>
          ))}
        </div>
      </section>

      <ProofSimulator />

      <section className="rhythm">
        <div>
          <span className="eyebrow">A sustainable eight-hour day</span>
          <h2>Read less. Predict, try, inspect, and explain more.</h2>
          <p>
            The schedule includes focused blocks, practice, a mini-project, and retrieval. Take
            breaks. Each chapter now includes three long-form deep dives, traced examples, mistake
            clinics, and self-checks. Confusion is expected; passive reading for eight straight
            hours is not.
          </p>
        </div>
        <ol>
          <li><span>01</span><strong>Understand</strong><small>plain language + visual model</small></li>
          <li><span>02</span><strong>Predict</strong><small>say what Lean will do</small></li>
          <li><span>03</span><strong>Practice</strong><small>edit, break, and repair proofs</small></li>
          <li><span>04</span><strong>Explain</strong><small>retrieve without your notes</small></li>
        </ol>
      </section>

      <section className="source-strip">
        <span className="eyebrow">Grounded in current official material</span>
        <div>
          {sources.map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.title}>
              <strong>{source.title}</strong>
              <span>{source.note}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

function Lesson({
  day,
  completed,
  onComplete,
  onOpenDay,
  deepDive,
}: {
  day: CourseDay;
  completed: boolean;
  onComplete: () => void;
  onOpenDay: (day: number) => void;
  deepDive?: DeepDiveChapter;
}) {
  const [tab, setTab] = useState<LessonTab>("learn");
  const [showSolution, setShowSolution] = useState(false);

  return (
    <main className="lesson-page">
      <header className="lesson-hero">
        <div className="lesson-number">DAY {String(day.day).padStart(2, "0")}</div>
        <div>
          <span className="eyebrow">{day.phase} · {day.duration}</span>
          <h1>{day.title}</h1>
          <p>{day.subtitle}</p>
        </div>
        <button className={completed ? "complete-button completed" : "complete-button"} type="button" onClick={onComplete}>
          {completed ? "Completed ✓" : "Mark complete"}
        </button>
      </header>

      <div className="lesson-tabs" role="tablist" aria-label="Chapter sections">
        {(["learn", "practice", "review"] as LessonTab[]).map((item) => (
          <button
            type="button"
            role="tab"
            aria-selected={tab === item}
            className={tab === item ? "active" : ""}
            key={item}
            onClick={() => setTab(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {tab === "learn" && (
        <div className="lesson-content">
          <aside className="day-plan">
            <span className="eyebrow">Today’s outcomes</span>
            <ul>
              {day.goals.map((goal) => <li key={goal}>{goal}</li>)}
            </ul>
            <span className="eyebrow">Study blocks</span>
            <ol>
              {day.schedule.map((slot) => (
                <li key={slot.time}>
                  <time>{slot.time}</time>
                  <span>{slot.activity}</span>
                </li>
              ))}
            </ol>
          </aside>

          <article className="chapter">
            {day.sections.map((section, index) => (
              <section className="chapter-section" key={section.title}>
                <div className="section-marker">{String(index + 1).padStart(2, "0")}</div>
                <span className="eyebrow">{section.eyebrow}</span>
                <h2>{section.title}</h2>
                {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                {section.diagram && <ConceptDiagram {...section.diagram} />}
                {section.code && <CodeBlock code={section.code} note={section.codeNote} />}
                <div className="takeaway">
                  <span>Keep this</span>
                  <strong>{section.takeaway}</strong>
                </div>
              </section>
            ))}
            {deepDive && <DeepDiveBook chapter={deepDive} />}
            {day.day === 4 && <ProofSimulator />}
          </article>
        </div>
      )}

      {tab === "practice" && (
        <section className="practice-layout">
          <div className="lab-brief">
            <span className="eyebrow">Daily lab</span>
            <h2>{day.lab.title}</h2>
            <p>{day.lab.brief}</p>
            <ol>
              {day.lab.steps.map((step) => <li key={step}>{step}</li>)}
            </ol>
          </div>
          <div className="lab-code">
            <CodeBlock code={day.lab.starter} note="Replace each ? with your proof or expression. Run this in a real Lean 4 file." />
            <button className="solution-toggle" type="button" onClick={() => setShowSolution((current) => !current)}>
              {showSolution ? "Hide reference solution" : "Reveal reference solution"}
            </button>
            {showSolution && (
              <div className="solution">
                <p>
                  Compare the idea, not just the characters. There is often more than one good Lean proof.
                </p>
                <CodeBlock code={day.lab.solution} />
              </div>
            )}
          </div>
        </section>
      )}

      {tab === "review" && (
        <section className="review-layout">
          <div className="recap-card">
            <span className="eyebrow">Retrieval first</span>
            <h2>Can you say these without looking back?</h2>
            <ul>
              {day.recap.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <div className="reflection">
              <label htmlFor={`reflection-${day.day}`}>Explain today’s hardest idea to a friend:</label>
              <textarea id={`reflection-${day.day}`} placeholder="Write two or three sentences in your own words…" />
              <small>Reflection text is private to this page and is not submitted anywhere.</small>
            </div>
          </div>
          <div>
            <span className="eyebrow">Knowledge check</span>
            <h2>Answer, then read the reason.</h2>
            <Quiz day={day} onMastered={onComplete} />
          </div>
        </section>
      )}

      <nav className="lesson-pagination" aria-label="Chapter pagination">
        <button type="button" disabled={day.day === 1} onClick={() => onOpenDay(day.day - 1)}>
          ← Previous day
        </button>
        <span>{day.day} of 14</span>
        <button type="button" disabled={day.day === 14} onClick={() => onOpenDay(day.day + 1)}>
          Next day →
        </button>
      </nav>
    </main>
  );
}

function Glossary() {
  const [query, setQuery] = useState("");
  const entries = glossary.filter((entry) =>
    `${entry.term} ${entry.definition}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <main className="glossary-page">
      <header>
        <span className="eyebrow">Plain-language reference</span>
        <h1>Words Lean users say.</h1>
        <p>Search here whenever a sentence starts sounding like documentation.</p>
        <label className="glossary-search">
          <span>Search terms</span>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try “kernel” or “goal”" />
        </label>
      </header>
      <div className="glossary-grid">
        {entries.map((entry, index) => (
          <article key={entry.term}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <h2>{entry.term}</h2>
            <p>{entry.definition}</p>
          </article>
        ))}
      </div>
      <section className="source-strip">
        <span className="eyebrow">Continue with primary sources</span>
        <div>
          {sources.map((source) => (
            <a href={source.url} target="_blank" rel="noreferrer" key={source.title}>
              <strong>{source.title}</strong>
              <span>{source.note}</span>
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}

export default function CourseApp() {
  const pathname = usePathname();
  const router = useRouter();
  const route = useMemo(() => parseRoute(pathname), [pathname]);
  const [completed, setCompleted] = useState<number[]>([]);
  const [hasLoadedProgress, setHasLoadedProgress] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadTimer = window.setTimeout(() => {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setCompleted(JSON.parse(stored) as number[]);
        } catch {
          window.localStorage.removeItem(STORAGE_KEY);
        }
      }
      setHasLoadedProgress(true);
    }, 0);

    return () => window.clearTimeout(loadTimer);
  }, []);

  useEffect(() => {
    if (hasLoadedProgress) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(completed));
    }
  }, [completed, hasLoadedProgress]);

  useEffect(() => {
    const dayMatch = pathname.match(/^\/day\/(\d+)\/?$/);
    if (!dayMatch) return;
    const day = Number(dayMatch[1]);
    if (!Number.isInteger(day) || day < 1 || day > courseDays.length) {
      router.replace("/");
    }
  }, [pathname, router]);

  const activeDay = useMemo(
    () => courseDays.find((day) => day.day === route.day) ?? courseDays[0],
    [route.day],
  );

  function goHome() {
    setMenuOpen(false);
    router.push("/");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openDay(day: number) {
    setMenuOpen(false);
    router.push(`/day/${day}`);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function openGlossary() {
    setMenuOpen(false);
    router.push("/glossary");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function toggleComplete(day: number) {
    setCompleted((current) =>
      current.includes(day) ? current.filter((item) => item !== day) : [...current, day],
    );
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <button
          type="button"
          className="wordmark"
          onClick={goHome}
          aria-label="Return to course overview"
        >
          <span>λ</span>
          <strong>Lean, from zero</strong>
        </button>
        <nav className={menuOpen ? "main-nav open" : "main-nav"} aria-label="Main navigation">
          <button type="button" className={route.view === "overview" ? "active" : ""} onClick={goHome}>
            Course map
          </button>
          <button type="button" className={route.view === "lesson" ? "active" : ""} onClick={() => openDay(route.day)}>
            Chapters
          </button>
          <button type="button" className={route.view === "glossary" ? "active" : ""} onClick={openGlossary}>
            Glossary
          </button>
        </nav>
        <div className="header-progress">
          <span>{completed.length}/14 complete</span>
          <div><i style={{ width: `${(completed.length / 14) * 100}%` }} /></div>
        </div>
        <button type="button" className="menu-button" onClick={() => setMenuOpen((current) => !current)} aria-label="Toggle navigation">
          {menuOpen ? "Close" : "Menu"}
        </button>
      </header>

      {route.view === "overview" && <Overview completed={completed} openDay={openDay} />}
      {route.view === "lesson" && (
        <Lesson
          key={activeDay.day}
          day={activeDay}
          completed={completed.includes(activeDay.day)}
          onComplete={() => toggleComplete(activeDay.day)}
          onOpenDay={openDay}
          deepDive={deepDiveByDay.get(activeDay.day)}
        />
      )}
      {route.view === "glossary" && <Glossary />}

      <footer>
        <div className="wordmark footer-wordmark"><span>λ</span><strong>Lean, from zero</strong></div>
        <p>Personal Lean notes you can share. Built around official Lean 4 material.</p>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Back to top ↑</button>
      </footer>
    </div>
  );
}
