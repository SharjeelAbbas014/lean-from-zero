import type { DeepDiveChapter } from "./deep-dive-types";

export const deepDivesPart1: DeepDiveChapter[] = [
  {
    day: 1,
    opening: [
      "Before learning Lean syntax, you need to know what problem theorem proving solves. Ordinary software work gives us several kinds of confidence: we read code, run examples, ask reviewers, use types, and test important cases. Each catches real mistakes, but none automatically establishes a claim about every possible input. Interactive theorem proving adds a different kind of evidence: a completely explicit statement together with an argument that a small checker can verify. This chapter builds that idea from the ground up, without assuming that you already know programming or formal logic.",
      "The word “proof” can sound like school geometry, and “interactive” can sound like clicking buttons. In Lean, a proof is better understood as a precisely structured piece of evidence. You decide what promise matters, translate it into Lean, and guide Lean while it constructs evidence. Lean continually shows what remains to be justified. The result is checked by a deliberately small component called the kernel. We will first separate proof from testing, then follow evidence through Lean’s checking pipeline, and finally learn two harmless commands that let you explore the language.",
    ],
    prerequisites: [
      "No programming or mathematical-proof experience is required.",
      "Be comfortable reading a short sentence slowly and asking what each word promises.",
      "Have access to a Lean 4 file or browser editor for the worked examples.",
    ],
    topics: [
      {
        title: "Tests, types, and proofs answer different questions",
        question: "If a program passes many tests, why would anyone also prove something about it?",
        whyItMatters: "Without this distinction, formal proof can look like expensive testing. Knowing the exact question each tool answers lets you use proof where universal certainty is valuable and tests where concrete execution is most useful.",
        explanation: [
          "A test runs a program on chosen examples and compares the observed result with an expected result. If a sorting function correctly handles [], [3], and [2, 1, 2], we have learned something real: those executions worked. A failed test gives a concrete counterexample and is extremely useful. A successful test, however, speaks only about the cases that actually ran. There are infinitely many lists of natural numbers, so no finite test suite can literally execute all of them.",
          "A type checker asks another question: are expressions combined in ways allowed by their declared types? If addition expects natural numbers, Lean rejects an attempt to add a Boolean value such as true. This prevents broad families of nonsense before execution. Yet the type Nat → Nat says only that a function accepts and returns natural numbers. It does not, by itself, say that the result is larger, sorted, secure, or equal to the answer you intended.",
          "A formal specification is a precise promise. For a sorting program, one promise might say that the output is ordered; another might say that it contains exactly the same elements as the input. Those are separate properties: a function that always returns [] produces an ordered list but loses every element. Precision forces hidden assumptions into view. Lean proves the statement you wrote, not the intention you kept in your head.",
          "A proof establishes its stated claim for every value covered by the statement. Usually it does so by reasoning about how values are built rather than by enumerating them. Proof does not make tests obsolete. Tests can check executable examples, integration with the outside world, performance, and whether the formal statement reflects the desired behavior. A strong workflow uses types, tests, reviews, and proofs as complementary layers of evidence.",
        ],
        analogy: {
          title: "Sampling soup versus checking a recipe",
          body: "Testing is like tasting spoonfuls from several places in a pot; proof is like checking, from the recipe and preparation rules, that every ingredient and step preserves a required dietary condition.",
          limit: "The analogy stops at the fact that real cooking is physical and imperfect. A formal proof applies only to an exact mathematical model, while a kitchen can deviate from its written recipe.",
        },
        workedExample: {
          title: "One example versus a universal statement",
          setup: "We define doubling, run one example, and then prove that doubling any natural number is exactly n + n. This uses only Lean 4 Core.",
          code: `def double (n : Nat) : Nat := n + n

#eval double 3

theorem double_spec (n : Nat) : double n = n + n := by
  rfl`,
          steps: [
            { label: "1. Read the definition", explanation: "double accepts an arbitrary natural number n and returns n + n. The annotation : Nat records the input and output kind." },
            { label: "2. Observe a test-like computation", explanation: "#eval double 3 asks Lean to compute one expression. It prints 6, but says nothing directly about double 4 or double 10,000." },
            { label: "3. Read the theorem universally", explanation: "Because n is an arbitrary parameter, double_spec promises the equality for every natural number n.", proofState: "n : Nat\n⊢ double n = n + n" },
            { label: "4. Unfold and compare", explanation: "By its definition, double n reduces to n + n. Both sides are therefore the same expression, and rfl closes the goal.", proofState: "no goals" },
          ],
          conclusion: "The evaluation supplies evidence about 3; the theorem supplies kernel-checked evidence for every n, but only for the exact specification stated.",
        },
        commonMistakes: [
          { mistake: "Saying that tests are useless once proofs exist.", why: "Proofs cover a model and a written specification, not deployment wiring, timing, or omitted requirements.", repair: "Say that tests and proofs answer different questions, then keep tests for examples and system behavior." },
          { mistake: "Treating a type signature as a full behavioral guarantee.", why: "Nat → Nat permits many functions, including constant zero.", repair: "Write a separate proposition for the behavior you care about." },
          { mistake: "Calling many random tests a proof.", why: "A finite sample does not cover an unbounded input space unless an additional argument connects the sample to all cases.", repair: "Use “evidence from testing” and reserve “proof” for a universal checked argument." },
        ],
        selfCheck: [
          { prompt: "A function passes 10,000 tests. What do you know with certainty?", answer: "You know those 10,000 recorded executions produced the expected results, assuming the test setup itself is accurate." },
          { prompt: "What is missing from the type Nat → Nat if you want a counter that always increases?", answer: "A behavioral proposition, such as ∀ n, next n > n." },
          { prompt: "Can a theorem prove the wrong requirement?", answer: "Yes. Lean checks that the proof matches the formal statement; humans must ensure that statement represents the real requirement." },
        ],
      },
      {
        title: "The people and machinery in an interactive proof",
        question: "What does the human do, what does Lean automate, and what is ultimately trusted?",
        whyItMatters: "Understanding the division of labor prevents two opposite confusions: thinking Lean invents the meaning of your theorem, or thinking every large automation tool must be trusted blindly.",
        explanation: [
          "Interactive theorem proving is a conversation with a very strict collaborator. The human chooses the subject, definitions, and statement. If “safe withdrawal” should mean that a balance never becomes negative, you must say so precisely. Lean cannot recover a business requirement you never expressed. The creative work—selecting useful abstractions and a proof strategy—therefore remains important even when automation is strong.",
          "During a proof, tactics are commands that transform the current obligation. A tactic might introduce an assumption, simplify an expression, search a database of lemmas, or split a claim into smaller claims. Tactics are not magical certificates. Their job is to construct a proof term: a structured expression that records evidence in the language understood by Lean.",
          "The elaborator sits between convenient source text and the fully explicit term. Humans omit many details: implicit type arguments, overloaded notation, and inferred instances. The elaborator resolves these details and reports ambiguities. This makes Lean pleasant to write while preserving a precise internal object. Elaboration can be sophisticated, but its output still faces the final checker.",
          "The kernel is the small trusted core that checks whether the completed term really has the claimed type. If an automation tactic has a bug and emits invalid evidence, the kernel rejects it. This architecture is called a small trusted computing base: fewer components must be correct for theorem soundness. It does not protect against a bad specification or a flaw in Lean’s kernel, compiler, hardware, or foundational assumptions, but it sharply narrows where trust is placed.",
        ],
        analogy: {
          title: "Architect, power tools, and inspector",
          body: "You are the architect choosing the building’s purpose; tactics and elaboration are power tools and skilled assistants; the kernel is an inspector checking the final structure against exact rules.",
          limit: "A building inspector samples physical work and can overlook hidden defects. Lean’s kernel checks the entire proof term, although it still relies on its implementation and machine environment.",
        },
        workedExample: {
          title: "Watching a tactic construct evidence",
          setup: "The theorem says that if P is true, then P is true. We write it as a tactic proof and also show the direct proof term. Lean 4 Core is sufficient.",
          code: `theorem identity_tactic (P : Prop) : P → P := by
  intro h
  exact h

theorem identity_term (P : Prop) : P → P :=
  fun h => h`,
          steps: [
            { label: "1. Start from the promise", explanation: "P is any proposition. The arrow says the theorem accepts evidence of P and must return evidence of P.", proofState: "P : Prop\n⊢ P → P" },
            { label: "2. Introduce the premise", explanation: "intro h names the incoming evidence h and moves it into the local context.", proofState: "P : Prop\nh : P\n⊢ P" },
            { label: "3. Supply exact evidence", explanation: "The goal asks for P and h has type P, so exact h completes the construction.", proofState: "no goals" },
            { label: "4. Compare the term form", explanation: "fun h => h is the evidence directly: a function that returns the proof it receives. The tactic version elaborates to essentially this shape." },
            { label: "5. Locate trust", explanation: "In both versions, the kernel checks that the resulting function has type P → P; the tactic is a convenient builder, not the final authority." },
          ],
          conclusion: "Tactics and direct terms are two interfaces for producing the same kind of kernel-checkable evidence.",
        },
        commonMistakes: [
          { mistake: "Thinking a tactic’s success message is the foundation of trust.", why: "A tactic is an evidence generator; only the resulting proof term is checked by the kernel.", repair: "Mentally trace tactic script → elaborated term → kernel check." },
          { mistake: "Assuming Lean chooses the correct real-world specification.", why: "Lean understands formal syntax, not unstated human intent.", repair: "Review definitions and theorem statements as carefully as proof scripts." },
          { mistake: "Believing the trusted base is literally nothing but the kernel.", why: "Using a theorem in practice can also depend on parsing, axioms, hardware, and correct connection to the real system.", repair: "State the trust boundary for the assurance claim you are making." },
        ],
        selfCheck: [
          { prompt: "What does a tactic have to produce to establish a theorem?", answer: "A proof term that the kernel accepts as having the theorem’s proposition as its type." },
          { prompt: "Who decides whether “balance never negative” is the right business rule?", answer: "The human modeler and stakeholders; Lean only checks the precise rule supplied." },
          { prompt: "Why is a small kernel valuable?", answer: "It concentrates soundness-critical checking in a small component that is easier to inspect and trust than every tactic." },
        ],
      },
      {
        title: "Your first conversation with Lean",
        question: "How can I safely explore what Lean thinks an expression means and what it computes to?",
        whyItMatters: "Beginners learn faster when they can ask small questions. #check and #eval turn the environment into a laboratory and make error messages part of learning rather than a verdict.",
        explanation: [
          "Every valid Lean expression has a type. A type classifies what the expression is and how it may be used. The command #check asks Lean to report that type without creating a reusable definition. Read the colon in output as “has type”: true : Bool means that the expression true has the Boolean type. Nat : Type means that Nat itself is a type.",
          "Functions have arrow types. Nat → Nat means a function accepts one natural number and returns one natural number. Function application uses a space: Nat.succ 4. Parentheses are for grouping, not a required call syntax. The function Nat.succ represents “next natural number,” so #check Nat.succ reveals its input-output contract before you use it.",
          "The command #eval asks Lean to compute an expression and display the result. It works for expressions with an executable representation, such as arithmetic, strings, Booleans, and lists. #eval is excellent for experiments, but its printed result is not automatically a theorem. Computation can support intuition while proof records a reusable logical guarantee.",
          "Errors are precise observations about a mismatch. If true + 1 fails, Lean is not grading you; it is explaining that addition and Boolean data do not fit. Read the earliest meaningful message, locate the expected and actual types, and reduce the example until the mismatch is visible. This habit scales from five-character experiments to large formal developments.",
        ],
        analogy: {
          title: "Labels and a calculator",
          body: "#check is like reading the label on a tool to learn what fits its sockets; #eval is like switching the tool on with a particular input and observing the output.",
          limit: "Lean types can express far richer relationships than physical labels, and evaluation follows formal reduction rules rather than testing a physical machine.",
        },
        workedExample: {
          title: "Inspect, predict, compute",
          setup: "Use these commands in a Lean 4 file. Predict every response before placing the cursor on the line.",
          code: `#check false
#check Nat.succ
#check fun x : Nat => x + 1
#eval Nat.succ 4
#eval (fun x : Nat => x + 1) 9`,
          steps: [
            { label: "1. Classify data", explanation: "#check false reports false : Bool. Bool is a type with the two Boolean values false and true." },
            { label: "2. Inspect a named function", explanation: "#check Nat.succ reports Nat → Nat: one natural-number input and one natural-number output." },
            { label: "3. Inspect an unnamed function", explanation: "fun x : Nat => x + 1 introduces x, specifies that x is natural, and returns x + 1; its type is Nat → Nat." },
            { label: "4. Compute a named application", explanation: "#eval Nat.succ 4 prints 5. This is one computation with input 4." },
            { label: "5. Compute the anonymous application", explanation: "The last line substitutes 9 for x and evaluates 9 + 1, producing 10." },
          ],
          conclusion: "Use #check to investigate meaning and #eval to investigate a concrete computation; neither command defines a reusable theorem.",
        },
        commonMistakes: [
          { mistake: "Reading A → B as “A implies B” in every context.", why: "For data types it is an ordinary function type; the logical reading appears when A and B are propositions.", repair: "First ask whether A and B classify data or evidence, while remembering the same function mechanism underlies both." },
          { mistake: "Writing calls only in another language’s style, such as f(x).", why: "Lean’s ordinary application syntax is f x, and parentheses primarily control grouping.", repair: "Write f x and use f (g x) when the argument is a compound expression." },
          { mistake: "Treating #eval output as a universal guarantee.", why: "It computes the expression shown, not all possible inputs.", repair: "Use a theorem with an arbitrary parameter for a general claim." },
        ],
        selfCheck: [
          { prompt: "What question does #check (fun n : Nat => n) answer?", answer: "It asks for the expression’s type; Lean reports Nat → Nat." },
          { prompt: "What is the difference between #eval f 3 and proving ∀ n, f n = n?", answer: "The first computes one case; the second requires evidence for every natural number." },
          { prompt: "How should you react to a type mismatch?", answer: "Compare the expected and actual types, isolate the smallest mismatching expression, and use the message as diagnostic evidence." },
        ],
      },
    ],
    closingQuestions: [
      "Which promises in software you use daily are universal enough that a proof would be valuable?",
      "Where does human judgment enter even after Lean accepts a theorem?",
      "Can you explain #check, #eval, a tactic, and the kernel without using the word “magic”?",
    ],
  },
  {
    day: 2,
    opening: [
      "Lean refuses to treat every expression as interchangeable. A natural number, a piece of text, a truth value, and a proof each have a type, and that type controls how the expression may be built and used. This is not bureaucracy added after programming; it is the language’s way of making promises visible. Today we will read these promises, construct small functions, and see how common shapes such as pairs and optional values let a model say more than a pile of unlabelled data.",
      "We will then approach dependent types, a phrase that often intimidates newcomers. The underlying idea is modest: a type may mention a value. Instead of merely saying “a collection of natural numbers,” a type can record “a collection containing exactly three natural numbers.” You do not need advanced mathematics to appreciate the benefit. Recording a fact in a type moves certain errors from a late runtime surprise to an early construction problem.",
    ],
    prerequisites: [
      "Know that #check asks for a type and #eval computes a concrete expression.",
      "Read A → B as a function accepting an A and returning a B.",
      "No prior programming experience is assumed.",
    ],
    topics: [
      {
        title: "Types as rules for construction and use",
        question: "What exactly does a type tell me, and what does it leave unsaid?",
        whyItMatters: "Reading types is the basic literacy of Lean. It lets you predict valid expressions, understand errors, and recognize when a behavioral guarantee needs a theorem rather than a simple signature.",
        explanation: [
          "A value is a particular piece of data, such as 4, true, or \"hello\". A type is a classification with rules. Nat classifies natural numbers starting at zero; Bool classifies true and false; String classifies text. A type tells Lean which constructors can create values and which operations accept them. This is why true + 1 is rejected before it could run.",
          "A function is also a value, and its type states an input-output contract. Nat → Bool describes any function that accepts a natural number and returns a Boolean. It does not name the function’s rule. One such function might test whether the input is zero; another might always return true. The signature prevents category errors but does not distinguish those behaviors.",
          "Lean checks a function application by matching the supplied argument type against the input type. If isZero : Nat → Bool and n : Nat, then isZero n : Bool. Application associates to the left, so f a b means (f a) b. Arrows associate to the right, so Nat → Nat → Nat means Nat → (Nat → Nat): after one input, a function remains for the second input.",
          "A useful type is therefore a deliberately chosen boundary. Broad types make functions easy to call but express fewer guarantees. Richer types rule out more invalid states but require more information at construction time. Good modeling is not about making every type maximally complicated; it is about encoding distinctions that prevent meaningful mistakes.",
        ],
        analogy: {
          title: "Shape-coded connectors",
          body: "A type resembles a connector shape: a Nat-shaped plug fits a Nat input, while a Bool-shaped plug does not. A function type describes its input socket and output plug.",
          limit: "Physical connectors only enforce shape. Lean types can also depend on values and can represent logical claims, so they encode relationships far beyond hardware sockets.",
        },
        workedExample: {
          title: "Read a two-input function one application at a time",
          setup: "This Lean 4 Core example defines a function and inspects partial and complete application.",
          code: `def addThenDouble (a : Nat) (b : Nat) : Nat :=
  2 * (a + b)

#check addThenDouble
#check addThenDouble 3
#eval addThenDouble 3 4`,
          steps: [
            { label: "1. Read the parameters", explanation: "The definition names two natural-number inputs, a and b, followed by the natural-number result type." },
            { label: "2. Read the full type", explanation: "#check addThenDouble reports Nat → Nat → Nat, grouped as Nat → (Nat → Nat)." },
            { label: "3. Supply one argument", explanation: "addThenDouble 3 has type Nat → Nat. It remembers a = 3 and is still waiting for b." },
            { label: "4. Supply the second argument", explanation: "addThenDouble 3 4 now has type Nat and computes 2 * (3 + 4)." },
            { label: "5. Evaluate", explanation: "#eval reduces the arithmetic and prints 14." },
          ],
          conclusion: "Multiple-argument Lean functions can be understood as a sequence of one-argument functions, each with a readable type.",
        },
        commonMistakes: [
          { mistake: "Confusing a value with its type.", why: "3 is a value classified by Nat; Nat is itself a type, not another natural number.", repair: "Read x : T aloud as “x has type T.”" },
          { mistake: "Assuming Nat → Bool specifies which Boolean is returned.", why: "The type constrains input and output categories, not the rule connecting them.", repair: "Add a theorem when behavior matters." },
          { mistake: "Grouping Nat → Nat → Nat from the left.", why: "Lean groups arrows to the right.", repair: "Insert the implicit parentheses: Nat → (Nat → Nat)." },
        ],
        selfCheck: [
          { prompt: "What can you conclude from f : Bool → Nat?", answer: "f accepts a Boolean and returns a natural number; nothing else about which number follows from the type alone." },
          { prompt: "If g : Nat → Nat → Bool, what is the type of g 5?", answer: "Nat → Bool." },
          { prompt: "Why can early rejection be useful?", answer: "It prevents invalid combinations from becoming runtime behavior or silently contaminating later reasoning." },
        ],
      },
      {
        title: "Definitions, functions, and structured choices",
        question: "How do I give behavior a name and model data that has several possible shapes?",
        whyItMatters: "Definitions create the vocabulary of a development. Products, alternatives, and optional values let signatures express real domain choices instead of hiding them in conventions.",
        explanation: [
          "The keyword def gives a reusable name to an expression. Parameters appear in parentheses with their types, followed by the return type and :=. The body after := is what the name means. Lean can infer many annotations, but explicit public signatures document intent and help localize errors. A definition is pure unless its type says otherwise: the result is determined by its inputs.",
          "An anonymous function uses fun x : Nat => expression. It is called anonymous because it has no permanent name, not because it is mysterious. def increment := fun x : Nat => x + 1 and def increment (x : Nat) := x + 1 express the same basic mapping. Named definitions are convenient for reuse; anonymous functions are useful as short arguments.",
          "A product type A × B stores both an A and a B. The pair (\"Ada\", 36) has type String × Nat. You can access its fields with .1 and .2 or pattern-match to give them meaningful names. Product is appropriate when both pieces always exist. A sum type Sum A B stores either an A or a B and records which alternative was chosen.",
          "Option A represents either no A or some particular A. It is safer than inventing a magic number such as 0 to mean “not found,” because 0 may be a legitimate result. To use an Option, you must handle both none and some value. The type checker enforces that exhaustiveness, turning an often-forgotten exceptional path into visible program structure.",
        ],
        analogy: {
          title: "Forms, envelopes, and optional fields",
          body: "A product is a form requiring both name and age; a sum is one envelope containing either a passport or a license; an option is a field explicitly marked empty or filled.",
          limit: "Paper forms rely on people obeying instructions. Lean’s constructors are the only legal ways to build these values, so malformed alternatives cannot be smuggled in as ordinary typed terms.",
        },
        workedExample: {
          title: "A safe first item",
          setup: "We return an Option rather than inventing a fake result for an empty list. Lean 4 Core provides List and Option.",
          code: `def firstNat (xs : List Nat) : Option Nat :=
  match xs with
  | [] => none
  | x :: _ => some x

#eval firstNat []
#eval firstNat [7, 8]`,
          steps: [
            { label: "1. Read the promise", explanation: "The input is a list of natural numbers. Option Nat says the output is either none or some natural number." },
            { label: "2. Split by list shape", explanation: "match examines how xs was built. [] is the empty-list case; x :: _ is a list with first element x and an unused remainder." },
            { label: "3. Handle emptiness honestly", explanation: "There is no first natural number for [], so the function returns none instead of an arbitrary sentinel." },
            { label: "4. Preserve the available value", explanation: "For x :: _, some x records both that a result exists and what it is." },
            { label: "5. Execute both shapes", explanation: "The evaluations produce none and some 7, demonstrating that callers can distinguish absence from the legitimate number 0." },
          ],
          conclusion: "A careful result type makes absence explicit and forces every caller to account for it.",
        },
        commonMistakes: [
          { mistake: "Using a sentinel like 0 for missing data.", why: "The sentinel can collide with a valid value and the type does not remind callers to check it.", repair: "Use Option Nat and handle none and some explicitly." },
          { mistake: "Believing _ means the list tail does not exist.", why: "_ is a pattern for a value that exists but is intentionally not named.", repair: "Read x :: _ as “a head x and a tail I do not need here.”" },
          { mistake: "Omitting a match branch.", why: "A function must produce a result for every input admitted by its type.", repair: "List every constructor shape and decide what the specification requires there." },
        ],
        selfCheck: [
          { prompt: "When should you prefer A × B over Sum A B?", answer: "Use A × B when both pieces are present; use Sum A B when exactly one of two alternatives is present." },
          { prompt: "What does some 0 communicate that bare 0 cannot?", answer: "It explicitly communicates that a result exists and that its value happens to be zero." },
          { prompt: "Why annotate a return type even if Lean can infer it?", answer: "It documents the public promise and helps ensure the implementation matches the intended abstraction." },
        ],
      },
      {
        title: "Dependent types without panic",
        question: "What does it mean for a type to depend on a value, and why would I want that?",
        whyItMatters: "Dependent types are Lean’s bridge between ordinary data and precise specifications. A calm first model makes later indexed data, equality, and theorem statements much easier to understand.",
        explanation: [
          "In an ordinary function type A → B, the output type B is fixed. A dependent function may return a type that mentions the particular input. Lean writes such a type with (x : A) → B x, often abbreviated by ∀ x : A, B x. The result for one x may therefore be classified differently from the result for another x.",
          "A familiar example is Vector α n: a sequence of values of type α whose length n is recorded in the type. List Nat says only that every element is a natural number. Vector Nat 3 additionally says the sequence has length exactly three. The numeral 3 is a value appearing inside the type, which is the defining dependent-type move.",
          "Recording length changes when errors appear. A function expecting Vector Nat 3 cannot be called with a vector of length 2. Instead of accepting the data and checking later, Lean asks you to resolve the mismatch while constructing or converting the value. This can eliminate invalid states, although it also creates proof obligations when lengths are transformed.",
          "Not every fact belongs in a type. If a fact changes frequently, is expensive to maintain, or is irrelevant to safe use, encoding it may burden every caller. Begin with types that capture stable, high-value invariants. Think of dependent typing as a precision dial, not a command to encode the entire world in every signature.",
        ],
        analogy: {
          title: "A box label containing a measurement",
          body: "List Nat is a box labelled “natural numbers.” Vector Nat 3 is labelled “natural numbers; measured count: 3,” so a shelf requiring count 3 can reject the wrong box immediately.",
          limit: "A physical label can lie or become stale. Lean’s indexed value can only receive its type through checked construction, though external measurements still need a trustworthy bridge into the model.",
        },
        workedExample: {
          title: "A length-indexed pair",
          setup: "Vector is available in Lean 4 Core. We construct a vector whose type records two elements and read its first element.",
          code: `def pairVec (a b : Nat) : Vector Nat 2 :=
  ⟨[a, b], rfl⟩

#check pairVec
#eval (pairVec 10 20).toList`,
          steps: [
            { label: "1. Read the index", explanation: "Vector Nat 2 means natural-number elements with length exactly 2; the 2 is part of the type." },
            { label: "2. Build underlying data", explanation: "[a, b] is an ordinary list containing exactly the two supplied values." },
            { label: "3. Supply the recorded fact", explanation: "The vector constructor also needs evidence that the list length equals 2. rfl works because the concrete list length computes to 2." },
            { label: "4. Inspect the function", explanation: "#check pairVec reports Nat → Nat → Vector Nat 2, so every returned value carries the same length index." },
            { label: "5. Evaluate a view", explanation: "Converting toList erases the length from the result type for display and evaluates to [10, 20]." },
          ],
          conclusion: "The length guarantee is not a comment beside the data; it participates in type checking whenever the vector is used.",
        },
        commonMistakes: [
          { mistake: "Thinking Vector Nat 2 means a vector whose elements equal 2.", why: "Nat is the element type and 2 is the length index.", repair: "Read it aloud as “a vector of naturals of length two.”" },
          { mistake: "Assuming dependent types remove all runtime validation.", why: "Untrusted external data must still be parsed and checked before it can inhabit a precise type.", repair: "Validate at the boundary, then construct the indexed value." },
          { mistake: "Encoding every imaginable business fact in types immediately.", why: "Proof and conversion obligations can overwhelm the value of weak or changing invariants.", repair: "Start with stable invariants whose violation would cause meaningful errors." },
        ],
        selfCheck: [
          { prompt: "What value appears in the type Vector String 5?", answer: "The natural number 5, recording the vector’s length." },
          { prompt: "What advantage does a length-index give a consumer?", answer: "The consumer may rely on the checked length without separately handling impossible sizes." },
          { prompt: "What tradeoff comes with richer types?", answer: "They rule out more invalid states but require more evidence when values are constructed or transformed." },
        ],
      },
    ],
    closingQuestions: [
      "For a contact lookup, why is Option String more honest than String with an empty-string convention?",
      "Which fact in a domain you know would be valuable enough to record in a type?",
      "Can you distinguish what a function’s signature guarantees from what requires a theorem?",
    ],
  },
  {
    day: 3,
    opening: [
      "So far, types have classified data and programs. Lean’s central unifying idea is that a logical proposition is also a type, and a proof is a value of that type. This is called the propositions-as-types correspondence, or Curry–Howard correspondence. The name matters less than the working rule: to prove a proposition, construct the kind of evidence that proposition asks for. Lean can then check a theorem using the same precise type-checking machinery used for programs.",
      "This chapter makes that rule concrete. We will learn what evidence looks like for implication, conjunction, disjunction, truth, falsehood, and equality. We will also compare direct proof terms with tactic scripts. There is no hidden change in standards between them: tactics are an interactive way to build terms, and the kernel checks the final term. By the end, elementary proof steps should feel like assembling well-typed data rather than reciting ritual words.",
    ],
    prerequisites: [
      "Read x : T as “x has type T.”",
      "Understand a function type A → B as accepting an A and returning a B.",
      "Know that def names data or computation; this chapter introduces theorem for proved propositions.",
    ],
    topics: [
      {
        title: "A proposition is a type inhabited by its evidence",
        question: "How can a claim such as P → P be a type, and what counts as a value of it?",
        whyItMatters: "This is the mental model behind Lean proofs. Once evidence has a type, logical rules become ordinary construction and use rules rather than a disconnected list of tactics.",
        explanation: [
          "Prop is Lean’s universe of propositions: the classification containing claims that may have proofs. If P : Prop, then P is a proposition. A term h : P is evidence establishing P. You usually cannot inspect proofs for useful runtime data, but Lean can check that they were built according to the rules of the proposition.",
          "An implication P → Q has exactly the function shape you already know. To build evidence for it, assume you receive evidence hP : P and produce evidence of Q. The resulting function converts any proof of the premise into a proof of the conclusion. If nobody can supply P, the function still correctly describes what would follow from it.",
          "This explains why theorem statements can contain parameters. theorem keep (P : Prop) : P → P does not claim that every P is true. It claims that for any chosen proposition P, given evidence of P, the same evidence establishes P. The distinction between assuming P and proving P from nothing is essential.",
          "Lean’s kernel checks the constructed term against the proposition. It does not judge persuasiveness, writing style, or authority. A proof can be tiny because the proposition is structurally simple, while a short English sentence may hide substantial formal detail. Difficulty belongs to the exact statement and definitions, not to how impressive the prose sounds.",
        ],
        analogy: {
          title: "Evidence-shaped admission tickets",
          body: "Treat each proposition as a venue with a precisely shaped ticket. A proof is a ticket of that shape, and an implication is a machine that turns a P-ticket into a Q-ticket.",
          limit: "Real tickets can be forged and are checked by visual convention. Lean evidence is constructed and type-checked by formal rules; moreover, propositions are not physical places.",
        },
        workedExample: {
          title: "Compose two implications",
          setup: "Given evidence converters P → Q and Q → R, construct P → R. Lean 4 Core is enough.",
          code: `theorem compose (P Q R : Prop)
    (hPQ : P → Q) (hQR : Q → R) : P → R :=
  fun hP =>
    hQR (hPQ hP)`,
          steps: [
            { label: "1. Inventory the converters", explanation: "hPQ converts P-evidence into Q-evidence; hQR converts Q-evidence into R-evidence.", proofState: "P Q R : Prop\nhPQ : P → Q\nhQR : Q → R\n⊢ P → R" },
            { label: "2. Accept the premise", explanation: "fun hP => begins the required function and gives us hP : P.", proofState: "hP : P\n⊢ R" },
            { label: "3. Produce intermediate evidence", explanation: "Applying hPQ to hP yields hPQ hP : Q." },
            { label: "4. Produce final evidence", explanation: "Applying hQR to that Q-evidence yields hQR (hPQ hP) : R." },
            { label: "5. Check the whole function", explanation: "Because every P input is mapped to R evidence, the lambda has type P → R.", proofState: "no goals" },
          ],
          conclusion: "Logical implication is operational: evidence flows through functions exactly as ordinary values do.",
        },
        commonMistakes: [
          { mistake: "Reading P → Q as asserting P.", why: "The arrow promises a conversion only if P-evidence is supplied.", repair: "Separate “P is available” from “if P, then Q.”" },
          { mistake: "Thinking a theorem parameter P : Prop is a proof of P.", why: "P names a proposition; a separate h : P would be its evidence.", repair: "Track names and types: proposition P versus proof hP : P." },
          { mistake: "Believing an implication with an impossible premise is dishonest.", why: "It specifies a valid converter for every possible premise proof; if none exists, it is never invoked.", repair: "Judge implication by whether Q follows from any supplied P evidence." },
        ],
        selfCheck: [
          { prompt: "What is required to prove P → Q?", answer: "A function that accepts arbitrary evidence of P and returns evidence of Q." },
          { prompt: "Does h : P → Q give you Q by itself?", answer: "No. You also need evidence of P to apply h." },
          { prompt: "In fun hP => hP, what role does hP play?", answer: "It is the incoming proof of P and also the returned proof of P." },
        ],
      },
      {
        title: "Logical connectives describe evidence shapes",
        question: "What must I build for And and Or, and how do True and False fit?",
        whyItMatters: "Most beginner proof decisions follow from the outermost connective. Learning its evidence shape gives you a reliable strategy before you memorize tactics.",
        explanation: [
          "Evidence of P ∧ Q contains both parts: a proof of P and a proof of Q. Lean’s constructor And.intro hP hQ builds it, and ⟨hP, hQ⟩ is concise notation. From h : P ∧ Q, h.left extracts P and h.right extracts Q. A conjunction is therefore product-like: neither half is optional.",
          "Evidence of P ∨ Q contains one chosen side and its evidence. Or.inl hP establishes the left alternative; Or.inr hQ establishes the right. To use an Or hypothesis safely, you must handle both possible constructors, because the caller—not your proof—chose which evidence was packaged.",
          "True is a proposition with a simple constructor, True.intro, so it is always provable. False is a proposition with no constructors, so there is no direct way to build evidence of it in consistent ordinary reasoning. If a context nevertheless contains hFalse : False, eliminating that impossible evidence can establish any goal. This is the principle of explosion, implemented by False.elim.",
          "These rules are constructive: a proof records how evidence is made or transformed. To prove P ∨ Q, you normally must know which side and provide its proof. Lean can use classical principles when explicitly requested, but the default evidence story contains useful computational information and avoids assuming every arbitrary proposition is decidable.",
        ],
        analogy: {
          title: "A two-item parcel and a tagged package",
          body: "And is a parcel containing both requested items. Or is a package tagged LEFT or RIGHT and containing the corresponding item. Pattern matching reads the tag before using the contents.",
          limit: "Physical parcels may be empty or mislabeled. Typed constructors guarantee the logical package has exactly the evidence its tag declares.",
        },
        workedExample: {
          title: "Swap the sides of a conjunction",
          setup: "We unpack evidence of P ∧ Q and rebuild evidence of Q ∧ P. Lean 4 Core only.",
          code: `theorem swapAnd (P Q : Prop) : P ∧ Q → Q ∧ P := by
  intro h
  constructor
  · exact h.right
  · exact h.left`,
          steps: [
            { label: "1. Introduce packaged evidence", explanation: "The goal is an implication, so intro h accepts h : P ∧ Q.", proofState: "P Q : Prop\nh : P ∧ Q\n⊢ Q ∧ P" },
            { label: "2. Follow the goal shape", explanation: "constructor builds And evidence and creates one goal for each required component.", proofState: "case left\n⊢ Q\n\ncase right\n⊢ P" },
            { label: "3. Fill the Q component", explanation: "h.right extracts the Q proof stored in the original conjunction.", proofState: "⊢ P" },
            { label: "4. Fill the P component", explanation: "h.left extracts the P proof, completing the second component.", proofState: "no goals" },
            { label: "5. Understand the result", explanation: "No proposition was invented; the same two pieces of evidence were repackaged in the opposite order." },
          ],
          conclusion: "The theorem is a data transformation from one evidence shape to another.",
        },
        commonMistakes: [
          { mistake: "Proving only one side of P ∧ Q.", why: "And evidence requires both components.", repair: "Use constructor and complete every generated goal." },
          { mistake: "Choosing a convenient branch when using h : P ∨ Q.", why: "The evidence may have been built with either constructor.", repair: "Use cases and prove the target in both branches." },
          { mistake: "Treating False as the Boolean false.", why: "False : Prop is an uninhabited proposition; false : Bool is ordinary two-valued data.", repair: "Track capitalization and type: False versus false." },
        ],
        selfCheck: [
          { prompt: "What does a proof of P ∧ Q physically contain in Lean’s evidence model?", answer: "A proof of P and a proof of Q." },
          { prompt: "Why does eliminating P ∨ Q produce two branches?", answer: "Because Or evidence has two possible constructors and the consumer must handle either." },
          { prompt: "How many constructors does False have?", answer: "None, which is why direct evidence of False cannot be built." },
        ],
      },
      {
        title: "Proof terms, tactics, and computational equality",
        question: "Are tactic proofs different from proof terms, and when can rfl prove equality?",
        whyItMatters: "Seeing both views demystifies tactics and explains why short equality proofs can be rigorous rather than hand-waving.",
        explanation: [
          "A direct proof term is the finished evidence written as an expression. For P → P, fun h => h directly states the proof function. This style reveals the propositions-as-types structure clearly, but nested evidence can become difficult to edit. Lean checks the entire term against the theorem type.",
          "A tactic proof begins with by and gives goal-directed construction commands. intro creates a function by naming its input; exact supplies a term for the current goal; constructor invokes a proposition’s constructor. As the script runs, Lean displays a proof state. The tactics elaborate into a proof term, and the same kernel checks it.",
          "Equality a = b is itself a proposition. Its fundamental constructor is reflexivity: every expression equals itself. The tactic or term rfl proves goals whose two sides become identical after Lean performs definitional computation, such as unfolding transparent definitions and reducing function applications.",
          "Definitional equality is not a claim that any two mathematically equal-looking expressions are automatically the same. Lean’s reduction rules are specific. For example, a user definition may unfold directly, while an algebraic rearrangement such as n + m = m + n generally needs a theorem. Start with rfl when both sides should compute to identical expressions; if it fails, inspect the actual difference rather than repeating it.",
        ],
        analogy: {
          title: "Finished furniture versus assembly instructions",
          body: "A proof term is the assembled object; a tactic script is a sequence of workshop instructions that produces it. The kernel checks the finished object against the specification.",
          limit: "Ordinary assembly instructions might be trusted without inspecting the result. Lean checks the generated term completely, and proof terms are mathematical expressions rather than physical objects.",
        },
        workedExample: {
          title: "The same theorem in two styles",
          setup: "A small definition computes by unfolding, allowing rfl. No Mathlib import is needed.",
          code: `def twice (n : Nat) : Nat := n + n

theorem twice_term (n : Nat) : twice n = n + n :=
  rfl

theorem twice_tactic (n : Nat) : twice n = n + n := by
  rfl`,
          steps: [
            { label: "1. Read the goal", explanation: "For arbitrary n, the left side is twice n and the right side is n + n.", proofState: "n : Nat\n⊢ twice n = n + n" },
            { label: "2. Unfold the definition", explanation: "Lean reduces twice n using its defining equation to n + n." },
            { label: "3. Compare both sides", explanation: "After reduction, the goal is effectively n + n = n + n." },
            { label: "4. Apply reflexivity", explanation: "rfl supplies equality evidence because both expressions are definitionally identical.", proofState: "no goals" },
            { label: "5. Compare interfaces", explanation: "The first theorem gives rfl directly; the second asks the tactic framework to place the same evidence in the goal." },
          ],
          conclusion: "Tactic syntax changes how you construct evidence, not what the kernel ultimately accepts.",
        },
        commonMistakes: [
          { mistake: "Assuming tactics bypass kernel checking.", why: "Tactics generate terms that face the same type checker.", repair: "Think of by as entering an interactive term-building mode." },
          { mistake: "Expecting rfl to prove every true equality.", why: "rfl handles reflexive or computation-identical sides, not arbitrary mathematical reasoning.", repair: "Unfold mentally; use lemmas or rewriting when the normal forms differ." },
          { mistake: "Thinking a short proof is less rigorous.", why: "Rigor comes from precise checking, not source-code length.", repair: "Evaluate whether the term’s type is the required proposition and whether the trusted assumptions are appropriate." },
        ],
        selfCheck: [
          { prompt: "What happens to a tactic proof before the theorem is accepted?", answer: "It elaborates into a proof term, which the kernel type-checks." },
          { prompt: "Why can rfl prove twice n = n + n?", answer: "Unfolding twice makes both sides the same expression." },
          { prompt: "Would rfl usually prove n + 0 = n for arbitrary Nat n?", answer: "Not necessarily from the surface statement; whether reduction suffices depends on how Nat addition recurses, and a theorem or induction may be needed." },
        ],
      },
    ],
    closingQuestions: [
      "Can you describe the evidence shape for →, ∧, ∨, True, False, and equality?",
      "Why does assuming P inside a proof of P → Q not mean P was proved globally?",
      "When rfl fails, what does that teach you about the two expressions?",
    ],
  },
  {
    day: 4,
    opening: [
      "A proof state is not an error message. It is Lean’s exact description of where you are: the objects and evidence currently available, followed by the proposition you still owe. Once you can read this display aloud, tactic choice becomes far less mysterious. You stop guessing at commands and start making small transformations whose effects you can predict.",
      "Today’s aim is deliberate proof craft. We will learn the context-and-goal layout, then study intro, exact, apply, constructor, and assumption as transformations rather than incantations. Finally, we will build a debugging loop: read, predict, take one step, observe, and explain. This may feel slower for ten minutes, but it creates the mental interpreter that makes later proofs dramatically faster.",
    ],
    prerequisites: [
      "Know that a proof is a term whose type is the proposition being proved.",
      "Recognize implication P → Q and conjunction P ∧ Q.",
      "Be willing to pause after each tactic and read the displayed goal.",
    ],
    topics: [
      {
        title: "The proof state is a precise to-do list",
        question: "How do I read the names above ⊢ and the expression below it?",
        whyItMatters: "Nearly every useful tactic decision depends on distinguishing available evidence from the current obligation. Misreading that boundary makes even tiny proofs feel arbitrary.",
        explanation: [
          "The local context appears above the turnstile symbol ⊢. Entries such as P Q : Prop declare local propositions; n : Nat declares a natural number; hP : P records available evidence of P. These declarations are temporary assumptions or parameters for the current theorem branch, not global facts about the world.",
          "Below ⊢ is the current goal: the type of evidence Lean asks you to construct. If the display contains hP : P above and ⊢ P below, exact hP closes the goal because the available term has exactly the requested type. Read the display aloud as “given these items, construct this evidence.”",
          "A tactic transforms this state. It may close the goal, change it into a prerequisite, add a name to the context, or produce several goals. Multiple goals are not failures. They mean the evidence structure has several pieces, and every branch must eventually be completed.",
          "Names matter only for human readability; types determine validity. Naming evidence h, hP, or evidenceOfP changes no logic, but descriptive names reduce mistakes. When several hypotheses have similar shapes, names such as hUserActive and hHasPermission are far safer than h1 and h2.",
        ],
        analogy: {
          title: "A workbench and a blueprint",
          body: "The context is everything currently lying on your workbench; the goal is the blueprint for the piece you must produce. A tactic uses or rearranges workbench items and updates the outstanding blueprint.",
          limit: "A physical workbench can hide or damage objects. Lean’s context is an exact scoped list, and only typed transformations can change the proof obligation.",
        },
        workedExample: {
          title: "Read before acting",
          setup: "The theorem receives two propositions and evidence of each, then returns evidence of P. Lean 4 Core.",
          code: `theorem chooseFirst (P Q : Prop) (hP : P) (hQ : Q) : P := by
  exact hP`,
          steps: [
            { label: "1. Read declarations", explanation: "P and Q are propositions. hP is proof of P; hQ is proof of Q.", proofState: "P Q : Prop\nhP : P\nhQ : Q\n⊢ P" },
            { label: "2. Identify the target type", explanation: "The goal below ⊢ is P, so we need a term whose type is precisely P." },
            { label: "3. Scan by type", explanation: "hP : P matches. hQ does not match even though it is also proof evidence." },
            { label: "4. Supply the term", explanation: "exact hP fills the goal with that evidence.", proofState: "no goals" },
          ],
          conclusion: "Proof-state reading is type matching: inventory what you have, name what you need, and justify the connection.",
        },
        commonMistakes: [
          { mistake: "Treating every context proposition as already proved.", why: "P : Prop only declares a claim; hP : P is its evidence.", repair: "Look for a proof-valued name, not merely the proposition’s declaration." },
          { mistake: "Reading ⊢ backward.", why: "This swaps resources and obligation.", repair: "Read “context ⊢ goal” as “from the context, produce the goal.”" },
          { mistake: "Panicking when two goals appear.", why: "Some constructors legitimately require multiple components.", repair: "Focus the first goal, finish it, then handle the next." },
        ],
        selfCheck: [
          { prompt: "In n : Nat, h : n = 3 ⊢ n = 3, which term closes the goal?", answer: "exact h." },
          { prompt: "Does P : Prop mean Lean has a proof of P?", answer: "No; it only introduces P as a proposition." },
          { prompt: "What does “no goals” mean?", answer: "All required evidence for that proof branch has been constructed." },
        ],
      },
      {
        title: "Core tactics are evidence transformations",
        question: "What do intro, exact, apply, constructor, and assumption really do?",
        whyItMatters: "These five operations solve a large fraction of elementary proofs. Understanding their before-and-after states is more durable than memorizing examples.",
        explanation: [
          "intro handles a goal beginning with an implication or universal binder. For P → Q, it starts a function: a new hP : P appears in the context and Q becomes the goal. It has not proved P; it says, “show me how to obtain Q under the promised input P.”",
          "exact term closes a goal when term has exactly the goal type after elaboration. assumption asks Lean to search the local context for such a term. exact is explicit and teaches you which evidence is used; assumption is convenient when the match is obvious. Neither derives new facts by itself.",
          "apply h reasons backward from a conclusion. If h : P → Q and the goal is Q, apply h changes the goal to P. More generally, a theorem may have several premises, and apply creates an obligation for every premise not already inferred. It is valid because satisfying those inputs lets h produce the desired conclusion.",
          "constructor selects the standard constructor for a goal such as P ∧ Q. Since And evidence needs two fields, it creates goals P and Q. Bullets · visually scope tactics to branches. After any core move, reread the entire state: a legal tactic can still take you down an inconvenient route.",
        ],
        analogy: {
          title: "Working backward through a recipe",
          body: "apply is like seeing that a recipe produces the requested cake and replacing “make cake” with its ingredient obligations. constructor is like opening a two-part kit and completing both compartments.",
          limit: "Recipes may be approximate and ingredients interchangeable. Lean applies exact typed rules, and every generated premise must be proved.",
        },
        workedExample: {
          title: "Backward chaining through two implications",
          setup: "We prove that P reaches R through intermediate Q. Lean 4 Core.",
          code: `example (P Q R : Prop)
    (hPQ : P → Q) (hQR : Q → R) : P → R := by
  intro hP
  apply hQR
  apply hPQ
  exact hP`,
          steps: [
            { label: "1. Introduce arrow input", explanation: "intro hP turns the goal P → R into R while adding hP : P.", proofState: "hPQ : P → Q\nhQR : Q → R\nhP : P\n⊢ R" },
            { label: "2. Work backward from R", explanation: "apply hQR matches its conclusion R and leaves its premise Q.", proofState: "⊢ Q" },
            { label: "3. Work backward again", explanation: "apply hPQ matches Q and leaves P.", proofState: "⊢ P" },
            { label: "4. Use available evidence", explanation: "exact hP matches the final goal.", proofState: "no goals" },
            { label: "5. Read forward", explanation: "Given P, hPQ yields Q, then hQR yields R. The backward tactic process built this forward evidence pipeline." },
          ],
          conclusion: "apply changes a desired conclusion into justified prerequisites; it does not assume those prerequisites are true.",
        },
        commonMistakes: [
          { mistake: "Using intro when the goal is not an arrow or binder.", why: "There is no input to move into context.", repair: "Inspect the goal’s outermost symbol before choosing intro." },
          { mistake: "Thinking apply h proves h’s premises.", why: "apply creates those premises as new goals.", repair: "Immediately read every resulting goal and plan how to discharge it." },
          { mistake: "Using constructor on any goal with two visible subexpressions.", why: "constructor follows an actual inductive constructor, not typography.", repair: "Use it when the goal type has an appropriate constructor, such as And.intro." },
        ],
        selfCheck: [
          { prompt: "If h : A → B and the goal is B, what does apply h leave?", answer: "A new goal A." },
          { prompt: "What changes after intro h on goal A → B?", answer: "h : A is added to context and B becomes the goal." },
          { prompt: "When is assumption appropriate?", answer: "When the local context already contains evidence matching the current goal." },
        ],
      },
      {
        title: "A disciplined feedback loop for stuck proofs",
        question: "How do I debug a proof without randomly trying tactics?",
        whyItMatters: "Random tactic search produces fragile knowledge. A repeatable read–predict–observe loop turns failures into precise information and scales to larger developments.",
        explanation: [
          "First, read the goal’s outer shape. An arrow suggests intro; an And suggests constructor; a target matching a hypothesis suggests exact; a target matching the conclusion of an available implication suggests apply. This is a heuristic, not a law, but it narrows choices using structure rather than memory.",
          "Second, predict the next state in plain language before typing. Say, “After intro hP, P should appear above and Q should remain below.” Then execute one tactic and compare. If the state differs, stop. That mismatch reveals a gap in your mental model while the example is still small.",
          "Third, distinguish syntax errors, type mismatches, and unfinished goals. A syntax error means Lean could not parse the command. A type mismatch means a proposed term has the wrong type. An unfinished goal means some required evidence remains. Each category calls for a different repair; adding more tactics blindly usually obscures the first useful message.",
          "Finally, shrink confusing cases. Copy the theorem into a small example, remove irrelevant hypotheses, replace complicated definitions by proposition letters, and restore detail gradually. Search libraries only after you can phrase the missing bridge by type—for example, “I need Q → R”—because Lean theorem names often differ from guessed English.",
        ],
        analogy: {
          title: "Single-stepping a route",
          body: "Instead of taking several turns and noticing you are lost much later, verify the landmark after each turn. The first mismatch identifies the wrong assumption.",
          limit: "Road landmarks can be ambiguous; Lean states are exact. Also, some efficient proofs intentionally make larger automated jumps once their effect is understood.",
        },
        workedExample: {
          title: "Build both halves with narrated states",
          setup: "We construct P ∧ Q from separate implications sharing a premise. Lean 4 Core.",
          code: `example (P Q R : Prop) (hPQ : P → Q) (hPR : P → R) :
    P → Q ∧ R := by
  intro hP
  constructor
  · exact hPQ hP
  · exact hPR hP`,
          steps: [
            { label: "1. Predict intro", explanation: "Because the goal starts P →, intro should add hP : P and leave Q ∧ R.", proofState: "hP : P\n⊢ Q ∧ R" },
            { label: "2. Predict constructor", explanation: "And evidence has two parts, so constructor should create goals Q and R.", proofState: "case left\n⊢ Q\n\ncase right\n⊢ R" },
            { label: "3. Complete Q", explanation: "hPQ hP applies the Q-producing implication to available P evidence." },
            { label: "4. Complete R", explanation: "The second bullet changes focus; hPR hP supplies R.", proofState: "no goals" },
            { label: "5. Narrate the proof", explanation: "One P input is reused to construct both fields of the output conjunction." },
          ],
          conclusion: "Every line has a predicted state transition, making both success and failure informative.",
        },
        commonMistakes: [
          { mistake: "Pasting many tactics before inspecting the first change.", why: "The final error may be far from the incorrect assumption.", repair: "Add one meaningful line, inspect, and explain it." },
          { mistake: "Searching by guessed theorem names too early.", why: "Names are less stable and informative than required types.", repair: "Write the missing input-output shape first, then search." },
          { mistake: "Deleting a failed attempt without learning from the state.", why: "The mismatch is evidence about your mental model.", repair: "Record expected versus actual state before revising." },
        ],
        selfCheck: [
          { prompt: "What should you predict before running constructor on P ∧ Q?", answer: "That it will create separate goals P and Q." },
          { prompt: "Why minimize a confusing theorem?", answer: "It isolates the essential type mismatch or logical gap from irrelevant definitions." },
          { prompt: "What is the first useful debugging question after a tactic?", answer: "What changed in the context and goals, and why?" },
        ],
      },
    ],
    closingQuestions: [
      "Can you read a proof state aloud without confusing declarations, hypotheses, and the target?",
      "Can you state the before-and-after effect of each core tactic?",
      "What would your prediction loop look like when a tactic creates two goals instead of one?",
    ],
  },
  {
    day: 5,
    opening: [
      "Logical symbols become manageable when you treat them as instructions about evidence. A conjunction asks for two pieces; a disjunction contains one of two tagged alternatives; a universal statement behaves like a function that works for an arbitrary input; an existential statement packages one witness with evidence about it. Negation is not a mysterious opposite-value operation—it is a function showing that the proposed evidence would lead to the uninhabited proposition False.",
      "This chapter focuses equally on building and using each form. Constructing an Or lets you choose a side; consuming an Or requires handling both sides. Constructing an existential lets you choose a witness; consuming one gives you the witness chosen by somebody else. That change of control is the source of many beginner mistakes. We will also mark the boundary between constructive reasoning, where evidence carries explicit content, and classical reasoning, which Lean permits when requested.",
    ],
    prerequisites: [
      "Read contexts and goals, including multiple tactic branches.",
      "Use intro, exact, constructor, and apply on simple propositions.",
      "Understand that propositions are types and proofs are evidence values.",
    ],
    topics: [
      {
        title: "Build and unpack conjunctions and disjunctions",
        question: "Why do And and Or use different tactics depending on whether they are goals or hypotheses?",
        whyItMatters: "The direction—constructing versus consuming—determines who chose the evidence. Keeping that distinction clear prevents invalid branch selection and makes compound logic predictable.",
        explanation: [
          "To prove P ∧ Q, you control construction and must supply both pieces. constructor creates goals P and Q; ⟨hP, hQ⟩ builds the pair directly. To use h : P ∧ Q, both pieces are already present, so projections h.left and h.right retrieve them, or rcases h with ⟨hP, hQ⟩ names both at once.",
          "To prove P ∨ Q, you also control construction, but only one branch is required. left changes the goal to P; right changes it to Q. Direct terms Or.inl hP and Or.inr hQ make the chosen constructor explicit. You must choose a branch for which you can actually provide evidence.",
          "To use h : P ∨ Q, the producer made the choice. You cannot assume which constructor was used. cases h creates one branch with hP : P and another with hQ : Q. The original target must be proved in both branches, after which the result is valid regardless of the hidden tag.",
          "This construct-versus-consume perspective generalizes beyond logic. Inductive data is built with constructors and used by considering constructor cases. Tactics simply expose that structure. When unsure, ask: am I manufacturing evidence of this type, or inspecting evidence that someone else supplied?",
        ],
        analogy: {
          title: "Packing and receiving a shipment",
          body: "When packing an Or shipment, you choose the LEFT or RIGHT box. When receiving it, you must inspect the label and have a handling plan for either. An And shipment always contains both compartments.",
          limit: "Real packages may be mislabeled or damaged. Lean constructors guarantee the tag and contents agree, and case analysis is exhaustive by type.",
        },
        workedExample: {
          title: "Swap an unknown disjunction",
          setup: "Transform P ∨ Q into Q ∨ P without knowing which side arrived. Lean 4 Core.",
          code: `example (P Q : Prop) : P ∨ Q → Q ∨ P := by
  intro h
  cases h with
  | inl hP =>
      exact Or.inr hP
  | inr hQ =>
      exact Or.inl hQ`,
          steps: [
            { label: "1. Accept the package", explanation: "intro h gives h : P ∨ Q and leaves Q ∨ P.", proofState: "h : P ∨ Q\n⊢ Q ∨ P" },
            { label: "2. Inspect its constructor", explanation: "cases h creates an inl branch carrying hP : P and an inr branch carrying hQ : Q." },
            { label: "3. Handle original left", explanation: "If P arrived, the new goal Q ∨ P is built on its right with Or.inr hP." },
            { label: "4. Handle original right", explanation: "If Q arrived, the new disjunction is built on its left with Or.inl hQ." },
            { label: "5. Rejoin branches", explanation: "Both possible origins produce Q ∨ P, so the case split is complete.", proofState: "no goals" },
          ],
          conclusion: "You may choose a constructor when producing Or, but must respect every constructor when consuming it.",
        },
        commonMistakes: [
          { mistake: "Using constructor to prove P ∨ Q.", why: "Or needs a choice of inl or inr, not both subgoals.", repair: "Use left/right or Or.inl/Or.inr with evidence for the selected side." },
          { mistake: "Extracting h.left from h : P ∨ Q.", why: "An Or value contains only one side, so no universal left projection exists.", repair: "Use cases h and handle both constructors." },
          { mistake: "Proving only one cases branch.", why: "The incoming value could have been built by either constructor.", repair: "Complete the same target in every generated branch." },
        ],
        selfCheck: [
          { prompt: "Who chooses the branch when you prove P ∨ Q?", answer: "You, as the producer of the Or evidence." },
          { prompt: "Who chose the branch when h : P ∨ Q is supplied?", answer: "The producer of h, so your consumer must handle both possibilities." },
          { prompt: "What is contained in h : P ∧ Q?", answer: "Both P evidence and Q evidence." },
        ],
      },
      {
        title: "Universal claims and existential witnesses",
        question: "How do ∀ and ∃ change who chooses a value?",
        whyItMatters: "Quantifiers express claims about collections of values. The chooser distinction prevents fake universal proofs and invalid assumptions about hidden existential witnesses.",
        explanation: [
          "A universal proposition ∀ x : α, P x says that P holds for every x of type α. Its proof behaves like a dependent function: given an arbitrary x, it returns evidence of P x. To construct one, intro x introduces an arbitrary value—not a favorite example—and leaves P x as the goal.",
          "To use h : ∀ x, P x, you may apply it to a particular value t and obtain h t : P t. Universal elimination specializes a general rule. The type of t must match the quantified domain, and the resulting proposition substitutes t wherever x appeared.",
          "An existential proposition ∃ x : α, P x says that at least one suitable value exists. To prove it constructively, choose a witness w and prove P w. Lean packages them as ⟨w, hw⟩. A mere guess is not enough; evidence must establish the property for that exact witness.",
          "To consume h : ∃ x, P x, rcases h with ⟨w, hw⟩ reveals some witness w and its proof hw : P w. You do not get to replace w with a more convenient value. The witness may remain abstract, but any conclusion you derive must work from the property supplied.",
          "The chooser pattern is worth memorizing: the producer of ∀ must handle an input chosen by the consumer; the producer of ∃ chooses one witness. When consuming ∀, you choose an input; when consuming ∃, you accept the packaged witness. This is the function-versus-package distinction in logical form.",
        ],
        analogy: {
          title: "A universal service and a certified example",
          body: "A ∀ proof is a service counter that must handle any valid ticket a customer brings. An ∃ proof is a sealed folder containing one selected item and its certificate.",
          limit: "A real service may fail or a certificate may be forged. Lean evidence is total over its stated domain and kernel-checked, but only inside the formal model.",
        },
        workedExample: {
          title: "Carry a property out of an existential conjunction",
          setup: "From someone satisfying both P and Q, prove that someone satisfies Q. Lean 4 Core.",
          code: `example (P Q : Nat → Prop) :
    (∃ x, P x ∧ Q x) → ∃ x, Q x := by
  intro h
  rcases h with ⟨w, hP, hQ⟩
  exact ⟨w, hQ⟩`,
          steps: [
            { label: "1. Accept existential evidence", explanation: "intro h gives a package containing some natural w and evidence P w ∧ Q w.", proofState: "h : ∃ x, P x ∧ Q x\n⊢ ∃ x, Q x" },
            { label: "2. Unpack all fields", explanation: "rcases reveals w, hP : P w, and hQ : Q w. We did not choose w.", proofState: "w : Nat\nhP : P w\nhQ : Q w\n⊢ ∃ x, Q x" },
            { label: "3. Choose a justified witness", explanation: "For the new existential we may choose; reusing w is natural because we already have Q w." },
            { label: "4. Package witness and proof", explanation: "⟨w, hQ⟩ has exactly the target existential type.", proofState: "no goals" },
            { label: "5. Notice discarded evidence", explanation: "hP is unused. The conclusion asks only for Q, so forgetting the extra property is legitimate." },
          ],
          conclusion: "Existential reasoning preserves the link between a witness and the evidence known about that same witness.",
        },
        commonMistakes: [
          { mistake: "Proving ∀ n, P n by checking several numerals.", why: "The input introduced by ∀ is arbitrary and the domain may be unbounded.", repair: "intro n and reason without assuming a special value unless cases cover the type exhaustively." },
          { mistake: "Giving a witness without its property proof.", why: "Existential evidence is a dependent pair, not a bare candidate.", repair: "After use/exact ⟨w, ?_⟩, prove P w." },
          { mistake: "Changing an unpacked witness freely.", why: "The accompanying proof refers to the witness actually stored.", repair: "Keep witness and evidence linked, or prove a relationship that transports the property." },
        ],
        selfCheck: [
          { prompt: "What is a proof of ∀ x, P x operationally?", answer: "A function accepting arbitrary x and returning evidence of P x." },
          { prompt: "What two items inhabit ∃ x, P x?", answer: "A witness w and evidence of P w." },
          { prompt: "When using an existential hypothesis, may you assume its witness is 0?", answer: "No, unless the hypothesis or another proof establishes that fact." },
        ],
      },
      {
        title: "Negation, contradiction, and constructive boundaries",
        question: "What is ¬P, why does False imply any goal, and when is reasoning classical?",
        whyItMatters: "Negation proofs are common and easy to misuse. Understanding them as functions to False clarifies contradiction and reveals which results carry constructive information.",
        explanation: [
          "Lean defines ¬P as P → False. To prove ¬P, introduce hypothetical evidence hP : P and derive False. This does not mean the Boolean test for P returned false. It means any proposed proof of P can be transformed into evidence of an impossible proposition.",
          "If the context has hP : P and hNotP : ¬P, then hNotP hP : False. From hFalse : False, False.elim hFalse can produce evidence of any proposition Q. This is sound because there are no ordinary constructors for False: a function consuming an impossible input has no real case to mishandle.",
          "Constructive logic asks proofs to carry explicit evidence. In particular, P ∨ ¬P is not automatically available for every arbitrary proposition P, because choosing a side would require deciding P. Many concrete propositions are decidable, but a proposition parameter has no decision procedure merely because we named it.",
          "Lean supports classical reasoning through declarations such as Classical.em P, usually after opening or invoking Classical. Classical principles can be appropriate for ordinary mathematics, but they may remove computational content. Marking the choice helps readers understand assumptions and prevents accidental reliance when an executable witness is desired.",
          "Double-negation elimination illustrates the boundary. Constructively, P implies ¬¬P, but ¬¬P → P is not generally derivable without a classical principle or decidability. This is not Lean being weak; it is Lean distinguishing “P cannot be false” from explicit evidence of P.",
        ],
        analogy: {
          title: "An impossible access credential",
          body: "A proof of ¬P is a procedure showing that any P-credential would produce an impossible credential. Once an impossible credential appears, the premises are inconsistent, so no real case constrains what follows.",
          limit: "Security systems can malfunction and issue contradictory credentials. False in Lean has no constructor inside the logical rules; inconsistency can enter only through assumptions, axioms, or a trusted-system failure.",
        },
        workedExample: {
          title: "A contradiction eliminates a conjunction",
          setup: "From P and ¬P packaged together, derive arbitrary Q. Lean 4 Core.",
          code: `example (P Q : Prop) : P ∧ ¬P → Q := by
  intro h
  have hFalse : False := h.right h.left
  exact False.elim hFalse`,
          steps: [
            { label: "1. Accept contradictory evidence", explanation: "intro h gives both h.left : P and h.right : ¬P.", proofState: "h : P ∧ ¬P\n⊢ Q" },
            { label: "2. Expand negation mentally", explanation: "h.right has type P → False, so it can consume h.left." },
            { label: "3. Derive False", explanation: "have names the result hFalse : False without changing its logical content.", proofState: "hFalse : False\n⊢ Q" },
            { label: "4. Eliminate impossibility", explanation: "False.elim hFalse has the target type Q, whatever proposition Q is.", proofState: "no goals" },
            { label: "5. Locate the source", explanation: "The proof did not manufacture contradiction; the theorem premise explicitly supplied inconsistent evidence." },
          ],
          conclusion: "Negation is used by function application, and contradiction is powerful precisely because valid False evidence has no constructive source.",
        },
        commonMistakes: [
          { mistake: "Equating ¬P with P = false.", why: "P is a proposition, while false is a Boolean value; negation is P → False.", repair: "Expand ¬P in your head whenever tactic behavior is unclear." },
          { mistake: "Invoking contradiction without deriving False.", why: "A feeling that assumptions conflict is not typed evidence.", repair: "Apply the negation proof to the positive proof and name the resulting False." },
          { mistake: "Assuming excluded middle is constructive by default.", why: "An arbitrary P need not carry a decision procedure.", repair: "Either produce the relevant side, use decidability, or explicitly request a classical principle." },
        ],
        selfCheck: [
          { prompt: "What input and output does hNotP : ¬P have?", answer: "It accepts evidence of P and returns evidence of False." },
          { prompt: "Why can False.elim target any Q?", answer: "False has no constructors, so there is no possible valid input case that the eliminator fails to handle." },
          { prompt: "What information may a constructive existential proof carry that a purely classical existence argument may not?", answer: "An explicit witness and evidence tied to it, potentially usable in computation." },
        ],
      },
    ],
    closingQuestions: [
      "For each of ∧, ∨, ∀, and ∃, who controls the relevant pieces when constructing and when consuming evidence?",
      "Can you expand ¬P and trace a contradiction as ordinary function application?",
      "When would explicitly classical reasoning be acceptable, and when would you want constructive witness data?",
    ],
  },
];
