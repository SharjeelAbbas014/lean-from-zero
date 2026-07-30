export type MiniGame = {
  title: string;
  prompt: string;
  starterCode?: string;
  states: { context: string[]; goal: string }[];
  steps: {
    choices: string[];
    correct: string;
    success: string;
    wrongHint: string;
  }[];
};

export type PlayQuest = {
  title: string;
  why: string;
  url: string;
  eta: string;
};

export type LabCheck = {
  prompt: string;
  options: string[];
  answer: number;
  explanation: string;
};

export type DayPlay = {
  miniGame: MiniGame;
  playQuests: PlayQuest[];
  extraQuiz: {
    question: string;
    options: string[];
    answer: number;
    explanation: string;
  }[];
  labChecks?: LabCheck[];
};

const NNG = "https://adam.math.hhu.de/#/g/leanprover-community/nng4";
const GAMES_HOME = "https://adam.math.hhu.de/";
const LOGIC_GAME = "https://adam.math.hhu.de/#/g/trequetrum/lean4game-logic";
const SET_GAME = "https://adam.math.hhu.de/#/g/djvelleman/stg4";

export const dayPlay: Record<number, DayPlay> = {
  1: {
    miniGame: {
      title: "Predict the report",
      prompt: "What will #check say? Pick the report that matches the expression.",
      starterCode: `#check true\n#check (2 : Nat)`,
      states: [
        { context: ["expression: true"], goal: "#check true  ⇒  ?" },
        { context: ["expression: Nat.succ"], goal: "#check Nat.succ  ⇒  ?" },
        { context: ["done"], goal: "Both reports predicted." },
      ],
      steps: [
        {
          choices: ["true : Bool", "true : Nat", "true : Prop"],
          correct: "true : Bool",
          success: "Yes. true is a Boolean value.",
          wrongHint: "true and false inhabit Bool, not Nat.",
        },
        {
          choices: ["Nat.succ : Nat", "Nat.succ : Nat → Nat", "Nat.succ : Bool"],
          correct: "Nat.succ : Nat → Nat",
          success: "succ is a function from Nat to Nat.",
          wrongHint: "Ask what you must give succ before it returns a Nat.",
        },
      ],
    },
    playQuests: [
      {
        title: "Natural Number Game — Tutorial",
        why: "Feel Lean as a game before any theory sinks in.",
        url: NNG,
        eta: "20–40 min",
      },
    ],
    extraQuiz: [
      {
        question: "What does #eval do?",
        options: [
          "Deletes a definition",
          "Computes a value when possible",
          "Accepts a proof without checking",
          "Opens the documentation",
        ],
        answer: 1,
        explanation: "#eval asks Lean to evaluate a computable expression.",
      },
      {
        question: "Why is a failed #check still useful?",
        options: [
          "It proves the claim",
          "The error describes a type mismatch",
          "It installs Mathlib",
          "It skips the kernel",
        ],
        answer: 1,
        explanation: "Error messages are evidence about what Lean expected versus what you wrote.",
      },
    ],
    labChecks: [
      {
        prompt: "What does #eval 6 * 7 report?",
        options: ["6 * 7 : Nat", "42", "True", "Nat"],
        answer: 1,
        explanation: "#eval computes; 6 * 7 reduces to 42.",
      },
    ],
  },
  2: {
    miniGame: {
      title: "Read the signature",
      prompt: "Match each type to what it promises.",
      states: [
        { context: ["f : Nat → Bool"], goal: "What can you give f?" },
        { context: ["g : String → String"], goal: "What does g return?" },
        { context: ["done"], goal: "Signatures read." },
      ],
      steps: [
        {
          choices: ["A Nat", "A Bool", "A String"],
          correct: "A Nat",
          success: "The left of → is the input.",
          wrongHint: "A → B means: give an A, get a B.",
        },
        {
          choices: ["A Nat", "A Bool", "A String"],
          correct: "A String",
          success: "The right of → is the output.",
          wrongHint: "Look at the type after the arrow.",
        },
      ],
    },
    playQuests: [
      {
        title: "Natural Number Game — early worlds",
        why: "Practice naming and using simple definitions in levels.",
        url: NNG,
        eta: "30–60 min",
      },
    ],
    extraQuiz: [
      {
        question: "How do you apply a function f to argument x in Lean?",
        options: ["f(x)", "f x", "f.apply(x)", "call f x"],
        answer: 1,
        explanation: "Lean uses juxtaposition: f x.",
      },
      {
        question: "What is a dependent type, in one sentence?",
        options: [
          "A type that never mentions values",
          "A type that can mention values",
          "A type only for Booleans",
          "A type that skips checking",
        ],
        answer: 1,
        explanation: "Dependent types can include measured facts, like a length, inside the type.",
      },
    ],
  },
  3: {
    miniGame: {
      title: "Evidence shapes",
      prompt: "What evidence does each connective demand?",
      states: [
        { context: ["goal: P ∧ Q"], goal: "What do you need?" },
        { context: ["goal: P → Q"], goal: "What kind of evidence closes it?" },
        { context: ["done"], goal: "Shapes matched." },
      ],
      steps: [
        {
          choices: ["Only P", "Only Q", "Both P and Q", "Either P or Q"],
          correct: "Both P and Q",
          success: "Conjunction packages both sides.",
          wrongHint: "∧ is product-like: both components.",
        },
        {
          choices: ["A Boolean", "A function from proofs of P to proofs of Q", "A witness x", "A comment"],
          correct: "A function from proofs of P to proofs of Q",
          success: "Implication is a function on proofs.",
          wrongHint: "Curry–Howard: → corresponds to a function type.",
        },
      ],
    },
    playQuests: [
      {
        title: "Logic Game",
        why: "Practice building propositional evidence as levels.",
        url: LOGIC_GAME,
        eta: "30–50 min",
      },
    ],
    extraQuiz: [
      {
        question: "What universe do propositions live in?",
        options: ["Type", "Prop", "Bool", "Sort 99"],
        answer: 1,
        explanation: "Prop is the universe of logical claims.",
      },
      {
        question: "A proof term is…",
        options: [
          "A comment next to a theorem",
          "A term whose type is the claim",
          "Any tactic script",
          "A failing test",
        ],
        answer: 1,
        explanation: "The kernel checks that the term inhabits the stated proposition.",
      },
    ],
  },
  4: {
    miniGame: {
      title: "Watch a proof state change",
      prompt: "Choose the move that matches the outer shape of the goal.",
      starterCode: `example (P : Prop) : P → P := by\n  ?`,
      states: [
        { context: ["P : Prop"], goal: "P → P" },
        { context: ["P : Prop", "h : P"], goal: "P" },
        { context: ["P : Prop", "h : P"], goal: "No goals. Proof complete." },
      ],
      steps: [
        {
          choices: ["intro h", "rfl", "constructor"],
          correct: "intro h",
          success: "intro assumes the left side of the arrow and names that evidence h.",
          wrongHint: "rfl is for equalities. The outer shape here is an implication.",
        },
        {
          choices: ["exact h", "rfl", "intro q"],
          correct: "exact h",
          success: "The goal asks for P, and h is evidence of exactly P.",
          wrongHint: "You already have h : P in the context.",
        },
      ],
    },
    playQuests: [
      {
        title: "Logic Game — implication levels",
        why: "Drill intro / exact / apply with real Lean feedback.",
        url: LOGIC_GAME,
        eta: "20–40 min",
      },
      {
        title: "Natural Number Game",
        why: "Same proof-state habit on arithmetic goals.",
        url: NNG,
        eta: "optional",
      },
    ],
    extraQuiz: [
      {
        question: "Above the turnstile ⊢ you find…",
        options: ["The goal only", "Local context / hypotheses", "The kernel", "Mathlib"],
        answer: 1,
        explanation: "Context is above; the goal is below the turnstile.",
      },
      {
        question: "assumption closes a goal when…",
        options: [
          "Any tactic exists",
          "Some hypothesis already matches the goal",
          "The goal is False",
          "You are in Prop",
        ],
        answer: 1,
        explanation: "assumption searches the context for an exact match.",
      },
    ],
  },
  5: {
    miniGame: {
      title: "Outer connective first",
      prompt: "Pick the tactic that fits the goal’s outermost shape.",
      states: [
        { context: ["P Q : Prop", "h : P ∧ Q"], goal: "Q ∧ P" },
        { context: ["P Q : Prop", "h : P ∨ Q"], goal: "Q ∨ P" },
        { context: ["done"], goal: "Connectives handled." },
      ],
      steps: [
        {
          choices: ["intro", "constructor", "rfl", "exact h"],
          correct: "constructor",
          success: "Goal ∧ wants both sides; constructor splits into two subgoals.",
          wrongHint: "Building a conjunction means producing both components.",
        },
        {
          choices: ["cases h", "rfl", "simp", "omega"],
          correct: "cases h",
          success: "Or in the hypothesis: open the two branches with cases.",
          wrongHint: "When evidence is a sum, eliminate it with cases.",
        },
      ],
    },
    playQuests: [
      {
        title: "Logic Game",
        why: "∧, ∨, ¬, and quantifier levels map to today’s tools.",
        url: LOGIC_GAME,
        eta: "40–60 min",
      },
    ],
    extraQuiz: [
      {
        question: "left and right are typically used when the goal is…",
        options: ["P ∧ Q", "P ∨ Q", "P → Q", "P = Q"],
        answer: 1,
        explanation: "Disjunction goals are closed by choosing a side.",
      },
      {
        question: "A proof of ∃ x, P x needs…",
        options: ["Only ∀", "A witness and a proof of P witness", "Only False", "A Boolean"],
        answer: 1,
        explanation: "Existence packages a concrete witness with property evidence.",
      },
    ],
  },
  6: {
    miniGame: {
      title: "Equality moves",
      prompt: "Which equality tactic fits?",
      states: [
        { context: ["n : Nat"], goal: "n + 0 = n" },
        { context: ["a b : Nat", "h : a = b"], goal: "b = a" },
        { context: ["done"], goal: "Equality toolkit sampled." },
      ],
      steps: [
        {
          choices: ["rfl", "cases", "intro", "left"],
          correct: "rfl",
          success: "Both sides reduce to the same expression; rfl finishes.",
          wrongHint: "If definitional reduction makes both sides identical, try rfl.",
        },
        {
          choices: ["rw [h]", "rw [← h]", "constructor", "exact h"],
          correct: "rw [← h]",
          success: "You need to flip a = b to rewrite b into a (or use Eq.symm).",
          wrongHint: "Goal is b = a while h says a = b — reverse the rewrite.",
        },
      ],
    },
    playQuests: [
      {
        title: "Natural Number Game — Addition / Multiplication",
        why: "rw and rfl show up constantly in early arithmetic worlds.",
        url: NNG,
        eta: "30–50 min",
      },
    ],
    extraQuiz: [
      {
        question: "simp is best thought of as…",
        options: [
          "A trusted kernel replacement",
          "A rewriting engine with a curated lemma set",
          "A way to skip proofs",
          "Only for Booleans",
        ],
        answer: 1,
        explanation: "simp rewrites using simp lemmas; the kernel still checks the result.",
      },
      {
        question: "calc is useful when…",
        options: [
          "You need a chain of equalities written step by step",
          "The goal is a disjunction",
          "You want to disable types",
          "You are only evaluating",
        ],
        answer: 0,
        explanation: "calc presents a readable equality (or relation) chain.",
      },
    ],
  },
  7: {
    miniGame: {
      title: "Follow the constructors",
      prompt: "How do you consume inductive data?",
      states: [
        { context: ["xs : List Nat"], goal: "prove something about every list" },
        { context: ["h : Option Nat"], goal: "branch on whether a value exists" },
        { context: ["done"], goal: "Data shape read." },
      ],
      steps: [
        {
          choices: ["cases xs / induction", "rfl only", "exact xs", "left"],
          correct: "cases xs / induction",
          success: "Lists are nil or cons — eliminate those constructors.",
          wrongHint: "Inductive types are handled by cases or induction.",
        },
        {
          choices: ["cases h", "rw [h]", "intro h", "omega"],
          correct: "cases h",
          success: "Option is none or some — cases opens both.",
          wrongHint: "Option has two constructors; eliminate them.",
        },
      ],
    },
    playQuests: [
      {
        title: "Natural Number Game",
        why: "Nat is the classic inductive type; games train constructor thinking.",
        url: NNG,
        eta: "30–60 min",
      },
    ],
    extraQuiz: [
      {
        question: "Why must recursive Lean definitions terminate?",
        options: [
          "Only for speed",
          "To keep computation and logic sound",
          "To enable comments",
          "Because Prop forbids recursion",
        ],
        answer: 1,
        explanation: "Total definitions preserve the intended logical meaning.",
      },
      {
        question: "match / cases is exhaustive because…",
        options: [
          "Lean invents missing cases",
          "Constructors list every way to build a value",
          "All types are finite",
          "The editor fills them in",
        ],
        answer: 1,
        explanation: "The inductive declaration closes the set of constructors.",
      },
    ],
  },
  8: {
    miniGame: {
      title: "Induction habit",
      prompt: "What does the step case give you?",
      states: [
        { context: ["goal about lists xs"], goal: "Which argument to induct on?" },
        { context: ["cons case"], goal: "What is the induction hypothesis about?" },
        { context: ["done"], goal: "Induction framed." },
      ],
      steps: [
        {
          choices: ["The list the function recurses on", "Always the longer list", "A random Nat", "Nothing"],
          correct: "The list the function recurses on",
          success: "Align induction with the recursive structure of the definition.",
          wrongHint: "Follow how the program inspects its argument.",
        },
        {
          choices: ["The empty list only", "The smaller tail", "Every list at once", "The goal type"],
          correct: "The smaller tail",
          success: "IH is the claim for the recursive substructure.",
          wrongHint: "In the cons case, IH talks about the tail.",
        },
      ],
    },
    playQuests: [
      {
        title: "Natural Number Game — Induction worlds",
        why: "The clearest induction trainer available in a browser.",
        url: NNG,
        eta: "45–90 min",
      },
    ],
    extraQuiz: [
      {
        question: "Base cases handle…",
        options: [
          "Recursive constructors",
          "Non-recursive constructors like nil / zero",
          "Only Prop",
          "Type classes",
        ],
        answer: 1,
        explanation: "Base constructors have no recursive arguments.",
      },
      {
        question: "If the IH is too weak, you often…",
        options: [
          "Delete the theorem",
          "Generalize the statement",
          "Use only rfl",
          "Switch off the kernel",
        ],
        answer: 1,
        explanation: "A stronger inductive claim supplies a usable hypothesis.",
      },
    ],
  },
  9: {
    miniGame: {
      title: "Structures & classes",
      prompt: "What tool fits the modeling job?",
      states: [
        { context: ["bundle fields + an invariant proof"], goal: "How do you package it?" },
        { context: ["need show for a type"], goal: "What mechanism fills [Repr α]?" },
        { context: ["done"], goal: "Modeling moves chosen." },
      ],
      steps: [
        {
          choices: ["structure", "only inductive with no names", "axiom", "#eval"],
          correct: "structure",
          success: "Structures are named records; fields can be data or proofs.",
          wrongHint: "You want a record-like package — use structure.",
        },
        {
          choices: ["Type-class inference", "Manual copy-paste only", "rw", "cases"],
          correct: "Type-class inference",
          success: "Square-bracket parameters are synthesized from instances.",
          wrongHint: "[Repr α] is a type-class argument.",
        },
      ],
    },
    playQuests: [
      {
        title: "Browse the Lean Game Server",
        why: "Pick a short side game when you want a break from reading.",
        url: GAMES_HOME,
        eta: "15+ min",
      },
    ],
    extraQuiz: [
      {
        question: "A proof field in a structure…",
        options: [
          "Is ignored by the kernel",
          "Must be supplied when building a value",
          "Only works for Nat",
          "Disables type checking",
        ],
        answer: 1,
        explanation: "Constructing the structure requires inhabiting every field, including proofs.",
      },
      {
        question: "Type classes are mainly for…",
        options: [
          "Shared inferred interfaces",
          "Replacing Prop",
          "Hiding errors",
          "Faster #eval only",
        ],
        answer: 0,
        explanation: "Instances let Lean fill in common interfaces automatically.",
      },
    ],
  },
  10: {
    miniGame: {
      title: "Pick the automation",
      prompt: "Which tool matches the obligation?",
      states: [
        { context: ["goal is a decidable Bool/Prop that computes"], goal: "Close it?" },
        { context: ["linear Nat arithmetic"], goal: "Likely tactic?" },
        { context: ["done"], goal: "Automation chosen deliberately." },
      ],
      steps: [
        {
          choices: ["decide", "cases forever", "sorry", "exact True"],
          correct: "decide",
          success: "decide solves decidable goals by computation.",
          wrongHint: "If the claim is decidable and computes, try decide.",
        },
        {
          choices: ["omega", "intro only", "left", "#check"],
          correct: "omega",
          success: "omega targets linear integer/natural arithmetic goals.",
          wrongHint: "Arithmetic fragment → omega is a common first try.",
        },
      ],
    },
    playQuests: [
      {
        title: "Natural Number Game — finish a world with simp",
        why: "See automation as a move, not a mystery.",
        url: NNG,
        eta: "20–40 min",
      },
    ],
    extraQuiz: [
      {
        question: "Why can a buggy tactic still be “safe” for the kernel?",
        options: [
          "Tactics never have bugs",
          "The kernel type-checks the produced term",
          "The editor rejects all tactics",
          "Automation skips Prop",
        ],
        answer: 1,
        explanation: "Bad tactics fail; they cannot force an ill-typed proof past the kernel.",
      },
      {
        question: "Before searching for a lemma, first…",
        options: [
          "Guess random names",
          "Write the type of the missing fact",
          "Delete context",
          "Disable simp",
        ],
        answer: 1,
        explanation: "The shape of the fact guides search.",
      },
    ],
  },
  11: {
    miniGame: {
      title: "Spec sharpness",
      prompt: "Which statement actually captures “maximum”?",
      states: [
        { context: ["m is an upper bound for xs"], goal: "Is that enough?" },
        { context: ["spec draft"], goal: "What else do you usually need?" },
        { context: ["done"], goal: "Spec sharpened." },
      ],
      steps: [
        {
          choices: ["Yes, always", "No — many upper bounds exist", "Only if xs is empty", "Only for Bool"],
          correct: "No — many upper bounds exist",
          success: "Upper bound alone is too weak for “the” maximum.",
          wrongHint: "Huge numbers are upper bounds too.",
        },
        {
          choices: ["m appears in the list (is attained)", "Delete preconditions", "Use only #eval", "Avoid Prop"],
          correct: "m appears in the list (is attained)",
          success: "Maximum should be attained, not merely above everything.",
          wrongHint: "A max is in the collection and ≥ every element.",
        },
      ],
    },
    playQuests: [
      {
        title: "Set Theory Game",
        why: "Practice precise statements in a different vocabulary.",
        url: SET_GAME,
        eta: "30–60 min",
      },
    ],
    extraQuiz: [
      {
        question: "A precondition…",
        options: [
          "Describes when the guarantee applies",
          "Computes the result",
          "Replaces the proof",
          "Hides type errors",
        ],
        answer: 0,
        explanation: "Preconditions scope the promise.",
      },
      {
        question: "“Proved” always means “useful.”",
        options: ["True", "False — the statement may be the wrong claim", "Only in Prop", "Only with Mathlib"],
        answer: 1,
        explanation: "Lean checks the statement you wrote, not the informal intent.",
      },
    ],
  },
  12: {
    miniGame: {
      title: "Proof architecture",
      prompt: "What do you do when the main induction sticks?",
      states: [
        { context: ["accumulator function"], goal: "Common repair?" },
        { context: ["repeated sub-argument"], goal: "Where does it go?" },
        { context: ["done"], goal: "Layers planned." },
      ],
      steps: [
        {
          choices: ["Generalize the inductive claim", "Delete the accumulator", "Only use sorry", "Switch to #eval"],
          correct: "Generalize the inductive claim",
          success: "A stronger statement often unlocks the IH for arbitrary accumulators.",
          wrongHint: "Accumulator proofs usually need a generalized lemma.",
        },
        {
          choices: ["A helper lemma", "Inline forever with no name", "The kernel config", "A Bool flag"],
          correct: "A helper lemma",
          success: "Package stable reasoning so the main proof stays readable.",
          wrongHint: "Reusable reasoning belongs in a named lemma.",
        },
      ],
    },
    playQuests: [
      {
        title: "Natural Number Game — harder worlds",
        why: "Practice finishing a multi-step development without notes.",
        url: NNG,
        eta: "45+ min",
      },
    ],
    extraQuiz: [
      {
        question: "Proofs should be treated like…",
        options: [
          "Disposable comments",
          "Maintainable code",
          "Editor themes",
          "Network requests",
        ],
        answer: 1,
        explanation: "Structure, naming, and helpers matter as the project grows.",
      },
      {
        question: "Align induction with…",
        options: ["Random variables", "How the program recurses", "File order only", "The README"],
        answer: 1,
        explanation: "Matching recursion makes goals reduce cleanly.",
      },
    ],
  },
  13: {
    miniGame: {
      title: "Project navigation",
      prompt: "Where does each concern live?",
      states: [
        { context: ["pin Lean version"], goal: "Which file?" },
        { context: ["need a lemma you vaguely remember"], goal: "First move?" },
        { context: ["done"], goal: "Project habits set." },
      ],
      steps: [
        {
          choices: ["lean-toolchain", "only README", "globals.css", "package-lock only"],
          correct: "lean-toolchain",
          success: "Toolchain pins the Lean version for the project.",
          wrongHint: "Projects declare the Lean version in lean-toolchain.",
        },
        {
          choices: ["Search by the lemma’s type shape", "Rewrite Mathlib from scratch", "Disable imports", "Guess file names only"],
          correct: "Search by the lemma’s type shape",
          success: "Type-guided search beats name guessing.",
          wrongHint: "Describe the missing fact as a type, then search.",
        },
      ],
    },
    playQuests: [
      {
        title: "Lean Game Server catalog",
        why: "See how larger teaching projects are organized as games.",
        url: GAMES_HOME,
        eta: "browse",
      },
    ],
    extraQuiz: [
      {
        question: "Mathlib is best treated as…",
        options: [
          "A single file to memorize",
          "A large searchable library",
          "A replacement for the kernel",
          "Only for graphics",
        ],
        answer: 1,
        explanation: "You navigate Mathlib by need, not by reading it cover to cover.",
      },
      {
        question: "Lake is primarily…",
        options: [
          "Lean’s build / package tool",
          "A proof tactic",
          "A type universe",
          "An editor theme",
        ],
        answer: 0,
        explanation: "Lake manages packages and builds.",
      },
    ],
  },
  14: {
    miniGame: {
      title: "Trust report",
      prompt: "What belongs in an honest verification summary?",
      states: [
        { context: ["tiny verified system"], goal: "What must you name?" },
        { context: ["invariant on a state type"], goal: "How do clients get the guarantee?" },
        { context: ["done"], goal: "Trust story complete." },
      ],
      steps: [
        {
          choices: [
            "Assumptions and model boundaries",
            "Only “100% correct”",
            "Editor screenshots",
            "Nothing — proofs speak alone",
          ],
          correct: "Assumptions and model boundaries",
          success: "Trust reports should say what was modeled and what was assumed.",
          wrongHint: "Proofs are relative to stated assumptions.",
        },
        {
          choices: [
            "Carry the invariant in the type / structure",
            "Hope users remember",
            "Delete the invariant",
            "Only test in CI",
          ],
          correct: "Carry the invariant in the type / structure",
          success: "Invariant-carrying types make the safety property available by construction.",
          wrongHint: "Bake the invariant into the API so it cannot be ignored.",
        },
      ],
    },
    playQuests: [
      {
        title: "Replay Natural Number Game from memory",
        why: "Close the course by retrieving tactics without the field guide open.",
        url: NNG,
        eta: "30–60 min",
      },
      {
        title: "Any game on the server",
        why: "Keep a weekly Lean habit with something fun.",
        url: GAMES_HOME,
        eta: "ongoing",
      },
    ],
    extraQuiz: [
      {
        question: "Verification composes best when…",
        options: [
          "Local guarantees are explicit and reusable",
          "Everything is one giant sorry",
          "You avoid specifications",
          "You only use #eval",
        ],
        answer: 0,
        explanation: "Small clear theorems assemble into system properties.",
      },
      {
        question: "After this course, continued progress mainly needs…",
        options: [
          "Passive rereading only",
          "Deliberate practice on real statements",
          "More themes",
          "Disabling the kernel",
        ],
        answer: 1,
        explanation: "Fluency comes from proving, breaking, and repairing — repeatedly.",
      },
    ],
  },
};
