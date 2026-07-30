import type { DeepDiveChapter } from "./deep-dive-types";

export const deepDivesPart3: DeepDiveChapter[] = [
  {
    day: 11,
    opening: [
      "Until now, a theorem may have looked like a puzzle whose statement was already given. Verification begins one step earlier: you must decide what the theorem ought to say. A specification is a precise, machine-checkable description of acceptable behavior. It connects an informal sentence such as “find the largest number” to propositions about inputs and outputs. Lean cannot inspect your intention, so a flawless proof of the wrong statement is still the wrong result.",
      "Today you will learn to treat specification as design work. You will separate a program from the promise made about it, decide how exceptional inputs are represented, and identify properties that must survive each program step. Examples and counterexamples remain essential: they do not replace proof, but they help you judge whether the proposition being proved actually captures the human requirement.",
    ],
    prerequisites: [
      "Read a function type such as Nat → Nat and evaluate small recursive definitions.",
      "Read propositions using ∀, ∃, ∧, →, =, and ≤.",
      "Follow a short tactic proof using intro, constructor, exact, simp, and cases.",
    ],
    topics: [
      {
        title: "Turning an informal requirement into a specification",
        question: "How do I translate “this program is correct” into something Lean can check?",
        whyItMatters: "The proof certifies exactly the proposition you state. If that proposition omits an important part of the requirement, Lean will faithfully certify an incomplete promise.",
        explanation: [
          "An implementation says how to compute; a specification says which observable results are acceptable. For a list-maximum program, the implementation might scan left to right, sort the list, or use an accumulator. A useful specification should usually ignore that choice. It should describe the relationship between the input list and returned number so that several implementations can satisfy the same contract.",
          "Break vague words into independent obligations. Saying that m is the maximum of xs normally means two things: m occurs in xs, and every element of xs is at most m. The second condition alone merely says m is an upper bound; 10,000 is an upper bound of [2, 7, 3] but is not its maximum. The first condition alone merely says m is an element; 2 occurs but is not largest.",
          "Next expose edge cases. An empty list has no member that can be its maximum. You can rule out emptiness with a precondition, return Option Nat so failure is explicit, accept a default value, or use a nonempty-list type. These are different APIs, not cosmetic proof choices. The type tells callers what situation they must handle.",
          "Review a candidate specification before proving it. Calculate several ordinary examples, then search for adversarial cases: empty input, duplicates, zero, and values at a boundary. Ask whether two obviously different outputs could both satisfy the proposition. If so, that may be intended nondeterminism, or it may reveal a missing condition.",
          "Finally ask whether a future client theorem can use the result. A postcondition is valuable when it supplies the facts downstream code needs without exposing implementation details. This client-oriented test often reveals why a formally true statement is still too weak.",
        ],
        analogy: {
          title: "An architectural blueprint",
          body: "A blueprint describes required dimensions and relationships while allowing builders to choose tools and work order. A specification similarly describes acceptable behavior while allowing different algorithms.",
          limit: "A building can be inspected against physical reality, whereas Lean checks a mathematical model; the blueprint analogy does not guarantee that the model includes every real-world concern.",
        },
        workedExample: {
          title: "A maximum needs membership and an upper-bound property",
          setup: "This example uses only Lean 4 Core. We define the desired relationship and prove that 7 satisfies it for a concrete list.",
          code: `def IsUpperBound (xs : List Nat) (m : Nat) : Prop :=
  ∀ x, x ∈ xs → x ≤ m

def IsMaximum (xs : List Nat) (m : Nat) : Prop :=
  m ∈ xs ∧ IsUpperBound xs m

example : IsMaximum [2, 7, 3] 7 := by
  constructor
  · simp
  · intro x hx
    simp at hx
    omega`,
          steps: [
            { label: "Unpack the specification", explanation: "After unfolding IsMaximum, constructor separates the conjunction into membership and upper-bound goals.", proofState: "⊢ 7 ∈ [2, 7, 3]  and  ⊢ IsUpperBound [2, 7, 3] 7" },
            { label: "Prove membership", explanation: "simp evaluates membership in the concrete list and confirms that 7 is present.", proofState: "first goal closed" },
            { label: "Introduce an arbitrary element", explanation: "intro x hx expresses the upper-bound argument: take any x and evidence hx that x belongs to the list.", proofState: "x : Nat, hx : x ∈ [2, 7, 3] ⊢ x ≤ 7" },
            { label: "Expose the finite alternatives", explanation: "simp at hx turns membership into the possibilities x = 2, x = 7, or x = 3.", proofState: "hx describes three concrete cases ⊢ x ≤ 7" },
            { label: "Finish arithmetic", explanation: "omega solves the resulting natural-number arithmetic. omega is provided by Mathlib, so this snippet needs `import Mathlib`; the definitions themselves are Core.", proofState: "no goals" },
          ],
          conclusion: "The proof succeeds because the specification records both essential facts. It also illustrates a dependency boundary: the propositions are Core Lean, while the convenient arithmetic tactic is Mathlib.",
        },
        commonMistakes: [
          { mistake: "Specify only that the result is an upper bound.", why: "Arbitrarily large answers then satisfy the theorem.", repair: "Also require that the result occurs in the input, or otherwise define the exact selection rule." },
          { mistake: "Hide the empty-list case inside an unexplained default.", why: "A caller may mistake the default for a genuine maximum.", repair: "Use Option, a nonempty precondition, or a nonempty input type and document the choice." },
          { mistake: "Copy the implementation into the proposition.", why: "The theorem then restates computation and cannot compare alternative algorithms.", repair: "Describe observable relationships such as membership and ordering." },
        ],
        selfCheck: [
          { prompt: "Why does IsUpperBound [2, 7, 3] 100 not make 100 a maximum?", answer: "Because 100 is not a member of the list; maximum requires attainment as well as the upper-bound property." },
          { prompt: "What question should be settled before proving a maximum function on []?", answer: "Whether the API rejects emptiness, returns Option, uses a default, or represents nonempty lists in its input type." },
          { prompt: "Can testing prove a universal specification?", answer: "No. Tests help find a bad statement or implementation, but a proof covers every input described by the theorem." },
        ],
      },
      {
        title: "Preconditions, postconditions, and explicit failure",
        question: "How does a contract divide responsibility between a caller and a function?",
        whyItMatters: "Contracts prevent hidden assumptions. They say when a guarantee applies and what a caller may rely on afterward.",
        explanation: [
          "A precondition describes the inputs or starting states for which a promise is made. A postcondition describes the allowed result, often in relation to the original input. In Lean the common shape is `∀ input, Pre input → Post input (f input)`: for every input, evidence of the precondition can be transformed into evidence of the postcondition.",
          "Strength has opposite effects on the two sides. A stronger precondition admits fewer calls and makes the implementer’s job easier. A stronger postcondition promises more and makes the implementer’s job harder. Requiring a list to have at least ten elements would simplify some indexing proof, but it would be a poor contract if the real operation should work on any nonempty list.",
          "Some failures are better represented as data than as assumptions. `Option α` says a computation may produce `some value` or `none`; `Except error α` can explain why it failed. This forces callers to handle both outcomes through pattern matching. By contrast, a proof-carrying argument is appropriate when callers can naturally establish the condition and the function truly cannot operate without it.",
          "Do not confuse a Boolean check with a proposition. `n > 0` in a proposition is evidence-bearing logic, while a Boolean such as `isValid n` computes `true` or `false`. Lean has bridges between decidable propositions and Boolean decisions, but you must know which kind a function consumes and which kind a theorem proves.",
          "A useful contract documents both successful behavior and failure behavior. For an Option-returning lookup, prove what happens when the index is valid and what `none` means. Only proving the happy path leaves callers without a logical interpretation of failure.",
        ],
        analogy: {
          title: "A warranty",
          body: "A warranty lists conditions the owner must satisfy and promises the remedy the maker supplies. Preconditions and postconditions similarly allocate obligations.",
          limit: "Legal warranties depend on interpretation and enforcement; a Lean implication has exact formal meaning and says nothing outside its stated premise.",
        },
        workedExample: {
          title: "Making empty-list failure part of the return type",
          setup: "This is Lean 4 Core. The theorem states the successful branch without pretending that every list has a head.",
          code: `def safeHead {α : Type} : List α → Option α
  | [] => none
  | x :: _ => some x

theorem safeHead_of_cons {α : Type} (x : α) (xs : List α) :
    safeHead (x :: xs) = some x := by
  rfl`,
          steps: [
            { label: "Read the type", explanation: "safeHead accepts every list, so there is no precondition. Option α announces possible failure.", proofState: "safeHead : List α → Option α" },
            { label: "Match the constructors", explanation: "The definition covers [] with none and x :: xs with some x; Lean checks that every List constructor is handled.", proofState: "two defining equations accepted" },
            { label: "Enter the theorem", explanation: "The theorem chooses a constructor-shaped input, so the successful defining equation applies directly.", proofState: "x : α, xs : List α ⊢ safeHead (x :: xs) = some x" },
            { label: "Reduce computation", explanation: "rfl asks Lean to unfold enough computation to see both sides are definitionally the same.", proofState: "some x = some x" },
            { label: "Close the goal", explanation: "Reflexivity supplies the equality proof without any additional assumptions.", proofState: "no goals" },
          ],
          conclusion: "The type is already part of the specification: callers cannot receive a fabricated head for an empty list and must consider none.",
        },
        commonMistakes: [
          { mistake: "Use an impossible precondition to make an implication easy.", why: "An implication from False is provable but gives no guarantee for real calls.", repair: "Show representative inputs satisfy the precondition and justify every restriction." },
          { mistake: "Make the precondition stronger than the actual domain requirement.", why: "The verified function becomes needlessly unusable.", repair: "Start from caller needs, then choose the weakest honest assumption that supports the promise." },
          { mistake: "Return Option but specify only the `some` case.", why: "The meaning of `none` remains undocumented.", repair: "Add a theorem characterizing failure, such as `safeHead xs = none ↔ xs = []`." },
        ],
        selfCheck: [
          { prompt: "Which is harder to satisfy: a stronger or weaker postcondition?", answer: "A stronger postcondition, because it promises more about every accepted result." },
          { prompt: "What does Option communicate that a magic default does not?", answer: "It distinguishes absence or failure from a genuine returned value in the type." },
          { prompt: "In `Pre x → Post x (f x)`, who supplies `Pre x`?", answer: "The caller or surrounding proof supplies evidence of the precondition; the theorem supplies the postcondition." },
        ],
      },
      {
        title: "Invariants and specification review",
        question: "How can one fact describe safety across an arbitrarily long computation?",
        whyItMatters: "Programs evolve through many states. An invariant turns an unbounded execution argument into a local preservation obligation repeated at every step.",
        explanation: [
          "An invariant is a proposition intended to hold at designated points in a computation. For a bounded counter it might be `value ≤ maximum`; for a parser it might say the unread position never exceeds the input length. The invariant is not automatically true because of its name. You prove it initially and prove that every allowed transition preserves it.",
          "The standard pattern has three parts: initialization establishes the invariant, preservation shows one step keeps it true, and an induction argument extends preservation to any finite sequence of steps. This is why recursive command interpreters and inductive proofs fit each other so naturally.",
          "Choose an invariant strong enough to imply the final property, but not so detailed that every operation becomes painful. If your final theorem needs both a bound and a fixed maximum, preserving only the bound may be insufficient. Discovering a missing invariant during proof is normal: the failed proof state is feedback about the specification.",
          "Review also hunts vacuity. `P → Q` is automatically true when P is impossible, and `∃ x, True` reveals almost nothing about x. Try to construct inputs satisfying the premise and counterexamples to the conclusion. A surprisingly one-line proof may reflect elegance, but it can also expose a weak promise.",
          "The final review returns to the real requirement. State assumptions in plain language, list properties not covered, and ask how the formal state corresponds to a deployed system. Specification review is a human reasoning activity supported—but never replaced—by machine checking.",
        ],
        analogy: {
          title: "A relay race baton",
          body: "Each runner receives the baton and must pass it onward; proving every handoff preserves possession lets you reason about the whole race.",
          limit: "Real handoffs can fail in unmodeled physical ways, while an invariant proof covers only transitions included in the formal definition.",
        },
        workedExample: {
          title: "A decrement operation preserves a simple bound",
          setup: "Lean 4 Core knows the recursive equations for Nat subtraction. We use an invariant stated as an ordinary proposition.",
          code: `def dec (n : Nat) : Nat :=
  match n with
  | 0 => 0
  | k + 1 => k

theorem dec_le (n : Nat) : dec n ≤ n := by
  cases n with
  | zero => exact Nat.le_refl 0
  | succ k => exact Nat.le_succ k`,
          steps: [
            { label: "State the preserved property", explanation: "The post-state `dec n` should never exceed the pre-state n.", proofState: "n : Nat ⊢ dec n ≤ n" },
            { label: "Split possible states", explanation: "cases n follows Nat's constructors: zero and successor.", proofState: "zero branch ⊢ dec 0 ≤ 0; succ branch ⊢ dec (Nat.succ k) ≤ Nat.succ k" },
            { label: "Handle the boundary", explanation: "At zero, dec computes to zero, and reflexivity proves 0 ≤ 0.", proofState: "zero branch closed" },
            { label: "Handle a positive state", explanation: "At successor k, dec computes to k and Nat.le_succ proves k ≤ k + 1.", proofState: "succ branch closed" },
          ],
          conclusion: "A preservation lemma is local: it analyzes one operation. Day 14 will lift such local facts to whole command sequences by induction.",
        },
        commonMistakes: [
          { mistake: "Call a property an invariant without proving initialization.", why: "Preservation cannot help if the starting state is already invalid.", repair: "Separate and prove initial validity and one-step preservation." },
          { mistake: "Choose an invariant too weak for the final theorem.", why: "The induction succeeds but the desired conclusion does not follow.", repair: "Work backward from the final claim and strengthen the invariant with the missing facts." },
          { mistake: "Assume proved means intended.", why: "Lean checks internal logic, not whether a proposition captures stakeholder meaning.", repair: "Use examples, counterexamples, client needs, and an explicit scope review." },
        ],
        selfCheck: [
          { prompt: "What three proof obligations support an invariant argument?", answer: "Initialization, preservation by one step, and induction/composition over all steps." },
          { prompt: "Why can a failed proof be useful during specification?", answer: "It may reveal a missing assumption, an invariant that is too weak, or a desired claim that is false." },
          { prompt: "Does an invariant describe every detail of a state?", answer: "No. It records only the properties chosen to remain true and useful for later conclusions." },
        ],
      },
    ],
    closingQuestions: [
      "Write two independent clauses that characterize a true list maximum.",
      "For a partial operation you know, compare an Option-returning API with a proof-precondition API.",
      "Name an invariant for a familiar system and identify its initialization and preservation obligations.",
    ],
  },
  {
    day: 12,
    opening: [
      "Today closes the loop from program to theorem. You will define a small recursive program, state properties at several levels, and prove those properties by following the same structure as the computation. This is where induction stops feeling like an abstract mathematical ritual and becomes a practical program-verification tool.",
      "The central lesson is layering. A robust verification development rarely jumps directly to its most impressive theorem. It first records computation rules, then preservation facts, then larger behavioral guarantees. Those helper lemmas form an interface for later proofs, just as well-designed functions form an interface for later code.",
    ],
    prerequisites: [
      "Understand List constructors [] and x :: xs and recursive definitions over lists.",
      "Recognize the base case, step case, and induction hypothesis in a proof.",
      "Use simp with an explicit list of definitions or lemmas.",
    ],
    topics: [
      {
        title: "Aligning induction with recursive computation",
        question: "Why does the shape of a program often tell me how to prove facts about it?",
        whyItMatters: "When proof decomposition follows computation decomposition, each recursive call is matched by exactly the induction hypothesis needed to reason about it.",
        explanation: [
          "A recursive list function has one equation for [] and another for x :: xs. A theorem quantified over that list can be proved by list induction, which produces the same two cases. In the cons case, the induction hypothesis states the theorem for xs—the exact smaller input used by the function's recursive call.",
          "After choosing induction, simplify only enough to expose the recursive structure. Unfolding every definition can flood the goal with irrelevant detail. A focused `simp [functionName, ih]` often computes the current branch and rewrites the recursive result using the induction hypothesis.",
          "The induction variable matters. If the function recurses on xs but you induct on an unrelated number, the hypothesis will not describe the recursive call. Read the definition before beginning the proof and ask which argument structurally becomes smaller.",
          "A preservation theorem is often the best first target. Length, membership, ordering, or an invariant may be easier than complete functional correctness. The early theorem checks your understanding and becomes a reusable fact in the stronger proof.",
          "Induction does not mean testing many cases. Its step proves that whenever the theorem holds for an arbitrary smaller structure, it also holds after adding one constructor. That logical bridge is what covers lists of every finite length.",
        ],
        analogy: {
          title: "Following assembly instructions backward",
          body: "If an object was assembled one piece at a time, proving a property by removing the latest piece exposes the smaller assembled object and the effect of one construction step.",
          limit: "Not every algorithm's surface input reveals its useful recursion; accumulator and well-founded recursion can require a strengthened statement or different induction principle.",
        },
        workedExample: {
          title: "Map preserves list length",
          setup: "This is Lean 4 Core. List.map transforms values but retains one output cell for each input cell.",
          code: `theorem length_map {α β : Type} (f : α → β) (xs : List α) :
    (xs.map f).length = xs.length := by
  induction xs with
  | nil => rfl
  | cons x xs ih =>
      simp [ih]`,
          steps: [
            { label: "Choose structural induction", explanation: "Because List.map recurses on xs, induction xs creates branches matching its equations.", proofState: "nil goal and cons goal; cons context includes ih : (xs.map f).length = xs.length" },
            { label: "Compute the empty branch", explanation: "Mapping [] gives [], and both lengths compute to 0, so rfl closes the goal.", proofState: "0 = 0" },
            { label: "Inspect the cons branch", explanation: "Mapping x :: xs gives f x :: map f xs, so both lengths have an outer successor.", proofState: "Nat.succ (xs.map f).length = Nat.succ xs.length" },
            { label: "Use the induction hypothesis", explanation: "simp [ih] rewrites the smaller mapped length to xs.length and closes reflexivity.", proofState: "no goals" },
          ],
          conclusion: "The proof mirrors the implementation: one empty computation and one cell-preserving step built on the recursive result.",
        },
        commonMistakes: [
          { mistake: "Start induction before reading which argument recurses.", why: "The induction hypothesis may be unrelated to the recursive call.", repair: "Inspect the defining equations and induct on the structurally decreasing argument." },
          { mistake: "Expect the induction hypothesis to run automatically.", why: "It is evidence in the context, not a global magic rule.", repair: "Rewrite with ih, apply it explicitly, or include it in a focused simp call." },
          { mistake: "Unfold every library definition.", why: "The goal becomes low-level and brittle.", repair: "Expose only the current recursive equation and the lemmas needed for the next reasoning step." },
        ],
        selfCheck: [
          { prompt: "Why is xs the natural induction variable in length_map?", answer: "List.map recursively calls itself on the tail xs, so the induction hypothesis matches that call." },
          { prompt: "What does the induction hypothesis say in the cons case?", answer: "That mapping the arbitrary tail xs preserves its length." },
          { prompt: "Why is proving one-element and two-element examples insufficient?", answer: "They do not establish the constructor step for an arbitrary tail and therefore do not cover every finite list." },
        ],
      },
      {
        title: "Helper lemmas and stronger induction hypotheses",
        question: "What should I do when induction gives me a true but unusably weak hypothesis?",
        whyItMatters: "Real implementations often use accumulators or auxiliary state. Their correctness requires relating every possible intermediate state to the intended result.",
        explanation: [
          "Suppose a reverse function carries an accumulator. The recursive call changes both the remaining list and the accumulator. A theorem only about an initially empty accumulator gives an induction hypothesis that says nothing about the nonempty accumulator appearing after one step.",
          "The cure is generalization: prove a stronger helper theorem for every accumulator. A typical statement says that reversing xs into acc equals ordinary reverse xs followed by acc. The public theorem follows by choosing acc = []. The stronger claim is harder to state but easier to prove because it matches the implementation's changing state.",
          "A good helper lemma names a stable mathematical relationship, not merely a sequence of tactics. It should have a useful type, hide implementation detail where appropriate, and reduce duplication. Computation lemmas describe individual branches; preservation lemmas capture reusable properties; a main theorem composes them.",
          "When a proof gets stuck, compare the recursive call in the goal with the induction hypothesis. Which variables differ? Which fact would let you rewrite the call? Generalize the changing variables before induction, or use a theorem quantified over them.",
          "Stronger is not always better. Extra conclusions and assumptions make a lemma harder to understand and maintain. Strengthen only along the dimension the recursive proof requires, and explain how the helper supports the public contract.",
        ],
        analogy: {
          title: "A tool with an adjustable handle",
          body: "A fixed tool works only from one starting position; an adjustable one works from every intermediate position encountered during the job. A generalized lemma similarly covers arbitrary accumulator states.",
          limit: "Mathematical generalization must remain true for every quantified state; unlike adjusting a tool, adding generality can make the claim false.",
        },
        workedExample: {
          title: "Accumulator-based length needs an arbitrary starting count",
          setup: "Lean 4 Core. The helper says counting a list from any accumulator adds exactly the list length.",
          code: `def countFrom {α : Type} : List α → Nat → Nat
  | [], acc => acc
  | _ :: xs, acc => countFrom xs (acc + 1)

theorem countFrom_eq {α : Type} (xs : List α) (acc : Nat) :
    countFrom xs acc = acc + xs.length := by
  induction xs generalizing acc with
  | nil => simp [countFrom]
  | cons x xs ih =>
      simp [countFrom, ih, Nat.add_assoc]`,
          steps: [
            { label: "Quantify the changing state", explanation: "`generalizing acc` ensures the induction hypothesis works for every accumulator, including acc + 1.", proofState: "ih : ∀ acc, countFrom xs acc = acc + xs.length" },
            { label: "Solve the base case", explanation: "countFrom [] acc computes to acc and [] has length 0; simp proves acc = acc + 0.", proofState: "nil branch closed" },
            { label: "Expose the recursive call", explanation: "In the cons case, countFrom calls itself on xs with accumulator acc + 1.", proofState: "countFrom xs (acc + 1) = acc + (x :: xs).length" },
            { label: "Instantiate the helper", explanation: "simp uses ih at acc + 1, then normalizes length and addition; associativity aligns the two groupings.", proofState: "no goals" },
          ],
          conclusion: "The public fact `countFrom xs 0 = xs.length` is now a simple specialization. Generalization made the induction hypothesis match the actual recursive state.",
        },
        commonMistakes: [
          { mistake: "Induct while acc is fixed.", why: "The hypothesis covers only the original acc, not acc + 1 used by the recursive call.", repair: "Generalize acc before or as part of induction." },
          { mistake: "Create a helper named only after a tactic sequence.", why: "Future readers cannot tell what reusable concept it captures.", repair: "Name and state the semantic relationship the main proof needs." },
          { mistake: "Add unrelated facts to make a mega-lemma.", why: "The helper becomes difficult to apply and maintain.", repair: "Strengthen the smallest changing dimension required by recursion." },
        ],
        selfCheck: [
          { prompt: "Why is the generalized count theorem easier to prove than the acc = 0 theorem?", answer: "Its induction hypothesis applies to the changed accumulator used by the recursive call." },
          { prompt: "How do you derive the ordinary length result?", answer: "Specialize countFrom_eq to acc = 0 and simplify 0 + xs.length." },
          { prompt: "What diagnostic question reveals a need to generalize?", answer: "Ask whether the recursive call uses a parameter value different from the one fixed in the induction hypothesis." },
        ],
      },
      {
        title: "Layered correctness and maintainable proofs",
        question: "How do I structure a verification development so it remains readable when the program changes?",
        whyItMatters: "Proofs are long-lived code. Clear contracts and controlled dependencies make failures local and make review possible.",
        explanation: [
          "Begin with an explicit correctness ladder: defining equations, small preservation facts, then the headline behavior. Each layer should expose only what the next layer needs. This turns a large opaque proof into several independently meaningful claims.",
          "Treat theorem statements as APIs. Other files should depend on stable behavior rather than the tactic script or internal algorithm. You may refactor a proof from induction to a library lemma without changing clients; changing the statement is an API change and deserves review.",
          "Automation should have a controlled diet. A bare `simp` uses its configured lemma set, which can grow after imports change. `simp [myDefinition, helper]` records important dependencies and makes the proof's idea easier to see. Short proofs are valuable when they are clear, not merely because they contain fewer characters.",
          "Test executable examples, but distinguish them from proof. `#eval` helps discover a wrong definition and provides intuition. A theorem establishes a property for all quantified inputs. Both belong in a careful workflow: compute early, prove generally, then review the specification.",
          "When refactoring breaks a proof, find the first failed interface. If a helper theorem still states the desired behavior, repair its proof and leave clients untouched. This is the verification analogue of modular software maintenance.",
        ],
        analogy: {
          title: "A stack of adapters",
          body: "Each adapter exposes a stable socket while hiding wiring beneath it. Layered lemmas let later proofs connect to behavior without depending on internal proof steps.",
          limit: "Too many adapters or lemmas can obscure a simple argument; modularity helps only when boundaries correspond to meaningful concepts.",
        },
        workedExample: {
          title: "Filter cannot make a list longer",
          setup: "Lean 4 Core. The proof follows List.filter's recursion and branches on whether the head is retained.",
          code: `theorem length_filter_le {α : Type}
    (p : α → Bool) (xs : List α) :
    (xs.filter p).length ≤ xs.length := by
  induction xs with
  | nil => simp
  | cons x xs ih =>
      simp only [List.filter]
      split <;> simp [ih]`,
          steps: [
            { label: "Name the observable guarantee", explanation: "The theorem does not specify filter's internal loop; it promises a length relationship useful to clients.", proofState: "⊢ (xs.filter p).length ≤ xs.length" },
            { label: "Follow list recursion", explanation: "Induction gives the empty case and a tail hypothesis for the cons case.", proofState: "ih : (xs.filter p).length ≤ xs.length" },
            { label: "Expose one filter decision", explanation: "simp only unfolds the current filter equation; split creates branches for p x being true or false.", proofState: "keep-head branch and drop-head branch" },
            { label: "Reuse tail preservation", explanation: "In either branch, simp [ih] normalizes lengths and uses the already-proved bound for the tail.", proofState: "no goals" },
          ],
          conclusion: "The proof is small because it depends on a meaningful tail invariant, not because verification was skipped.",
        },
        commonMistakes: [
          { mistake: "Write one giant tactic block for the headline theorem.", why: "Failures are difficult to localize and the reasoning cannot be reused.", repair: "Extract computation and preservation lemmas with descriptive statements." },
          { mistake: "Assume `#eval` examples prove general behavior.", why: "They inspect only selected inputs.", repair: "Use evaluation for feedback, then state and prove a universally quantified theorem." },
          { mistake: "Use broad automation without understanding dependencies.", why: "Import changes can alter behavior and readers cannot see the proof idea.", repair: "Prefer focused lemma lists and record why each non-obvious helper applies." },
        ],
        selfCheck: [
          { prompt: "What part of a theorem behaves like a public API?", answer: "Its statement; client proofs need not know how the proof body is implemented." },
          { prompt: "What does the filter proof preserve from recursive tail to full list?", answer: "That the filtered tail's length is at most the original tail's length." },
          { prompt: "When is a one-line automated proof good engineering?", answer: "When its meaning and dependencies remain clear and it is stable under expected project changes." },
        ],
      },
    ],
    closingQuestions: [
      "For a recursive function, identify the argument that becomes smaller and state the induction hypothesis you want.",
      "Explain in your own words why an accumulator often requires a generalized helper theorem.",
      "Sketch a three-layer theorem API for a small program you know.",
    ],
  },
  {
    day: 13,
    opening: [
      "A proof that works in a single editor buffer is only the beginning of real Lean work. Projects must pin a compatible toolchain, organize declarations into modules, record dependencies, and remain understandable to another reader. Today you will learn the map of that environment so errors feel like local, investigable problems rather than mysterious failures.",
      "You will also meet Mathlib as a working library rather than an enormous book to memorize. Fluency means turning a proof-state need into a theorem shape, finding candidate declarations, reading their types, and adapting your goal. The durable skill is navigation: library names and tactics evolve, but disciplined inspection continues to work.",
    ],
    prerequisites: [
      "Read a declaration's full type and identify explicit, implicit, and type-class arguments.",
      "Understand that imports make declarations available to later modules.",
      "Be comfortable experimenting in a small Lean file.",
    ],
    topics: [
      {
        title: "Toolchains, Lake projects, modules, and namespaces",
        question: "What pieces turn separate Lean files into a reproducible checked project?",
        whyItMatters: "Without explicit versions and dependency structure, a proof may work on one machine today and fail elsewhere or after an upgrade.",
        explanation: [
          "The Lean toolchain contains the compiler, elaborator, kernel, and bundled tools for a particular version. Elan manages installed toolchains, while a `lean-toolchain` file tells contributors which one the project expects. Pinning is important because syntax, compiler behavior, and library compatibility evolve together.",
          "Lake is Lean's project and build tool. A Lake configuration names packages, libraries, executables, and dependencies such as Mathlib. A manifest records resolved dependency revisions. Building the project checks modules in dependency order and caches compiled results.",
          "A `.lean` file corresponds to a module named by its path under a configured source directory. `import Course.Model` makes that module's exported declarations available and also brings in its transitive imports. An import is a dependency edge, not textual copying.",
          "Namespaces organize declaration names. Inside `namespace Counter`, a definition `State` receives the full name `Counter.State`, reducing collisions and explaining ownership. `open Counter` permits shorter references in a scope; it does not merge or duplicate declarations.",
          "Prefer a simple dependency direction: domain model at the bottom, operations above it, and verification above operations. Cyclic imports are rejected and usually signal mixed responsibilities. Small, coherent modules also make rebuilds and error investigation faster.",
        ],
        analogy: {
          title: "A recipe with a pantry inventory",
          body: "The toolchain is the kitchen equipment version, dependencies are named ingredients, and modules are recipe stages with declared inputs.",
          limit: "Software dependencies are exact graphs checked by tools; a cook can improvise substitutions that Lean will not silently accept.",
        },
        workedExample: {
          title: "A namespaced module with an explicit behavioral theorem",
          setup: "Lean 4 Core. In a real project this could live in `Course/Account.lean` and be imported as `Course.Account`.",
          code: `namespace Course

structure Account where
  balance : Nat

def Account.deposit (a : Account) (amount : Nat) : Account :=
  { balance := a.balance + amount }

theorem Account.deposit_balance (a : Account) (amount : Nat) :
    (a.deposit amount).balance = a.balance + amount := by
  rfl

end Course`,
          steps: [
            { label: "Create an ownership scope", explanation: "The namespace prefixes declarations with Course, preventing a generic name such as Account from polluting the global namespace.", proofState: "current namespace: Course" },
            { label: "Define the model", explanation: "The structure generates a constructor and projection `Account.balance`.", proofState: "Account : Type; Account.balance : Account → Nat" },
            { label: "Attach an operation", explanation: "The full declaration name Course.Account.deposit supports method-like notation `a.deposit amount`.", proofState: "deposit returns an Account whose balance is the sum" },
            { label: "Expose the contract", explanation: "The theorem records the observable field behavior independently of later proof clients.", proofState: "⊢ (a.deposit amount).balance = a.balance + amount" },
            { label: "Compute definitionally", explanation: "Projection from the freshly constructed record reduces to the assigned expression, so rfl closes the equality.", proofState: "no goals" },
          ],
          conclusion: "Names, modules, and theorem statements form the human-readable architecture around kernel-checked terms.",
        },
        commonMistakes: [
          { mistake: "Rely on whichever Lean version happens to be installed.", why: "Teammates or future builds may use incompatible syntax and libraries.", repair: "Commit the toolchain pin and resolved project dependencies." },
          { mistake: "Put every definition and proof in one module.", why: "Dependencies, ownership, and rebuild failures become difficult to understand.", repair: "Separate model, operations, and verification along a one-way import graph." },
          { mistake: "Open many namespaces globally to save typing.", why: "Short names become ambiguous and declaration origins disappear.", repair: "Use qualified names or narrowly scoped `open` commands." },
        ],
        selfCheck: [
          { prompt: "What is the difference between Elan and Lake?", answer: "Elan manages Lean toolchains; Lake configures and builds Lean projects and their package dependencies." },
          { prompt: "What does `import A.B` express?", answer: "That the current module depends on declarations exported by module A.B and its imports." },
          { prompt: "Why use a namespace when modules already exist?", answer: "Namespaces control declaration names and collisions; module paths control files and imports. They often align but serve different roles." },
        ],
      },
      {
        title: "Navigating Mathlib by theorem shape",
        question: "How can I use a huge library without memorizing thousands of theorem names?",
        whyItMatters: "Most practical Lean work depends on existing abstractions and lemmas. Reproving everything is slow and often produces less general results.",
        explanation: [
          "Mathlib extends Lean with a large body of mathematics, data structures, tactics, and notation. Core Lean remains the language and trusted checker; imported Mathlib declarations are additional definitions and theorems whose proof terms the kernel checks. Some tactics, including `omega`, require Mathlib imports.",
          "Start from the hole's type. If the goal is `a ∈ xs.reverse ↔ a ∈ xs`, search for names or documentation involving List, reverse, and membership. A candidate theorem's type matters more than its name: inspect its quantifiers, argument order, namespaces, and assumptions.",
          "Use `#check Name` to see a declaration's type and `#print Name` to inspect more detail. Editor completion and go-to-definition reveal nearby naming patterns. In Mathlib environments, search facilities such as `exact?`, `apply?`, `simp?`, and documentation search can suggest facts, but you should read every suggestion before adopting it.",
          "Types may look more general than your goal. A theorem may quantify over any type with an inferred order instance, while your goal mentions Nat. That is a benefit: Lean can infer the specialization. Learn to recognize implicit braces, type-class brackets, and namespace-qualified names instead of treating them as noise.",
          "Imports define availability and build cost. During learning, narrow imports reveal where notation and tactics originate. Larger application modules sometimes use broader imports for convenience. In either case, never claim a snippet is Core if it depends on a Mathlib tactic or theorem.",
        ],
        analogy: {
          title: "Searching a parts catalog by dimensions",
          body: "You do not memorize every part number; you describe the connector shape and required capacity, then inspect compatible candidates. A theorem's type is its connector shape.",
          limit: "A mechanically compatible theorem can still encode different mathematical meaning, so type matching does not replace understanding assumptions and semantics.",
        },
        workedExample: {
          title: "Inspect, then apply, a library theorem",
          setup: "This example is Lean 4 Core: `List.mem_reverse` is available in the bundled List library. The workflow also applies to Mathlib declarations.",
          code: `#check List.mem_reverse

theorem appears_after_reverse {α : Type} (a : α) (xs : List α)
    (h : a ∈ xs) : a ∈ xs.reverse := by
  have equivalence : a ∈ xs.reverse ↔ a ∈ xs :=
    List.mem_reverse
  exact equivalence.mpr h`,
          steps: [
            { label: "Describe the missing bridge", explanation: "The context has membership in xs while the goal asks for membership in xs.reverse; the needed shape relates those propositions.", proofState: "h : a ∈ xs ⊢ a ∈ xs.reverse" },
            { label: "Inspect the candidate", explanation: "#check shows List.mem_reverse is an equivalence between membership before and after reverse.", proofState: "List.mem_reverse : a ∈ reverse xs ↔ a ∈ xs" },
            { label: "Specialize by expected type", explanation: "The type annotation on equivalence lets Lean infer α, a, and xs for the general library theorem.", proofState: "equivalence : a ∈ xs.reverse ↔ a ∈ xs" },
            { label: "Choose the correct direction", explanation: ".mpr moves from the right side of an iff to the left, exactly turning h into the goal.", proofState: "no goals" },
          ],
          conclusion: "The useful skill was not recalling a finished tactic script. It was identifying the logical shape, inspecting a candidate, and applying the correct direction.",
        },
        commonMistakes: [
          { mistake: "Guess theorem names repeatedly without inspecting types.", why: "Near-identical names may have different directions or assumptions.", repair: "Search by concepts, then use #check and read the complete type." },
          { mistake: "Use a suggested tactic result as unexplained magic.", why: "You may import unnecessary dependencies or misunderstand why it applies.", repair: "Inspect the generated proof or named theorem and record the meaningful dependency." },
          { mistake: "Forget to state that a tactic requires Mathlib.", why: "Readers testing a Core-only snippet receive unknown-command errors.", repair: "Mark dependencies and provide the necessary import context." },
        ],
        selfCheck: [
          { prompt: "What should you write down before searching the library?", answer: "The type or logical shape of the fact missing between the current hypotheses and goal." },
          { prompt: "What does `.mpr` do for `P ↔ Q`?", answer: "It uses the reverse implication, transforming evidence of Q into evidence of P." },
          { prompt: "Does using Mathlib enlarge Lean's trusted kernel?", answer: "Ordinary Mathlib theorems produce proof terms checked by the same kernel; the library enlarges available content, not the basic checking rule." },
        ],
      },
      {
        title: "Debugging elaboration and building minimal examples",
        question: "How do I turn a frightening project error into one precise mismatch I can understand?",
        whyItMatters: "Debugging discipline prevents random tactic changes and makes failures explainable, reproducible, and easier to ask others about.",
        explanation: [
          "Lean first elaborates convenient source syntax into a fully typed term, filling implicit arguments and resolving overloaded notation and type-class instances. Many errors therefore mean “Lean could not determine the term you intended,” not “the theorem is false.” Read the earliest error and note the expected type, actual type, and source expression.",
          "A minimal example retains the failing statement, essential definitions, and exact imports while removing unrelated project context. Reduction can reveal a missing import, ambiguous notation, namespace conflict, or unintended inferred type. It also gives you a small space for `#check` and alternate experiments.",
          "Inspect instead of guessing. Add type annotations near ambiguity, use `#check` on subexpressions and declarations, and use `#print` to see a definition or theorem. For proposition proofs, stop and translate the local context and goal into plain language before selecting a tactic.",
          "When automation fails, divide the task. Can computation simplify the goal? Is there a constructor matching the proposition? Is one library fact missing? Create a `have` statement for that bridge. A precise intermediate claim often produces a much clearer error than another broad tactic.",
          "After solving the scratch example, return the conceptual fix to the project and remove diagnostic clutter. Keep a regression theorem if the issue represents behavior that should remain protected. Debugging is complete when you understand the mismatch, not merely when an error disappears.",
        ],
        analogy: {
          title: "Testing one circuit on a bench",
          body: "An engineer removes a suspect circuit from a complex machine and supplies controlled inputs so the fault can be measured directly.",
          limit: "Removing context can also remove the cause, especially when imports or instances matter; a valid minimal example must preserve all relevant dependencies.",
        },
        workedExample: {
          title: "Resolve an ambiguous empty list with a type annotation",
          setup: "Lean 4 Core. Empty-list syntax contains no element from which Lean can infer its element type.",
          code: `#check ([] : List Nat)

def emptyNats : List Nat :=
  []

example : emptyNats.length = 0 := by
  rfl`,
          steps: [
            { label: "Identify missing information", explanation: "The notation [] can represent List α for any α, so isolated use may leave α unknown.", proofState: "expected element type is not determined" },
            { label: "Probe a typed expression", explanation: "#check with `: List Nat` confirms the intended elaboration in the smallest possible context.", proofState: "([] : List Nat) : List Nat" },
            { label: "Put intent at the boundary", explanation: "The return type of emptyNats supplies the same expected type, so [] elaborates without an internal annotation.", proofState: "emptyNats : List Nat" },
            { label: "Verify computation", explanation: "length unfolds through emptyNats and List.length [], reducing both sides to 0.", proofState: "0 = 0, then no goals" },
          ],
          conclusion: "The repair adds information where inference needs it. Random proof tactics would not solve an elaboration problem that occurs before proof construction.",
        },
        commonMistakes: [
          { mistake: "React only to the final error in a cascade.", why: "Later messages may be consequences of the first unresolved type.", repair: "Fix the earliest mismatch, then re-run elaboration." },
          { mistake: "Create a scratch file with different imports.", why: "The failure may depend on notation, instances, or theorem availability.", repair: "Begin with the exact imports and remove them one at a time." },
          { mistake: "Change tactics until the error vanishes.", why: "This can mask the conceptual mismatch and create brittle proofs.", repair: "Write the expected and actual types in plain language and bridge them explicitly." },
        ],
        selfCheck: [
          { prompt: "Why can [] need a type annotation?", answer: "It contains no element whose type could determine the list element type." },
          { prompt: "What belongs in a minimal reproducer?", answer: "The exact imports, smallest necessary definitions, and the failing declaration or expression." },
          { prompt: "When is a debugging fix understood?", answer: "When you can explain the original expected/actual mismatch and why the repaired term has the required type." },
        ],
      },
    ],
    closingQuestions: [
      "Draw the import direction for Model, Operations, and Verification modules.",
      "Given a proof-state gap, describe the theorem type you would search for before naming any tactic.",
      "List the information a minimal reproducer must preserve.",
    ],
  },
  {
    day: 14,
    opening: [
      "The capstone combines modeling, programming, specification, and proof in one small system: a counter that must never exceed a fixed maximum. Small scope is deliberate. It lets you inspect every link in the assurance chain—from the representation of valid states through one operation to an arbitrary command sequence—without hiding the argument behind industrial complexity.",
      "Finishing does not mean claiming that all counters everywhere are safe. You will learn to state the guarantee honestly: Lean checks particular theorems about particular definitions under named assumptions. You will also document the connection that has and has not been established between this model and any real implementation, then turn the project into a sustainable next month of practice.",
    ],
    prerequisites: [
      "Define structures and read generated field projections.",
      "Write recursive functions over List and perform structural induction.",
      "Understand specifications, preconditions, postconditions, and invariants from Days 11–12.",
    ],
    topics: [
      {
        title: "Modeling a bounded counter with safety in the type",
        question: "Which states and operations should the capstone model before I write proofs?",
        whyItMatters: "Representation choices determine which invalid states can be constructed and which obligations every operation must discharge.",
        explanation: [
          "Begin with the boundary of the model. A bounded counter has a current `value`, a fixed `maximum`, and the intended invariant `value ≤ maximum`. Decide whether an attempted increment at the maximum clamps, returns failure, or reports an error. Each behavior is reasonable in a different product; verification requires choosing one.",
          "A proof-carrying structure stores the invariant alongside the data. Any value of type `BoundedCounter` must contain fields plus evidence that its value is within bounds. This makes invalid states unconstructable through the checked interface and makes the invariant available by projection.",
          "The cost is that every constructor and state-changing function must prove validity. This is useful pressure: an operation cannot quietly return an out-of-range counter. It can also add friction, so large systems sometimes keep raw data separate and prove validity through predicates. The choice is an engineering tradeoff.",
          "For a beginner-friendly Core implementation, define increment by matching on evidence that `value < maximum` or not, then reuse natural-number order lemmas. Mathlib's `omega` can shorten arithmetic, but the important point is the branch reasoning: increasing is safe below the bound, and retaining the state is safe at the boundary.",
          "Write executable examples for zero, a middle value, and the boundary. Then state branch-specific theorems: below maximum the value increases; otherwise it stays fixed. These local contracts explain behavior more fully than the invariant alone.",
        ],
        analogy: {
          title: "A container with a certified capacity seal",
          body: "Every accepted container carries a seal showing its contents are within capacity; a transfer operation must produce a new valid seal.",
          limit: "Lean's evidence certifies mathematical fields, not the accuracy of a physical sensor or the honesty of data entering through unverified interfaces.",
        },
        workedExample: {
          title: "Clamp increment while carrying validity",
          setup: "This snippet uses `omega`, so it requires `import Mathlib`. The model and conditional are ordinary Lean 4.",
          code: `structure BoundedCounter where
  value : Nat
  maximum : Nat
  valid : value ≤ maximum

def increment (c : BoundedCounter) : BoundedCounter :=
  if h : c.value < c.maximum then
    { value := c.value + 1
      maximum := c.maximum
      valid := by omega }
  else c

theorem increment_safe (c : BoundedCounter) :
    (increment c).value ≤ (increment c).maximum :=
  (increment c).valid`,
          steps: [
            { label: "Encode valid states", explanation: "Constructing BoundedCounter requires value, maximum, and proof of their ordering.", proofState: "c.valid : c.value ≤ c.maximum" },
            { label: "Split operation behavior", explanation: "The dependent if gives h : value < maximum in the increment branch and its negation in the clamp branch.", proofState: "then context h : c.value < c.maximum; else returns c" },
            { label: "Prove the new record valid", explanation: "In the then branch omega derives value + 1 ≤ maximum from h. The else branch reuses the already-valid c.", proofState: "both branches produce BoundedCounter" },
            { label: "State global one-step safety", explanation: "The result's type guarantees a valid projection regardless of which branch ran.", proofState: "⊢ (increment c).value ≤ (increment c).maximum" },
            { label: "Project stored evidence", explanation: "`(increment c).valid` has exactly the target type, so no branch analysis is needed again.", proofState: "no goals" },
          ],
          conclusion: "The operation discharged its obligation when constructing the result; later proofs retrieve that certificate instead of re-proving arithmetic.",
        },
        commonMistakes: [
          { mistake: "Begin proving before deciding boundary behavior.", why: "The specification is ambiguous about clamping versus failure.", repair: "Write a behavior table for below-bound and at-bound inputs first." },
          { mistake: "Assume a structure field proves real input data is trustworthy.", why: "Unchecked external data may not yet have been converted into the proof-carrying type.", repair: "Define and verify a validation boundary that constructs the type only after checking." },
          { mistake: "Prove only `increment_safe`.", why: "Safety does not tell callers whether the value increased or clamped.", repair: "Add branch-specific functional theorems as well as the invariant theorem." },
        ],
        selfCheck: [
          { prompt: "What invalid value cannot be constructed as BoundedCounter through Lean?", answer: "A record whose value exceeds maximum, because the valid field would require an impossible proof." },
          { prompt: "Why is increment_safe almost trivial?", answer: "increment already returns a proof-carrying BoundedCounter, so validity is a stored field of its result." },
          { prompt: "What behavior choice must be documented at maximum?", answer: "Whether increment clamps, fails with Option/Except, wraps, or follows another explicitly modeled rule." },
        ],
      },
      {
        title: "Composing local guarantees into sequence safety",
        question: "How does a proof about one operation become a proof about any finite command list?",
        whyItMatters: "Systems execute sequences, not isolated steps. Composition is the bridge from unit-level correctness to a system invariant.",
        explanation: [
          "Define a command language even if it initially contains only `increment`. A command type separates requested actions from their interpreter and leaves room for additional operations. `applyCommand` implements one transition; `applyMany` recursively interprets a list of commands.",
          "Local lemmas state what one command preserves. The sequence theorem then uses induction on the command list. The empty sequence returns the original state, and a nonempty sequence applies one command before recursively processing the tail.",
          "If states carry validity in their type, every intermediate result is valid automatically. The final safety theorem can project the final record's evidence. Still, proving a separate induction theorem about behavioral properties is educational and necessary when the property is not stored in the state.",
          "Pay attention to properties that involve both starting and ending states, such as the maximum never changing. These are not automatically supplied by the validity field. Prove one-step maximum preservation, then compose it over the list by induction.",
          "This pattern scales conceptually: define states, transitions, an invariant, initial validity, and preservation. Real systems add nondeterminism, I/O, concurrency, or infinite behaviors, which require richer models, but the local-to-global reasoning habit remains central.",
        ],
        analogy: {
          title: "A chain of certified handoffs",
          body: "If each link accepts a valid state and returns a valid state, connecting any finite number of links preserves validity end to end.",
          limit: "The analogy assumes every real transition appears in the chain; unmodeled interrupts, concurrency, or external mutation are outside the theorem.",
        },
        workedExample: {
          title: "The maximum is unchanged by every command sequence",
          setup: "This extends the preceding Mathlib-based counter. The equality proof itself uses Core tactics and computation.",
          code: `inductive Command where
  | inc

def applyCommand (c : BoundedCounter) : Command → BoundedCounter
  | .inc => increment c

def applyMany : BoundedCounter → List Command → BoundedCounter
  | c, [] => c
  | c, cmd :: cmds => applyMany (applyCommand c cmd) cmds

theorem increment_maximum (c : BoundedCounter) :
    (increment c).maximum = c.maximum := by
  simp [increment]

theorem applyMany_maximum (c : BoundedCounter) (cmds : List Command) :
    (applyMany c cmds).maximum = c.maximum := by
  induction cmds generalizing c with
  | nil => rfl
  | cons cmd cmds ih =>
      simp [applyMany, applyCommand, ih, increment_maximum]`,
          steps: [
            { label: "Prove a one-step fact", explanation: "increment_maximum checks both conditional branches and records that neither changes maximum.", proofState: "⊢ (increment c).maximum = c.maximum" },
            { label: "Generalize the current state", explanation: "Each recursive call starts from applyCommand c cmd, so the induction hypothesis must accept any c.", proofState: "ih : ∀ c, (applyMany c cmds).maximum = c.maximum" },
            { label: "Handle no commands", explanation: "applyMany c [] computes to c; reflexivity proves its maximum equals the starting maximum.", proofState: "nil branch closed" },
            { label: "Expose one command and the tail", explanation: "The cons equation produces a recursive run starting from the one-step result.", proofState: "⊢ (applyMany (applyCommand c cmd) cmds).maximum = c.maximum" },
            { label: "Compose equalities", explanation: "ih preserves the intermediate maximum, and increment_maximum relates that intermediate maximum back to c.maximum.", proofState: "no goals" },
          ],
          conclusion: "Induction converts an arbitrary-length execution into one local command fact plus the same theorem for the remaining sequence.",
        },
        commonMistakes: [
          { mistake: "Prove a sequence theorem without a one-step lemma.", why: "The induction step repeats low-level branch reasoning and becomes hard to read.", repair: "Package transition preservation before tackling arbitrary lists." },
          { mistake: "Keep c fixed during command-list induction.", why: "The recursive call begins from a changed intermediate state.", repair: "Generalize c so the induction hypothesis applies to every intermediate state." },
          { mistake: "Claim sequence safety covers commands not in the model.", why: "The theorem quantifies only over the formal Command constructors.", repair: "Inventory all production transitions and explicitly document omitted ones." },
        ],
        selfCheck: [
          { prompt: "What is the base case of applyMany safety?", answer: "An empty command list returns the original state, whose relevant invariant or equality is already known." },
          { prompt: "Why generalize c in the induction?", answer: "The tail runs from a new state produced by the head command, not necessarily the original c." },
          { prompt: "What fact does the valid field not automatically prove?", answer: "Behavioral relations such as maximum staying equal to the original maximum." },
        ],
      },
      {
        title: "The trust story, verification report, and next steps",
        question: "What have I honestly proved, what remains outside the proof, and how do I continue learning?",
        whyItMatters: "Precise scope makes formal verification credible. Overclaiming destroys the trust that machine-checked reasoning is meant to strengthen.",
        explanation: [
          "The strongest justified claim is: for the formal definitions, theorem statement, and assumptions in this project, Lean's kernel accepted a proof term of the stated proposition. The kernel checks typing and reduction rules. Tactics help construct terms but do not get to declare success without kernel acceptance.",
          "Several modeling links remain. A theorem about `BoundedCounter` does not prove a separately written production counter implements the same transition. It does not prove that a sensor supplied the correct value, that hardware obeys natural-number arithmetic, or that omitted commands cannot occur. Those links need code extraction, refinement proofs, validation, testing, or external arguments.",
          "A short verification report should list the system boundary, formal state and operations, principal theorems, assumptions or axioms, exact toolchain and dependencies, and known gaps. Include executable examples as illustrations but distinguish them from universal guarantees. A reader should be able to reproduce the build and understand the claim without reading every tactic.",
          "Review the specification one final time with counterexamples and stakeholder language. Ask whether clamping was intended, whether maximum may change, and whether denial-of-service or concurrency matters. Formal precision makes disagreement visible early; it does not choose product requirements for you.",
          "For the next month, alternate solving small exercises, reading library proofs, and extending this one model. Keep a proof journal with goal shapes, failed approaches, useful declarations, and explanations of final proofs. Choose a direction—formal mathematics, verified functional programming, or system modeling—but preserve the daily loop of reading, constructing, and explaining proofs.",
        ],
        analogy: {
          title: "A laboratory result with a methods section",
          body: "A credible result names its apparatus, sample, procedure, and limitations so others know exactly what was established and can reproduce it.",
          limit: "Lean proofs provide deductive certainty inside a formal model, which differs from empirical confidence; the analogy should not blur those distinct kinds of evidence.",
        },
        workedExample: {
          title: "Turn an invariant into a client-facing theorem",
          setup: "Using the preceding definitions, the exported safety statement is intentionally small and exact.",
          code: `theorem all_commands_safe
    (start : BoundedCounter) (cmds : List Command) :
    (applyMany start cmds).value ≤
      (applyMany start cmds).maximum := by
  exact (applyMany start cmds).valid`,
          steps: [
            { label: "Identify the formal scope", explanation: "The theorem quantifies over every valid BoundedCounter and every finite list of the modeled Command type.", proofState: "start : BoundedCounter, cmds : List Command ⊢ final value ≤ final maximum" },
            { label: "Compute the result's type", explanation: "applyMany returns BoundedCounter, so its result must include evidence for the structure invariant.", proofState: "(applyMany start cmds).valid has the desired inequality type" },
            { label: "Supply the certificate", explanation: "exact selects the proof stored in the final structure.", proofState: "no goals" },
            { label: "Interpret carefully", explanation: "The statement covers all modeled finite sequences but says nothing about an unmodeled operation or separate implementation.", proofState: "kernel has accepted the scoped proposition" },
          ],
          conclusion: "A tiny proof can rest on substantial design: safety was enforced at every constructor boundary. The verification report must communicate that architecture and its limits.",
        },
        commonMistakes: [
          { mistake: "Say “the counter can never fail.”", why: "The theorem proves one bound, not absence of every bug or failure mode.", repair: "Quote the exact invariant, modeled commands, and assumptions." },
          { mistake: "Omit versions and imports from the report.", why: "Another reader may not be able to reproduce elaboration and library behavior.", repair: "Record toolchain, dependency revision, build command, and relevant imports." },
          { mistake: "End the course by memorizing tactic names.", why: "Independent proof skill comes from recognizing goal shapes and building arguments.", repair: "Practice a cycle of exercises, proof reading, project extension, and written reflection." },
        ],
        selfCheck: [
          { prompt: "What does kernel acceptance guarantee?", answer: "That the elaborated proof term has the stated proposition as its type under Lean's rules and declared assumptions." },
          { prompt: "Does all_commands_safe verify a separately implemented mobile-app counter?", answer: "No. A correspondence between that code and this model must be established separately." },
          { prompt: "What five items belong in a verification report?", answer: "Scope/model, theorem statements, assumptions, toolchain/dependencies, and known gaps or unverified links." },
        ],
      },
    ],
    closingQuestions: [
      "State the bounded-counter theorem in one sentence without overclaiming.",
      "Name two real-world behaviors omitted from the simple Command model.",
      "Write a four-week practice loop that combines exercises, proof reading, and one evolving project.",
    ],
  },
];
