import { dayPlay } from "./play-content";
import type { LabCheck, MiniGame, PlayQuest } from "./play-content";

export type { LabCheck, MiniGame, PlayQuest };

export type CourseSection = {
  title: string;
  eyebrow: string;
  paragraphs: string[];
  code?: string;
  codeNote?: string;
  diagram?: {
    kind: "pipeline" | "proof" | "types" | "induction";
    items: string[];
  };
  takeaway: string;
};

export type QuizQuestion = {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type CourseDay = {
  day: number;
  phase: string;
  title: string;
  subtitle: string;
  duration: string;
  goals: string[];
  schedule: { time: string; activity: string }[];
  sections: CourseSection[];
  lab: {
    title: string;
    brief: string;
    steps: string[];
    starter: string;
    solution: string;
  };
  quiz: QuizQuestion[];
  recap: string[];
};

export type EnrichedDay = CourseDay & {
  miniGame?: MiniGame;
  playQuests?: PlayQuest[];
  labChecks?: LabCheck[];
};

export function enrichDay(day: CourseDay): EnrichedDay {
  const play = dayPlay[day.day];
  if (!play) return day;
  return {
    ...day,
    miniGame: play.miniGame,
    playQuests: play.playQuests,
    labChecks: play.labChecks,
    quiz: [...day.quiz, ...play.extraQuiz],
  };
}

export const courseDays: CourseDay[] = [
  {
    day: 1,
    phase: "Orientation",
    title: "Why prove anything?",
    subtitle: "From “the program seems fine” to machine-checked certainty.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Explain what interactive theorem proving is in ordinary language",
      "Distinguish testing, static typing, and formal proof",
      "Understand the roles of you, Lean, tactics, and the kernel",
    ],
    schedule: [
      { time: "09:00", activity: "Read: certainty, specifications, and proof" },
      { time: "10:15", activity: "Examples: tests versus universal claims" },
      { time: "11:30", activity: "Map the Lean proof-checking pipeline" },
      { time: "13:30", activity: "Install or open the Lean playground" },
      { time: "15:00", activity: "First commands: #check and #eval" },
      { time: "16:30", activity: "Lab, quiz, and written reflection" },
    ],
    sections: [
      {
        eyebrow: "The need",
        title: "A test samples. A proof covers the whole promise.",
        paragraphs: [
          "Imagine a function that sorts a list. You can test it on an empty list, a short list, duplicates, and a thousand random inputs. That is valuable evidence—but the input space is unbounded. A proof asks a different question: can we give a checkable argument that every output is ordered and contains exactly the original elements?",
          "Interactive theorem proving, or ITP, is a collaboration. You state a precise claim, guide the construction of a proof, and the system checks every step. “Interactive” does not mean the machine is passive; Lean can simplify, search, and automate. It means the human remains responsible for the statement and the high-level route.",
        ],
        diagram: {
          kind: "pipeline",
          items: ["Informal promise", "Precise statement", "Proof", "Kernel check", "Trusted theorem"],
        },
        takeaway: "Proof does not replace testing; it answers a stronger, universal question.",
      },
      {
        eyebrow: "The cast",
        title: "You are the architect; the kernel is the building inspector.",
        paragraphs: [
          "You choose what to formalize and how to explain it. Tactics are tools that help construct proof terms. Lean’s elaborator fills in inferable details. At the end, a small trusted kernel checks the completed term against its claimed type.",
          "This separation matters. A powerful tactic may contain bugs, but it cannot simply persuade the kernel with confidence or rhetoric. It must produce evidence the kernel accepts. The trusted core is deliberately much smaller than the convenient automation surrounding it.",
        ],
        diagram: {
          kind: "proof",
          items: ["Your idea", "Tactics + elaborator", "Proof term", "Small kernel"],
        },
        takeaway: "Automation proposes evidence; the kernel decides whether the evidence is valid.",
      },
      {
        eyebrow: "First contact",
        title: "Ask Lean what things are, then ask it to compute.",
        paragraphs: [
          "Lean is both a theorem prover and a functional programming language. The command #check reports the type of an expression. The command #eval evaluates a computable expression. These two questions—“what is it?” and “what does it compute to?”—are your first debugging instruments.",
          "Read the colon as “has type.” For example, true has type Bool, and 2 has type Nat. A function type A → B says: give me a value of type A and I will return a value of type B.",
        ],
        code: `#check true          -- true : Bool
#check 2             -- 2 : Nat
#check Nat.succ      -- Nat → Nat
#eval 20 + 22        -- 42
#eval "Lean".append "!"  -- "Lean!"`,
        codeNote: "Comments begin with --. Commands beginning with # inspect or run code; they do not define a reusable theorem.",
        takeaway: "#check explores meaning; #eval explores computation.",
      },
    ],
    lab: {
      title: "Make Lean answer five tiny questions",
      brief: "Use the embedded Lean lab below (or open it fullscreen). Predict each answer before Lean shows it.",
      steps: [
        "Check the types of false, Nat, Nat.succ, and fun x : Nat => x + 1.",
        "Evaluate 6 * 7, [1, 2, 3].length, and (10 > 3).",
        "Deliberately check an ill-typed expression such as true + 1. Read the first error slowly.",
        "Write one sentence explaining why an error message is useful evidence, not a grade.",
      ],
      starter: `#check false
#check Nat
#check fun x : Nat => x + 1

#eval 6 * 7
#eval [1, 2, 3].length`,
      solution: `-- Expected essentials:
-- false : Bool
-- Nat : Type
-- (fun x : Nat => x + 1) : Nat → Nat
-- 6 * 7 evaluates to 42
-- the list length evaluates to 3`,
    },
    quiz: [
      {
        question: "What is the strongest accurate description of a formal proof in Lean?",
        options: [
          "A large set of successful test cases",
          "Machine-checkable evidence for a precisely stated claim",
          "A tactic that never reports an error",
          "A mathematical comment written beside code",
        ],
        answer: 1,
        explanation: "A Lean proof is evidence whose type is the proposition being proved, checked by the kernel.",
      },
      {
        question: "Who ultimately accepts or rejects a Lean proof term?",
        options: ["The editor", "The tactic author", "The kernel", "The operating system"],
        answer: 2,
        explanation: "The small trusted kernel performs the final type check.",
      },
    ],
    recap: [
      "ITP is human-guided construction of machine-checked proofs.",
      "Testing finds examples; proof establishes a stated universal claim.",
      "Lean is both a programming language and a theorem prover.",
      "#check reports types; #eval computes values.",
    ],
  },
  {
    day: 2,
    phase: "Foundations",
    title: "Types are promises",
    subtitle: "Values, functions, definitions, and the first taste of dependent types.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Read basic Lean types and function signatures",
      "Define pure functions with def and fun",
      "Understand how types rule out nonsensical combinations",
    ],
    schedule: [
      { time: "09:00", activity: "Values, types, and universes" },
      { time: "10:15", activity: "Functions and function application" },
      { time: "11:30", activity: "Definitions, inference, and annotations" },
      { time: "13:30", activity: "Products, sums, and options" },
      { time: "15:00", activity: "Dependent types without panic" },
      { time: "16:30", activity: "Lab: model a tiny domain" },
    ],
    sections: [
      {
        eyebrow: "Mental model",
        title: "A type is a contract for construction and use.",
        paragraphs: [
          "A type tells you what counts as a valid value and which operations make sense. Nat contains natural numbers. Bool contains true and false. String contains text. Lean rejects “add true to 4” because addition expects numbers, not because someone remembered to test that bad case.",
          "Types also describe functions. Nat → Nat is a machine with a Nat-shaped input port and a Nat-shaped output port. Function application is written with spaces: double 3, not double(3). Parentheses are used only to control grouping.",
        ],
        diagram: {
          kind: "types",
          items: ["input : Nat", "double", "output : Nat"],
        },
        takeaway: "A useful signature explains what a function requires and guarantees.",
      },
      {
        eyebrow: "Definitions",
        title: "Names turn expressions into a vocabulary.",
        paragraphs: [
          "Use def to give a reusable name to a value or function. Lean often infers types, but explicit annotations are excellent teaching and documentation. The expression fun x : Nat => x + 1 is an anonymous function; def successor packages the same idea under a name.",
          "Definitions compute by unfolding. If double n means n + n, then double 5 reduces to 10. Later, rfl will prove equalities whose two sides reduce to the same expression.",
        ],
        code: `def double (n : Nat) : Nat :=
  n + n

def greet (name : String) : String :=
  "Hello, " ++ name

#eval double 21
#eval greet "Sharjeel"`,
        codeNote: "The return type appears after the final colon. := separates a definition’s signature from its body.",
        takeaway: "A definition contributes a word to the language you use for later programs and proofs.",
      },
      {
        eyebrow: "The big idea",
        title: "In Lean, types can mention values.",
        paragraphs: [
          "Ordinary types can say “a list of natural numbers.” A dependent type can say “a vector of natural numbers of length exactly three.” The value 3 appears inside the type, so a length mismatch becomes a type error rather than a runtime surprise.",
          "You do not need to master dependent types today. Keep one image: normal types are labels on boxes; dependent types are labels that can include measured facts about what is inside the box.",
        ],
        diagram: {
          kind: "types",
          items: ["List Nat", "Vector Nat 3", "length recorded in type"],
        },
        takeaway: "Dependent types let specifications move into the type system.",
      },
    ],
    lab: {
      title: "Model a traffic light",
      brief: "Create a small data type and a function that maps each light to the next one.",
      steps: [
        "Declare Light with red, amber, and green constructors.",
        "Write nextLight using pattern matching.",
        "Evaluate nextLight .red and nextLight (nextLight .red).",
        "Add a message function that returns a String for every light.",
      ],
      starter: `inductive Light where
  | red
  | amber
  | green
  deriving Repr

def nextLight (light : Light) : Light :=
  match light with
  | .red => ?_
  | .amber => ?_
  | .green => ?_`,
      solution: `def nextLight (light : Light) : Light :=
  match light with
  | .red => .green
  | .green => .amber
  | .amber => .red

#eval nextLight .red`,
    },
    quiz: [
      {
        question: "What does A → B mean?",
        options: ["A equals B", "A list containing B", "A function from A to B", "A proof that B is false"],
        answer: 2,
        explanation: "The arrow type describes a function that accepts an A and returns a B.",
      },
      {
        question: "Why is a return-type annotation useful even when Lean can infer it?",
        options: ["It makes the code run faster", "It documents the promise", "It enables comments", "It disables type checking"],
        answer: 1,
        explanation: "Annotations communicate intent to readers and can make errors easier to localize.",
      },
    ],
    recap: [
      "Every Lean expression has a type.",
      "Function application uses spaces.",
      "Definitions compute by unfolding.",
      "Dependent types can record facts such as length in a type.",
    ],
  },
  {
    day: 3,
    phase: "Foundations",
    title: "Propositions are types",
    subtitle: "The Curry–Howard correspondence, explained without mysticism.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Read Prop, theorem statements, and proof terms",
      "Connect implication with functions and conjunction with pairs",
      "Construct small proofs directly",
    ],
    schedule: [
      { time: "09:00", activity: "Claims, evidence, and Prop" },
      { time: "10:15", activity: "Implication as a function" },
      { time: "11:30", activity: "And, Or, True, and False" },
      { time: "13:30", activity: "Proof terms versus tactic scripts" },
      { time: "15:00", activity: "Equality and reflexivity" },
      { time: "16:30", activity: "Lab: proof constructors" },
    ],
    sections: [
      {
        eyebrow: "Curry–Howard",
        title: "A proposition is a type; a proof is a value of that type.",
        paragraphs: [
          "Suppose P is a proposition. To prove P is to construct a term whose type is P. This is the propositions-as-types idea. Lean checks a theorem in the same fundamental way it checks a program: does the supplied term have the promised type?",
          "An implication P → Q behaves like a function type. If you give the proof function evidence of P, it returns evidence of Q. This makes a proof reusable and explicit.",
        ],
        diagram: {
          kind: "types",
          items: ["proposition P", "proof p : P", "kernel checks p has type P"],
        },
        takeaway: "Proof checking is type checking with propositions in the type position.",
      },
      {
        eyebrow: "Logical shapes",
        title: "Connectives tell you what evidence must look like.",
        paragraphs: [
          "Evidence for P ∧ Q contains both a proof of P and a proof of Q. Evidence for P ∨ Q says which side holds and carries evidence for that side. A proof of P → Q accepts evidence of P. A proof of ¬P is a function P → False.",
          "This gives you a practical method: inspect the outermost connective of the goal. If the goal is an implication, introduce its premise. If it is a conjunction, build both parts. If it is an equality that computes to the same expression, try reflexivity.",
        ],
        code: `theorem keepLeft (P Q : Prop) : P ∧ Q → P :=
  fun h => h.left

theorem swapAnd (P Q : Prop) : P ∧ Q → Q ∧ P :=
  fun h => ⟨h.right, h.left⟩

theorem same (n : Nat) : n = n :=
  rfl`,
        codeNote: "The angle brackets build a pair-like proof of a conjunction. rfl is evidence that something equals itself.",
        takeaway: "Let the shape of the goal suggest the shape of the proof.",
      },
      {
        eyebrow: "Two views",
        title: "Proof terms and tactics build the same kind of evidence.",
        paragraphs: [
          "A proof term directly writes the evidence. A tactic proof begins with by and gives instructions for constructing it. Tactics are often easier to develop interactively because the editor displays the current context and goal after each step.",
          "Neither style is inherently more trustworthy. Both elaborate to terms checked by the kernel. You will learn tactics first for fluency, then revisit terms to deepen your understanding.",
        ],
        diagram: {
          kind: "proof",
          items: ["statement", "term or tactics", "elaborated proof term", "kernel"],
        },
        takeaway: "Tactics are a user interface for building proof terms.",
      },
    ],
    lab: {
      title: "Build logic from constructors",
      brief: "Prove four miniature theorems first as terms, then compare them with tactic versions.",
      steps: [
        "Prove P → P.",
        "Prove P ∧ Q → Q.",
        "Prove P → P ∨ Q.",
        "Prove P ∧ (P → Q) → Q.",
      ],
      starter: `example (P : Prop) : P → P := by
  ?

example (P Q : Prop) : P ∧ Q → Q := by
  ?

example (P Q : Prop) : P → P ∨ Q := by
  ?`,
      solution: `example (P : Prop) : P → P := by
  intro h
  exact h

example (P Q : Prop) : P ∧ Q → Q := by
  intro h
  exact h.right

example (P Q : Prop) : P → P ∨ Q := by
  intro h
  exact Or.inl h`,
    },
    quiz: [
      {
        question: "Under Curry–Howard, what is a proof of P → Q?",
        options: ["A list of P values", "A function from proofs of P to proofs of Q", "A Boolean", "A comment"],
        answer: 1,
        explanation: "Implication corresponds to a function type.",
      },
      {
        question: "What evidence is needed for P ∧ Q?",
        options: ["Either P or Q", "Neither", "Both a proof of P and a proof of Q", "Only a proof of P"],
        answer: 2,
        explanation: "A conjunction packages evidence for both sides.",
      },
    ],
    recap: [
      "Prop is the universe of propositions.",
      "Proofs are terms inhabiting proposition types.",
      "Logical connectives describe evidence shapes.",
      "Terms and tactics both produce kernel-checked proof terms.",
    ],
  },
  {
    day: 4,
    phase: "Proof craft",
    title: "Read the proof state",
    subtitle: "Contexts, goals, and the small moves that make proofs predictable.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Read a Lean proof state confidently",
      "Use intro, exact, apply, constructor, and assumption",
      "Choose a tactic from the shape of the goal",
    ],
    schedule: [
      { time: "09:00", activity: "Anatomy of a proof state" },
      { time: "10:15", activity: "Goal-directed tactics" },
      { time: "11:30", activity: "Building and using hypotheses" },
      { time: "13:30", activity: "Branching goals" },
      { time: "15:00", activity: "Debugging one move at a time" },
      { time: "16:30", activity: "Lab: propositional proof gym" },
    ],
    sections: [
      {
        eyebrow: "The dashboard",
        title: "Above the turnstile is what you have; below it is what you need.",
        paragraphs: [
          "A proof state lists local variables and hypotheses, then a turnstile ⊢, then the current goal. Read it aloud. If you see h : P above and P below, exact h closes the goal. If the goal is P → Q, intro h moves P into the context and leaves Q as the new target.",
          "Never treat the proof state as an error panel. It is Lean showing you the precise state of the construction. After every tactic, ask: what changed, and why?",
        ],
        diagram: {
          kind: "proof",
          items: ["P Q : Prop", "hP : P", "⊢ Q", "next legal move"],
        },
        takeaway: "Proof states turn abstract logic into a concrete to-do list.",
      },
      {
        eyebrow: "Core moves",
        title: "intro consumes an arrow; apply works backward.",
        paragraphs: [
          "intro handles a goal that begins with ∀ or → by adding a named assumption. exact supplies evidence that matches the goal exactly. apply uses a theorem whose conclusion matches the goal and replaces the goal with that theorem’s premises.",
          "constructor splits goals such as P ∧ Q into their components. assumption searches the local context for matching evidence. These few moves are enough for a surprising amount of elementary logic.",
        ],
        code: `example (P Q R : Prop)
    (hPQ : P → Q) (hQR : Q → R) : P → R := by
  intro hP
  apply hQR
  apply hPQ
  exact hP`,
        codeNote: "Read apply backward: to prove R using Q → R, it is now enough to prove Q.",
        takeaway: "Tactics transform one clear obligation into zero or more smaller obligations.",
      },
      {
        eyebrow: "Method",
        title: "Make one justified move, then reread.",
        paragraphs: [
          "Beginners often paste a chain of tactics and only inspect the final error. Instead, place the cursor after one line and observe the state. Predict the next state before adding the next tactic. This deliberate loop builds an accurate mental interpreter.",
          "When stuck, identify the outer shape of the goal, scan the context for matching or useful facts, and search known theorems only after you can describe the missing link in words.",
        ],
        diagram: {
          kind: "pipeline",
          items: ["Read", "Predict", "One tactic", "Observe", "Explain"],
        },
        takeaway: "Proof development is a feedback loop, not a typing race.",
      },
    ],
    lab: {
      title: "Propositional proof gym",
      brief: "Solve a ladder of shape-driven proofs. Stop after every line and narrate the new state.",
      steps: [
        "Prove P ∧ Q → Q ∧ P.",
        "Prove (P → Q) → (Q → R) → P → R.",
        "Prove P → Q → P ∧ Q.",
        "Redo each proof while avoiding assumption.",
      ],
      starter: `example (P Q : Prop) : P ∧ Q → Q ∧ P := by
  ?

example (P Q R : Prop) :
    (P → Q) → (Q → R) → P → R := by
  ?`,
      solution: `example (P Q : Prop) : P ∧ Q → Q ∧ P := by
  intro h
  constructor
  · exact h.right
  · exact h.left

example (P Q R : Prop) :
    (P → Q) → (Q → R) → P → R := by
  intro hPQ hQR hP
  exact hQR (hPQ hP)`,
    },
    quiz: [
      {
        question: "The goal is P → Q. What is the most natural first tactic?",
        options: ["rfl", "intro hP", "constructor", "left"],
        answer: 1,
        explanation: "intro moves the premise P into the context and leaves Q as the goal.",
      },
      {
        question: "What does apply h do when h : P → Q and the goal is Q?",
        options: ["Closes every goal", "Changes the goal to P", "Deletes h", "Changes P into Q"],
        answer: 1,
        explanation: "apply reasons backward from h’s conclusion, leaving its premise as the new obligation.",
      },
    ],
    recap: [
      "The context contains available evidence; the goal is the current obligation.",
      "intro, exact, apply, constructor, and assumption are core moves.",
      "The goal’s outer shape usually suggests the next tactic.",
      "One-step feedback is the fastest route to intuition.",
    ],
  },
  {
    day: 5,
    phase: "Proof craft",
    title: "Logic you can operate",
    subtitle: "Conjunction, disjunction, negation, quantifiers, and existence.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Construct and destruct And and Or",
      "Use cases for alternatives and contradictions",
      "Work with universal and existential claims",
    ],
    schedule: [
      { time: "09:00", activity: "And and Or as data" },
      { time: "10:15", activity: "Negation and False" },
      { time: "11:30", activity: "Universal quantification" },
      { time: "13:30", activity: "Existential witnesses" },
      { time: "15:00", activity: "Classical versus constructive reasoning" },
      { time: "16:30", activity: "Lab: logic transformations" },
    ],
    sections: [
      {
        eyebrow: "Build and unpack",
        title: "constructor builds alternatives; cases opens them.",
        paragraphs: [
          "For P ∧ Q, constructor asks you to prove both parts. A hypothesis h : P ∧ Q can be projected with h.left and h.right or unpacked with rcases h with ⟨hP, hQ⟩. For P ∨ Q, left or right chooses the side you will prove; cases h creates one branch per possible source of evidence.",
          "This mirrors ordinary data programming. A conjunction is product-like; a disjunction is sum-like. Logic stops feeling arbitrary when you treat propositions as evidence structures.",
        ],
        code: `example (P Q : Prop) : P ∨ Q → Q ∨ P := by
  intro h
  cases h with
  | inl hP =>
      exact Or.inr hP
  | inr hQ =>
      exact Or.inl hQ`,
        codeNote: "Every constructor of Or becomes a case. Each branch receives the evidence carried by that constructor.",
        takeaway: "To use compound evidence, split on the way it could have been built.",
      },
      {
        eyebrow: "Quantifiers",
        title: "∀ is a function; ∃ is a witness plus evidence.",
        paragraphs: [
          "A proof of ∀ x, P x accepts an arbitrary x and returns a proof of P x. intro x is therefore natural. To prove ∃ x, P x, provide a particular witness and then prove it has the property. The syntax ⟨w, proof⟩ packages both.",
          "To use existential evidence, unpack it. You receive a hidden witness and the fact known about it. You may not get to choose the witness when eliminating an existential; you must handle whichever one the evidence contains.",
        ],
        code: `example : ∃ n : Nat, n + 1 = 4 := by
  exact ⟨3, rfl⟩

example (P : Nat → Prop) :
    (∃ n, P n) → ∃ n, P n := by
  intro h
  rcases h with ⟨w, hw⟩
  exact ⟨w, hw⟩`,
        takeaway: "Existence is constructive when the proof contains an actual witness.",
      },
      {
        eyebrow: "Negation",
        title: "To refute P, show that P would create impossible evidence.",
        paragraphs: [
          "Lean defines ¬P as P → False. So to prove a negation, assume P and derive False. If you already have hP : P and hNotP : ¬P, exact hNotP hP produces False. From False, any proposition follows because there is no constructor that could have built false evidence.",
          "Constructive logic does not assume every proposition is decidably true or false. Classical principles are available when you request them, but noticing when you rely on them makes proofs more informative and often more computational.",
        ],
        diagram: {
          kind: "proof",
          items: ["assume P", "derive False", "therefore ¬P"],
        },
        takeaway: "Negation is not a dark primitive; it is a function into False.",
      },
    ],
    lab: {
      title: "Transform logical evidence",
      brief: "Prove a small set of transformations using only the connective rules you know.",
      steps: [
        "Prove (P ∨ Q) ∨ R → P ∨ (Q ∨ R).",
        "Prove (∃ x, P x ∧ Q x) → ∃ x, Q x.",
        "Prove P ∧ ¬P → Q.",
        "Write the evidence shape beside each theorem before coding.",
      ],
      starter: `example (P Q R : Prop) :
    (P ∨ Q) ∨ R → P ∨ (Q ∨ R) := by
  ?

example (P Q : Nat → Prop) :
    (∃ x, P x ∧ Q x) → ∃ x, Q x := by
  ?`,
      solution: `example (P Q : Nat → Prop) :
    (∃ x, P x ∧ Q x) → ∃ x, Q x := by
  intro h
  rcases h with ⟨x, _, hQ⟩
  exact ⟨x, hQ⟩`,
    },
    quiz: [
      {
        question: "What must a proof of ∃ x, P x contain?",
        options: ["Only P", "A witness x and evidence of P x", "Every possible x", "A Boolean test"],
        answer: 1,
        explanation: "Existential evidence packages a concrete witness with its property proof.",
      },
      {
        question: "How is ¬P defined constructively?",
        options: ["P = false", "P → False", "False → P", "Bool"],
        answer: 1,
        explanation: "A negation turns any proposed proof of P into a contradiction.",
      },
    ],
    recap: [
      "And is product-like; Or is sum-like.",
      "cases follows the constructors of available evidence.",
      "Universal proofs behave like functions.",
      "Existential proofs carry witnesses; negations lead to False.",
    ],
  },
  {
    day: 6,
    phase: "Proof craft",
    title: "Equality and rewriting",
    subtitle: "Replace equals by equals and let simplification do honest work.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Distinguish definitional and propositional equality",
      "Use rfl, rw, simp, and calc",
      "Debug rewrite direction and theorem selection",
    ],
    schedule: [
      { time: "09:00", activity: "What equality evidence means" },
      { time: "10:15", activity: "Definitional equality and rfl" },
      { time: "11:30", activity: "Rewriting hypotheses and goals" },
      { time: "13:30", activity: "Simplification with simp" },
      { time: "15:00", activity: "Readable chains with calc" },
      { time: "16:30", activity: "Lab: algebra without magic" },
    ],
    sections: [
      {
        eyebrow: "Two equalities",
        title: "Some equality is computation; some needs evidence.",
        paragraphs: [
          "Definitional equality means two expressions reduce to the same thing by computation or unfolding. rfl proves such goals. Propositional equality is an explicit type a = b with evidence you can pass, store, reverse, and rewrite with.",
          "If double 3 unfolds to 3 + 3, Lean may see double 3 and 6 as definitionally equal after computation. A theorem such as a + b = b + a is not true merely by unfolding; it requires a proof like Nat.add_comm.",
        ],
        code: `def double (n : Nat) := n + n

example : double 3 = 6 := by
  rfl

example (a b : Nat) : a + b = b + a := by
  exact Nat.add_comm a b`,
        takeaway: "Try rfl for equality by reduction; use lemmas for mathematical rearrangement.",
      },
      {
        eyebrow: "Substitution",
        title: "rw transports a fact through a larger expression.",
        paragraphs: [
          "Given h : a = b, rw [h] replaces a with b in the goal. rw [← h] reverses the direction. You can rewrite inside a hypothesis with rw [h] at hName. This is equality’s essential power: equal things are interchangeable.",
          "When rw says it cannot find a pattern, compare the theorem’s left side with the exact syntax of your goal. The problem is usually direction, hidden unfolding, or a mismatch in the expression—not Lean being stubborn.",
        ],
        diagram: {
          kind: "pipeline",
          items: ["h : a = b", "goal contains a", "rw [h]", "goal now contains b"],
        },
        takeaway: "A rewrite is a precise substitution justified by equality evidence.",
      },
      {
        eyebrow: "Controlled automation",
        title: "simp is a rewriting engine with a curated rule set.",
        paragraphs: [
          "simp repeatedly applies simplification lemmas and safe computational reductions. You can add local facts with simp [definition, h]. It is excellent for routine cleanup, but always inspect what it solved and learn the lemmas that matter.",
          "calc blocks make equational arguments readable: each line states the next expression and the evidence for the transition. Prefer them when a proof is fundamentally a chain of equalities.",
        ],
        code: `example (a b c : Nat) (h : a = b) :
    a + c = b + c := by
  rw [h]

example (a b : Nat) : a + b = b + a := by
  calc
    a + b = b + a := Nat.add_comm a b`,
        takeaway: "Use simp for routine normalization and calc for human-readable chains.",
      },
    ],
    lab: {
      title: "Rewrite a shopping total",
      brief: "Model a subtotal and prove that replacing an equal price preserves the total.",
      steps: [
        "Define total price quantity := price * quantity.",
        "Prove total p q = p * q by rfl.",
        "Given h : oldPrice = newPrice, prove total oldPrice q = total newPrice q.",
        "Prove total p 0 = 0 using simp [total].",
      ],
      starter: `def total (price quantity : Nat) : Nat :=
  price * quantity

example (oldPrice newPrice quantity : Nat)
    (h : oldPrice = newPrice) :
    total oldPrice quantity = total newPrice quantity := by
  ?`,
      solution: `example (oldPrice newPrice quantity : Nat)
    (h : oldPrice = newPrice) :
    total oldPrice quantity = total newPrice quantity := by
  rw [h]

example (price : Nat) : total price 0 = 0 := by
  simp [total]`,
    },
    quiz: [
      {
        question: "When is rfl the right first attempt?",
        options: ["Any difficult theorem", "Both sides reduce to the same expression", "The goal is a disjunction", "You need a witness"],
        answer: 1,
        explanation: "rfl proves reflexive equality, including equality after definitional reduction.",
      },
      {
        question: "What does rw [← h] change?",
        options: ["The target theorem", "The rewrite direction", "The type of h", "The kernel"],
        answer: 1,
        explanation: "The left arrow asks Lean to use the equality from right to left.",
      },
    ],
    recap: [
      "Definitional equality follows computation; propositional equality carries evidence.",
      "rfl, rw, simp, and calc serve different jobs.",
      "Rewrite direction is explicit.",
      "Automation is most useful when you can explain its result.",
    ],
  },
  {
    day: 7,
    phase: "Data & induction",
    title: "Data by constructors",
    subtitle: "Inductive types, pattern matching, recursion, and exhaustive thinking.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Define and use inductive data",
      "Read constructors as the complete set of possibilities",
      "Write structurally recursive functions",
    ],
    schedule: [
      { time: "09:00", activity: "Inductive definitions" },
      { time: "10:15", activity: "Pattern matching" },
      { time: "11:30", activity: "Natural numbers from zero and succ" },
      { time: "13:30", activity: "Lists from nil and cons" },
      { time: "15:00", activity: "Structural recursion and termination" },
      { time: "16:30", activity: "Lab: a tiny expression language" },
    ],
    sections: [
      {
        eyebrow: "Closed worlds",
        title: "Constructors are the legal ways to make a value.",
        paragraphs: [
          "An inductive declaration names a type and lists its constructors. Every value of that type was made by one of them. That completeness is why cases is sound: there are no secret alternatives hiding outside the list.",
          "Constructors can carry data. A Shape may be a circle carrying a radius or a rectangle carrying width and height. Pattern matching both identifies the constructor and exposes what it carries.",
        ],
        code: `inductive Shape where
  | circle (radius : Nat)
  | rectangle (width height : Nat)
  deriving Repr

def areaHint (shape : Shape) : Nat :=
  match shape with
  | .circle r => r * r
  | .rectangle w h => w * h`,
        takeaway: "An inductive type is a precise, exhaustive vocabulary of construction.",
      },
      {
        eyebrow: "Recursion",
        title: "Recursive functions follow recursive data.",
        paragraphs: [
          "Nat is built from zero and succ. List α is built from nil and cons. A structural recursive function handles each constructor and recursively processes smaller pieces contained by that constructor.",
          "Lean checks termination because definitions participate in logic. An unrestricted infinite loop could undermine the meaning of propositions-as-types. Structural recursion gives Lean an obvious decreasing argument.",
        ],
        diagram: {
          kind: "induction",
          items: ["[]", "x :: xs", "result for xs", "result for x :: xs"],
        },
        takeaway: "Let the constructors of the input write the skeleton of the function.",
      },
      {
        eyebrow: "Example",
        title: "List functions say what happens at nil and cons.",
        paragraphs: [
          "A list is either empty or one element followed by a smaller list. length returns zero for empty and one plus the recursive length for cons. map preserves the spine while transforming each head.",
          "This same two-case structure will become the proof plan for list induction tomorrow.",
        ],
        code: `def myLength {α : Type} : List α → Nat
  | [] => 0
  | _ :: xs => 1 + myLength xs

def myMap {α β : Type} (f : α → β) : List α → List β
  | [] => []
  | x :: xs => f x :: myMap f xs`,
        takeaway: "Programming by recursion and proving by induction are two views of the same data structure.",
      },
    ],
    lab: {
      title: "Build and evaluate expressions",
      brief: "Define arithmetic expressions and an evaluator.",
      steps: [
        "Create Expr with number, add, and multiply constructors.",
        "Write eval by pattern matching and recursion.",
        "Evaluate (2 + 3) * 4.",
        "Add a nodes function that counts expression-tree nodes.",
      ],
      starter: `inductive Expr where
  | number (value : Nat)
  | add (left right : Expr)
  | multiply (left right : Expr)

def eval : Expr → Nat
  | .number n => n
  | .add a b => ?
  | .multiply a b => ?`,
      solution: `def eval : Expr → Nat
  | .number n => n
  | .add a b => eval a + eval b
  | .multiply a b => eval a * eval b`,
    },
    quiz: [
      {
        question: "Why can cases cover every value of an inductive type?",
        options: ["Lean guesses extra cases", "Constructors list every way values are built", "All types are Boolean", "cases runs tests"],
        answer: 1,
        explanation: "The inductive declaration closes the set of constructors.",
      },
      {
        question: "Why does Lean care that recursive definitions terminate?",
        options: ["Only for speed", "Definitions affect computation and logical soundness", "To shorten names", "To enable comments"],
        answer: 1,
        explanation: "Total definitions preserve the intended logical interpretation.",
      },
    ],
    recap: [
      "Constructors define all legal inhabitants.",
      "Pattern matching is exhaustive elimination.",
      "Structural recursion follows smaller recursive fields.",
      "Data shape predicts both programs and proofs.",
    ],
  },
  {
    day: 8,
    phase: "Data & induction",
    title: "Induction is a proof engine",
    subtitle: "Why the induction hypothesis exists and how to use it deliberately.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Explain induction as exhaustive reasoning over construction",
      "Run Nat and List induction proofs",
      "Recognize when a statement needs strengthening",
    ],
    schedule: [
      { time: "09:00", activity: "From recursion to induction" },
      { time: "10:15", activity: "Base and step cases" },
      { time: "11:30", activity: "Natural number induction" },
      { time: "13:30", activity: "List induction" },
      { time: "15:00", activity: "Generalization and stronger claims" },
      { time: "16:30", activity: "Lab: length and append" },
    ],
    sections: [
      {
        eyebrow: "The logic",
        title: "Prove the constructor cases, and you have proved every value.",
        paragraphs: [
          "To prove P n for every natural number, prove P 0, then prove P (n + 1) assuming P n. The assumption P n is the induction hypothesis. It is licensed because succ values are built from a smaller Nat.",
          "This is not a leap of faith. Nat has only zero and succ; the induction principle is generated from that definition. List induction similarly has an empty case and a cons case with an induction hypothesis for the tail.",
        ],
        diagram: {
          kind: "induction",
          items: ["P 0", "assume P n", "prove P (n + 1)", "therefore ∀ n, P n"],
        },
        takeaway: "Induction is exhaustive reasoning aligned with recursive construction.",
      },
      {
        eyebrow: "A proof",
        title: "The induction hypothesis is a tool, not decoration.",
        paragraphs: [
          "After induction n with, the zero branch handles the base constructor. The succ branch receives n and ih. The goal usually simplifies until it contains exactly the smaller fact represented by ih.",
          "If the induction hypothesis is too specific to use, you may have introduced variables too early. Generalizing a variable keeps the statement strong enough for the recursive step.",
        ],
        code: `theorem zero_add (n : Nat) : 0 + n = n := by
  induction n with
  | zero =>
      rfl
  | succ n ih =>
      simp [Nat.add_succ, ih]`,
        codeNote: "Depending on imported libraries, simp may already know the relevant equations. The important point is where ih enters.",
        takeaway: "In the step case, search the goal for the smaller statement your induction hypothesis can solve.",
      },
      {
        eyebrow: "List pattern",
        title: "For list theorems, empty and cons are the natural branches.",
        paragraphs: [
          "Suppose you want to prove length (xs ++ ys) = length xs + length ys. Induct on xs because append recursively examines its first list. The empty case computes. The cons case reduces to the induction hypothesis on the tail.",
          "A good heuristic is to induct on the argument that the relevant recursive definition consumes.",
        ],
        code: `theorem length_append {α : Type} (xs ys : List α) :
    (xs ++ ys).length = xs.length + ys.length := by
  induction xs with
  | nil =>
      rfl
  | cons x xs ih =>
      simp [ih]`,
        takeaway: "Induct on the input whose structure drives the computation you need to reason about.",
      },
    ],
    lab: {
      title: "Prove append preserves length",
      brief: "Rebuild the theorem slowly, inspecting the goal after induction and after simplification.",
      steps: [
        "State the length_append theorem.",
        "Induct on xs, not ys, and explain why.",
        "Solve nil by reduction.",
        "In cons, identify the exact subexpression solved by ih.",
      ],
      starter: `theorem length_append {α : Type} (xs ys : List α) :
    (xs ++ ys).length = xs.length + ys.length := by
  induction xs with
  | nil => ?
  | cons x xs ih => ?`,
      solution: `theorem length_append {α : Type} (xs ys : List α) :
    (xs ++ ys).length = xs.length + ys.length := by
  induction xs with
  | nil => rfl
  | cons _ xs ih => simp [ih]`,
    },
    quiz: [
      {
        question: "Which list should you usually induct on for a theorem about xs ++ ys?",
        options: ["Always ys", "The list that append recursively examines: xs", "Neither", "The longer list"],
        answer: 1,
        explanation: "Following the recursive definition makes the proof reduce cleanly.",
      },
      {
        question: "What is the induction hypothesis in the cons case?",
        options: ["The final theorem for every list", "The property for the smaller tail", "A random assumption", "The empty case"],
        answer: 1,
        explanation: "The hypothesis supplies the theorem for the recursive substructure.",
      },
    ],
    recap: [
      "Induction principles come from inductive definitions.",
      "Base cases handle nonrecursive constructors.",
      "Step cases receive hypotheses for recursive fields.",
      "Induct on the argument driving the computation.",
    ],
  },
  {
    day: 9,
    phase: "Modeling",
    title: "Structures and interfaces",
    subtitle: "Bundle data with laws, then let type classes carry shared behavior.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Define structures and construct values",
      "Understand fields, projections, and invariants",
      "Recognize type classes as inferred interfaces",
    ],
    schedule: [
      { time: "09:00", activity: "Structures and records" },
      { time: "10:15", activity: "Data fields and proof fields" },
      { time: "11:30", activity: "Type classes as interfaces" },
      { time: "13:30", activity: "Instances and inference" },
      { time: "15:00", activity: "Coercions and notation, carefully" },
      { time: "16:30", activity: "Lab: verified account balances" },
    ],
    sections: [
      {
        eyebrow: "Bundling",
        title: "A structure gives names to related pieces.",
        paragraphs: [
          "A structure is a record type with named fields. It can bundle plain data, functions, and proofs. A value is constructed by supplying every required field; projections such as user.name retrieve them.",
          "When a structure contains a value and evidence about it, invalid states become unconstructable without also providing a proof. This is a central formal-modeling move.",
        ],
        code: `structure PositiveBalance where
  amount : Nat
  isPositive : amount > 0

def openingBalance : PositiveBalance where
  amount := 100
  isPositive := by decide`,
        codeNote: "The proof field depends on amount. Construction requires the data and its certificate together.",
        takeaway: "Structures can package an invariant beside the data it governs.",
      },
      {
        eyebrow: "Interfaces",
        title: "A type class states shared behavior; an instance supplies it.",
        paragraphs: [
          "Type classes are structures whose instances Lean can synthesize automatically from the surrounding types. Repr describes how values can be represented for debugging. BEq supplies Boolean equality. Add supplies addition notation.",
          "Square brackets in a parameter such as [Repr α] ask type-class inference to find an instance. This avoids manually threading dictionaries of operations through every call.",
        ],
        diagram: {
          kind: "pipeline",
          items: ["function needs [Repr α]", "Lean searches instances", "matching implementation", "operation available"],
        },
        takeaway: "Type classes are explicit requirements with implicit plumbing.",
      },
      {
        eyebrow: "Design",
        title: "Model only invariants that pay for their proof burden.",
        paragraphs: [
          "Putting a fact in a type can prevent entire bug classes, but it also means every constructor and transformation must maintain that fact. Choose invariants that matter at boundaries or enable important guarantees.",
          "A useful formal model is not the most complicated one. It is the smallest model that makes the desired theorem precise and tractable.",
        ],
        takeaway: "Strong types are a design budget: spend them on valuable guarantees.",
      },
    ],
    lab: {
      title: "A withdrawal with a precondition",
      brief: "Model an account and a withdrawal that requires evidence of sufficient funds.",
      steps: [
        "Define Account with a balance field.",
        "Define canWithdraw as amount ≤ balance.",
        "Write withdraw accepting h : canWithdraw account amount.",
        "Return an Account whose balance is reduced by amount.",
      ],
      starter: `structure Account where
  balance : Nat

def canWithdraw (account : Account) (amount : Nat) : Prop :=
  amount ≤ account.balance

def withdraw (account : Account) (amount : Nat)
    (h : canWithdraw account amount) : Account :=
  ?`,
      solution: `def withdraw (account : Account) (amount : Nat)
    (_h : canWithdraw account amount) : Account :=
  { balance := account.balance - amount }`,
    },
    quiz: [
      {
        question: "What can a Lean structure field contain?",
        options: ["Only numbers", "Only functions", "Data, functions, or proofs", "Only strings"],
        answer: 2,
        explanation: "Structures can bundle heterogeneous fields, including dependent proof fields.",
      },
      {
        question: "What does [Repr α] ask Lean to do?",
        options: ["Create a new α", "Infer a Repr instance for α", "Prove α is false", "Convert α to Nat"],
        answer: 1,
        explanation: "Square-bracket parameters are synthesized by type-class inference.",
      },
    ],
    recap: [
      "Structures are named records.",
      "Proof fields can enforce invariants at construction.",
      "Type classes describe inferred shared behavior.",
      "Model the smallest invariant set that supports the goal.",
    ],
  },
  {
    day: 10,
    phase: "Automation",
    title: "Use automation without losing the plot",
    subtitle: "simp, decide, omega, theorem search, and trustworthy convenience.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Choose lightweight automation appropriately",
      "Inspect what automated tactics leave behind",
      "Search libraries by type and theorem shape",
    ],
    schedule: [
      { time: "09:00", activity: "What automation may and may not do" },
      { time: "10:15", activity: "simp sets and normalization" },
      { time: "11:30", activity: "Decidable propositions and decide" },
      { time: "13:30", activity: "Arithmetic automation" },
      { time: "15:00", activity: "Theorem discovery workflow" },
      { time: "16:30", activity: "Lab: refactor manual proofs" },
    ],
    sections: [
      {
        eyebrow: "Trust boundary",
        title: "A tactic can be clever because its output is still checked.",
        paragraphs: [
          "Automation searches for or constructs proof terms. The kernel checks the result. That means you can use productive tactics without expanding the trusted base to include every tactic implementation.",
          "Still, maintainability matters. A two-line simp proof may become fragile if it relies on a huge, shifting simplifier context. Prefer small explicit lemma sets when the important reasoning should be visible.",
        ],
        diagram: {
          kind: "proof",
          items: ["automation search", "candidate proof term", "kernel verification", "accepted theorem"],
        },
        takeaway: "Trust the kernel check; understand the proof’s conceptual dependencies.",
      },
      {
        eyebrow: "Decision procedures",
        title: "Some propositions can be computed.",
        paragraphs: [
          "A proposition is decidable when Lean has a procedure that returns evidence for it or its negation. For concrete decidable goals, by decide can generate a proof by computation. Arithmetic tactics handle richer fragments with specialized algorithms.",
          "Automation is domain-specific. simp normalizes by rewrite rules; decide computes a decision instance; omega solves Presburger arithmetic over naturals and integers when available. Choose the tool that matches the structure.",
        ],
        code: `example : (21 : Nat) < 34 := by
  decide

example (n : Nat) : n + 0 = n := by
  simp`,
        codeNote: "Some tactics require imports such as Mathlib. The core course marks those points rather than pretending every environment is identical.",
        takeaway: "Name the problem fragment before choosing the automated solver.",
      },
      {
        eyebrow: "Search",
        title: "Search by the gap in your proof, not by guessed English names.",
        paragraphs: [
          "First describe the missing theorem as a type. Use #check on likely namespaces, editor completion, documentation search, and tools such as exact? or apply? when available. The name matters less than the input-output shape.",
          "When you find a theorem, inspect its full type and arguments. Do not cargo-cult a line that happens to close today’s goal.",
        ],
        diagram: {
          kind: "pipeline",
          items: ["Describe missing type", "Search", "#check candidate", "apply deliberately"],
        },
        takeaway: "Library fluency is the skill of recognizing useful theorem shapes.",
      },
    ],
    lab: {
      title: "Refactor a proof ladder",
      brief: "Solve each theorem manually, then shorten it with justified automation.",
      steps: [
        "Prove n + 0 = n by a library theorem or induction.",
        "Try simp and note which version is clearer.",
        "Prove a concrete inequality with decide.",
        "Write a one-line comment naming the reason each automated proof is safe.",
      ],
      starter: `example (n : Nat) : n + 0 = n := by
  ?

example : (8 : Nat) ≤ 13 := by
  ?`,
      solution: `example (n : Nat) : n + 0 = n := by
  simp

example : (8 : Nat) ≤ 13 := by
  decide`,
    },
    quiz: [
      {
        question: "Why can a complex tactic remain outside the trusted kernel?",
        options: ["Tactics never have bugs", "The kernel checks the produced proof term", "The editor trusts all output", "Automation only handles Booleans"],
        answer: 1,
        explanation: "A faulty tactic may fail, but it cannot make the kernel accept an ill-typed proof term.",
      },
      {
        question: "What is the best first step in theorem search?",
        options: ["Guess random names", "Describe the missing fact as a type", "Use the biggest tactic", "Rewrite everything"],
        answer: 1,
        explanation: "The theorem’s input-output shape guides precise search.",
      },
    ],
    recap: [
      "Automation constructs evidence that the kernel checks.",
      "Different tactics solve different problem fragments.",
      "Explicit dependencies improve maintainability.",
      "Search begins with the type of the missing fact.",
    ],
  },
  {
    day: 11,
    phase: "Verification",
    title: "From code to specification",
    subtitle: "Preconditions, postconditions, invariants, and what you actually meant.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Turn an informal requirement into a precise proposition",
      "Separate implementation from specification",
      "Identify vacuous, weak, and overstrong specifications",
    ],
    schedule: [
      { time: "09:00", activity: "What makes a useful specification" },
      { time: "10:15", activity: "Preconditions and postconditions" },
      { time: "11:30", activity: "Loop and recursive invariants" },
      { time: "13:30", activity: "Refinement through examples" },
      { time: "15:00", activity: "Specification failure modes" },
      { time: "16:30", activity: "Lab: verify maximum" },
    ],
    sections: [
      {
        eyebrow: "The real work",
        title: "Lean proves what you wrote, not what you vaguely intended.",
        paragraphs: [
          "Formal verification moves ambiguity earlier. “The result is correct” is not a proposition. For a maximum function, you might require that the result is an element of the input and that every input element is at most the result. If the list may be empty, the return type or precondition must address that case.",
          "A theorem can be perfectly proved and still useless because the specification was too weak. Examples and counterexamples remain vital for reviewing the statement.",
        ],
        diagram: {
          kind: "pipeline",
          items: ["Requirement", "Examples", "Formal spec", "Implementation", "Correctness proof"],
        },
        takeaway: "Specification is the bridge between human intent and machine-checkable truth.",
      },
      {
        eyebrow: "Contracts",
        title: "A precondition limits the promise; a postcondition describes the result.",
        paragraphs: [
          "A theorem shaped like pre input → post input (f input) says the function meets its postcondition whenever the caller supplies the precondition. Stronger preconditions make proofs easier but the function less generally usable. Stronger postconditions make the result more useful but harder to prove.",
          "Good API design balances these forces and makes exceptional cases visible in types such as Option, Except, or a proof-carrying input.",
        ],
        code: `def safeHead {α : Type} : List α → Option α
  | [] => none
  | x :: _ => some x

theorem safeHead_cons {α : Type} (x : α) (xs : List α) :
    safeHead (x :: xs) = some x := by
  rfl`,
        takeaway: "Types can express failure; theorems describe behavior under precise conditions.",
      },
      {
        eyebrow: "Review",
        title: "Attack the statement before celebrating the proof.",
        paragraphs: [
          "Check that the theorem excludes impossible inputs, covers important outputs, and does not become true for trivial reasons. A postcondition of True is easy to prove and says nothing. An implication with an impossible premise is also trivially true.",
          "Try small counterexamples to the statement. Then ask whether downstream code can use the theorem to establish what it needs.",
        ],
        takeaway: "A short proof may signal elegance—or an accidentally weak statement.",
      },
    ],
    lab: {
      title: "Specify a maximum candidate",
      brief: "Write the specification before attempting a full implementation proof.",
      steps: [
        "Define IsUpperBound xs m as every element of xs being ≤ m.",
        "Add a condition that m occurs in xs.",
        "Explain why upper-bound alone permits absurdly large answers.",
        "Choose Option Nat or a nonempty-list precondition for the implementation.",
      ],
      starter: `def IsUpperBound (xs : List Nat) (m : Nat) : Prop :=
  ∀ x, x ∈ xs → x ≤ m

def IsMaximum (xs : List Nat) (m : Nat) : Prop :=
  ?`,
      solution: `def IsMaximum (xs : List Nat) (m : Nat) : Prop :=
  m ∈ xs ∧ IsUpperBound xs m`,
    },
    quiz: [
      {
        question: "Why is “m is an upper bound” alone too weak for maximum?",
        options: ["It is not a proposition", "Any sufficiently large m could satisfy it", "It cannot mention lists", "Lean rejects ≤"],
        answer: 1,
        explanation: "A maximum should also be attained by an element of the collection.",
      },
      {
        question: "What does a precondition do?",
        options: ["Describes allowed inputs for the guarantee", "Computes the result", "Replaces the proof", "Hides errors"],
        answer: 0,
        explanation: "The guarantee applies when the stated precondition is met.",
      },
    ],
    recap: [
      "Formalization exposes ambiguity.",
      "Preconditions scope promises; postconditions characterize results.",
      "Examples test whether a statement captures intent.",
      "Proved does not automatically mean useful.",
    ],
  },
  {
    day: 12,
    phase: "Verification",
    title: "Prove a small program correct",
    subtitle: "A complete loop: define, specify, prove, test, and review.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Connect recursive implementation structure to a correctness proof",
      "Use helper lemmas and layered specifications",
      "Refactor a proof without changing the theorem",
    ],
    schedule: [
      { time: "09:00", activity: "Case study: list reverse" },
      { time: "10:15", activity: "State preservation properties" },
      { time: "11:30", activity: "Prove length preservation" },
      { time: "13:30", activity: "Prove reverse twice is identity" },
      { time: "15:00", activity: "Helper lemmas and refactoring" },
      { time: "16:30", activity: "Lab: verified filter property" },
    ],
    sections: [
      {
        eyebrow: "Layering",
        title: "Start with cheap properties before the headline theorem.",
        paragraphs: [
          "For reverse, length preservation is simpler than proving that reversing twice returns the original list. The easy theorem exercises the definition and gives you a reusable fact. Formal developments grow through such layers.",
          "Avoid writing one giant proof. Name helper lemmas when they describe stable concepts, reduce repeated reasoning, or make the main proof read like an argument.",
        ],
        diagram: {
          kind: "pipeline",
          items: ["Definition", "Computation lemmas", "Preservation lemmas", "Main theorem"],
        },
        takeaway: "A theorem library is an API for later proofs.",
      },
      {
        eyebrow: "Alignment",
        title: "The program’s recursion suggests the proof’s induction.",
        paragraphs: [
          "If a function recurses on xs, inducting on xs exposes the same branches and reduces recursive calls. In each step, unfold only enough of the function to reveal the induction hypothesis.",
          "When the implementation uses an accumulator, the obvious theorem may be too weak. Prove a generalized helper theorem that relates arbitrary accumulator contents to the final result.",
        ],
        code: `theorem length_reverse {α : Type} (xs : List α) :
    xs.reverse.length = xs.length := by
  induction xs with
  | nil => rfl
  | cons x xs ih =>
      simp [List.reverse, ih]`,
        codeNote: "Library definitions and simp lemmas can evolve; the enduring method is induction aligned with recursion.",
        takeaway: "Match the proof decomposition to the computation decomposition.",
      },
      {
        eyebrow: "Engineering",
        title: "Proofs are maintained artifacts.",
        paragraphs: [
          "A good proof communicates why the theorem holds, localizes dependencies, and remains stable under harmless implementation changes. Short is not always clearer; explicit intermediate facts can be valuable.",
          "Refactoring can replace repeated tactic sequences with lemmas, tighten simp arguments, and rename hypotheses. The theorem statement is the external contract; the proof body is an implementation.",
        ],
        takeaway: "Review proof code for readability and dependency control, just like production code.",
      },
    ],
    lab: {
      title: "Filter never increases length",
      brief: "Prove that filtering a list produces a list no longer than the input.",
      steps: [
        "State the theorem for a Boolean predicate.",
        "Induct on xs.",
        "In the cons case, split on the predicate result.",
        "Use the induction hypothesis in both branches.",
      ],
      starter: `theorem length_filter_le {α : Type}
    (p : α → Bool) (xs : List α) :
    (xs.filter p).length ≤ xs.length := by
  induction xs with
  | nil => ?
  | cons x xs ih => ?`,
      solution: `theorem length_filter_le {α : Type}
    (p : α → Bool) (xs : List α) :
    (xs.filter p).length ≤ xs.length := by
  induction xs with
  | nil => simp
  | cons x xs ih =>
      simp only [List.filter]
      split <;> simp [ih]`,
    },
    quiz: [
      {
        question: "Why prove helper lemmas?",
        options: ["To make files longer", "To package stable reusable reasoning", "To bypass the kernel", "To avoid specifications"],
        answer: 1,
        explanation: "Good helpers reduce repetition and make the main argument legible.",
      },
      {
        question: "What often happens with accumulator-based functions?",
        options: ["No proof is possible", "You need a more general induction statement", "They are always definitionally equal", "They disable simp"],
        answer: 1,
        explanation: "A generalized statement supplies an induction hypothesis strong enough for arbitrary accumulator states.",
      },
    ],
    recap: [
      "Build correctness in layers.",
      "Align induction with recursion.",
      "Generalize when the induction hypothesis is too weak.",
      "Treat proofs as maintainable code.",
    ],
  },
  {
    day: 13,
    phase: "Real-world Lean",
    title: "Projects, libraries, and Mathlib",
    subtitle: "Move from isolated examples to a navigable formal development.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Understand Lean projects, modules, imports, and namespaces",
      "Navigate documentation and source",
      "Adopt a sustainable theorem-discovery workflow",
    ],
    schedule: [
      { time: "09:00", activity: "Toolchain, Lake, and project shape" },
      { time: "10:15", activity: "Imports and namespaces" },
      { time: "11:30", activity: "Reading library declarations" },
      { time: "13:30", activity: "Mathlib’s role and conventions" },
      { time: "15:00", activity: "Errors, traces, and minimal examples" },
      { time: "16:30", activity: "Lab: organize a mini library" },
    ],
    sections: [
      {
        eyebrow: "Project map",
        title: "A Lean project is a dependency graph of modules.",
        paragraphs: [
          "Files become modules. import makes declarations from another module available. namespace organizes names and prevents collisions. Lake manages project configuration and dependencies, while elan manages Lean toolchains.",
          "Pinning a toolchain matters because syntax, tactics, and library APIs evolve. A reproducible project records which Lean version it expects.",
        ],
        diagram: {
          kind: "pipeline",
          items: ["lean-toolchain", "lakefile", "modules", "imports", "checked build"],
        },
        takeaway: "Reproducibility begins with explicit toolchain and dependency versions.",
      },
      {
        eyebrow: "Mathlib",
        title: "The library is a language you learn by reading types.",
        paragraphs: [
          "Mathlib is a large community library of mathematics, tactics, and supporting infrastructure. You do not memorize it. You learn naming patterns, namespaces, common abstractions, and how to inspect candidate theorems.",
          "Use minimal imports while learning so you know where capabilities come from. In application work, broader imports may be practical. Either way, understand whether a tactic or theorem is core Lean or provided by Mathlib.",
        ],
        takeaway: "Library skill is navigation, not memorization.",
      },
      {
        eyebrow: "Debugging",
        title: "Reduce confusing failures to the smallest example.",
        paragraphs: [
          "Copy the statement, its necessary definitions, and imports into a small scratch file. Remove context until the issue becomes obvious or reproducible. Check inferred types with #check and inspect definitions with #print.",
          "Read errors from the first mismatch. Later messages are often consequences. Record the expected type, actual type, and the expression Lean was elaborating.",
        ],
        diagram: {
          kind: "pipeline",
          items: ["Failure", "Minimal example", "Inspect types", "Fix concept", "Return to project"],
        },
        takeaway: "A minimal failing example turns confusion into a focused type mismatch.",
      },
    ],
    lab: {
      title: "Organize a three-file mini library",
      brief: "Plan modules for data, implementation, and proofs. The exercise is architectural even if you use one file today.",
      steps: [
        "Put domain types in Model.",
        "Put pure functions in Operations importing Model.",
        "Put theorems in Verification importing Operations.",
        "Use a namespace and write the import graph in words.",
      ],
      starter: `namespace Course

structure Account where
  balance : Nat

def deposit (a : Account) (amount : Nat) : Account :=
  { balance := a.balance + amount }

theorem deposit_balance (a : Account) (amount : Nat) :
    (deposit a amount).balance = a.balance + amount := by
  ?

end Course`,
      solution: `theorem deposit_balance (a : Account) (amount : Nat) :
    (deposit a amount).balance = a.balance + amount := by
  rfl`,
    },
    quiz: [
      {
        question: "What is the purpose of lean-toolchain?",
        options: ["Store proofs", "Pin the expected Lean toolchain", "Replace imports", "Run tests only"],
        answer: 1,
        explanation: "Toolchain pinning makes builds reproducible across machines and time.",
      },
      {
        question: "What is the best attitude toward Mathlib?",
        options: ["Memorize every theorem", "Navigate by types, namespaces, and patterns", "Avoid reading declarations", "Use automation blindly"],
        answer: 1,
        explanation: "Effective users search and inspect rather than memorizing a huge library.",
      },
    ],
    recap: [
      "Projects record toolchains, dependencies, and module structure.",
      "Imports and namespaces organize declarations.",
      "Mathlib fluency comes from navigation.",
      "Minimal examples are a primary debugging technique.",
    ],
  },
  {
    day: 14,
    phase: "Capstone",
    title: "Ship a verified tiny system",
    subtitle: "Model a counter, prove its safety story, and design your next month.",
    duration: "8 hours · 6 study blocks",
    goals: [
      "Complete a small end-to-end verification project",
      "Explain the trust story and limits of the result",
      "Create a realistic continuation plan",
    ],
    schedule: [
      { time: "09:00", activity: "Choose and refine the model" },
      { time: "10:15", activity: "Implement operations" },
      { time: "11:30", activity: "State local correctness theorems" },
      { time: "13:30", activity: "Prove the sequence invariant" },
      { time: "15:00", activity: "Review assumptions and gaps" },
      { time: "16:30", activity: "Present, reflect, and plan next steps" },
    ],
    sections: [
      {
        eyebrow: "Capstone brief",
        title: "Verify a bounded counter, one guarantee at a time.",
        paragraphs: [
          "Model a counter with a current value and a maximum. Define increment so it never exceeds the maximum—either return none at the boundary or clamp the value. State the behavior precisely for both cases.",
          "Then define a function that applies a list of commands. Prove a safety invariant: every reachable counter value remains at most the maximum. This combines structures, recursion, conditionals, specifications, helper lemmas, and induction.",
        ],
        diagram: {
          kind: "pipeline",
          items: ["Model", "Operations", "Local lemmas", "Sequence invariant", "Review"],
        },
        takeaway: "End-to-end verification is a chain of small, composable guarantees.",
      },
      {
        eyebrow: "Review",
        title: "Say exactly what is trusted—and exactly what is not proved.",
        paragraphs: [
          "Your result depends on Lean’s kernel, the theorem statement, definitions, any axioms used, and the faithful connection between the model and the real system. You have not proved that a separate production implementation matches the model unless you establish that link.",
          "A professional verification report includes scope, assumptions, theorem statements, toolchain versions, and known gaps. Precision about limits strengthens trust.",
        ],
        takeaway: "Formal proof gives certainty about a model and statement, not automatic certainty about every real-world interpretation.",
      },
      {
        eyebrow: "Continuation",
        title: "Comfort comes from daily proof reading, not one heroic sprint.",
        paragraphs: [
          "After this course, spend a month alternating three activities: solve small exercises, read good library proofs, and extend one personal project. Keep a proof journal containing goal shapes, useful lemmas, failed approaches, and the reason the final proof works.",
          "You are now ready to choose a direction: formalized mathematics with Mathematics in Lean, programming and dependent types with Functional Programming in Lean, or verification projects using Lean and Mathlib.",
        ],
        diagram: {
          kind: "pipeline",
          items: ["Exercises", "Read proofs", "Build project", "Write reflection", "Repeat"],
        },
        takeaway: "The next milestone is independent problem solving, not knowing every tactic.",
      },
    ],
    lab: {
      title: "Bounded counter safety",
      brief: "Complete the capstone in layers. Preserve the invariant value ≤ maximum.",
      steps: [
        "Define BoundedCounter with value, maximum, and an invariant proof.",
        "Define increment with an if that either increases safely or returns the original.",
        "Prove a local theorem describing each branch.",
        "Define applyMany and prove its output invariant by induction on the command list.",
        "Write a five-sentence verification report naming assumptions and gaps.",
      ],
      starter: `structure BoundedCounter where
  value : Nat
  maximum : Nat
  valid : value ≤ maximum

def increment (c : BoundedCounter) : BoundedCounter :=
  if h : c.value < c.maximum then
    { value := c.value + 1
      maximum := c.maximum
      valid := by omega }
  else
    c`,
      solution: `-- With Mathlib imported, omega can discharge the arithmetic.
-- The structure itself ensures every returned counter carries valid:
theorem increment_safe (c : BoundedCounter) :
    (increment c).value ≤ (increment c).maximum := by
  exact (increment c).valid`,
    },
    quiz: [
      {
        question: "What is the strongest honest claim about a proved model?",
        options: ["Every implementation everywhere is correct", "The formal statement holds for the formal definitions under their assumptions", "No bugs can exist in tooling", "The specification must match intent"],
        answer: 1,
        explanation: "Formal guarantees are exact and scoped; the modeling link must be argued separately.",
      },
      {
        question: "What should your next month emphasize?",
        options: ["Memorizing tactic names", "Repeated exercises, proof reading, and one evolving project", "Avoiding errors", "Only watching lectures"],
        answer: 1,
        explanation: "Active construction and reading develop independent proof judgment.",
      },
    ],
    recap: [
      "Verification composes local guarantees into system properties.",
      "Invariant-carrying structures make safety available by projection.",
      "Trust reports should name assumptions and model boundaries.",
      "Continued deliberate practice converts familiarity into fluency.",
    ],
  },
];

export const glossary = [
  { term: "Elaboration", definition: "The process that fills implicit details and turns convenient surface syntax into a precise core term." },
  { term: "Goal", definition: "The proposition currently requiring a proof." },
  { term: "Hypothesis", definition: "Evidence available in the local proof context." },
  { term: "Inductive type", definition: "A type defined by a complete set of constructors, such as Nat or List." },
  { term: "Invariant", definition: "A property intended to remain true across allowed state changes." },
  { term: "ITP", definition: "Interactive theorem proving: human-guided construction of machine-checked proofs." },
  { term: "Kernel", definition: "Lean’s small trusted core that checks proof terms." },
  { term: "Proof term", definition: "A term whose type is the proposition it proves." },
  { term: "Proposition", definition: "A type in Prop representing a logical claim." },
  { term: "Specification", definition: "A precise statement of required behavior or properties." },
  { term: "Tactic", definition: "A command that transforms proof goals while constructing a proof term." },
  { term: "Type class", definition: "A structure used as an interface whose instances Lean can infer automatically." },
];

export const sources = [
  {
    title: "Theorem Proving in Lean 4",
    url: "https://leanprover.github.io/theorem_proving_in_lean4/",
    note: "The core proof-oriented companion; examples currently target Lean 4.26.",
  },
  {
    title: "Functional Programming in Lean",
    url: "https://lean-lang.org/functional_programming_in_lean/",
    note: "The official book on Lean as a functional programming language.",
  },
  {
    title: "Lean Language Reference",
    url: "https://lean-lang.org/doc/reference/latest/",
    note: "Precise reference material; use it to look things up rather than as a first tutorial.",
  },
  {
    title: "Lean 4 documentation",
    url: "https://lean-lang.org/learn/",
    note: "Installation, learning paths, and the official documentation overview.",
  },
];
