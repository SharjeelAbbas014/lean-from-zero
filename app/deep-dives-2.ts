import type { DeepDiveChapter } from "./deep-dive-types";

export const deepDivesPart2: DeepDiveChapter[] = [
  {
    day: 6,
    opening: [
      "Equality is the bridge between knowing that two things mean the same thing and being allowed to replace one with the other. In ordinary mathematics we make these replacements silently. Lean asks us to say why each replacement is legal. That extra precision can feel fussy at first, but it reveals the real structure of an argument: which facts are computations, which facts are assumptions, and which facts require earlier theorems.",
      "Today we separate equality that Lean can see by calculating from equality that needs evidence. We then use that evidence with `rw`, organize several equal steps with `calc`, and let `simp` perform routine cleanup. The goal is not to memorize tactics. It is to learn to predict what expression Lean sees before and after each move, so that failed rewrites become useful information rather than mysterious errors.",
    ],
    prerequisites: [
      "Read a goal as assumptions above the line and a target below it.",
      "Recognize a function application such as `double 3` and a natural-number expression such as `3 + 3`.",
      "Know that a proof of a proposition is a value Lean checks.",
    ],
    topics: [
      {
        title: "Definitional equality and equality evidence",
        question: "Why can `rfl` prove some equalities immediately but not obvious facts such as addition being commutative?",
        whyItMatters: "Choosing between computation and a theorem is the first diagnostic decision in almost every equality proof.",
        explanation: [
          "An equality goal has the form `left = right`. Its simplest proof is reflexivity: anything is equal to itself. Lean names the reflexivity proof `rfl`. Importantly, Lean reduces expressions before deciding whether the two sides are the same. Reduction means carrying out built-in computation, substituting function arguments, and unfolding transparent definitions.",
          "When two expressions become identical by this reduction, they are definitionally equal. For example, if `double n` is defined to mean `n + n`, then `double 3` reduces to `3 + 3`; natural-number computation reduces that to `6`. The source text differs, but Lean's evaluator reaches the same expression on both sides, so `rfl` works.",
          "Propositional equality is different. A term `h : a = b` is explicit evidence that `a` and `b` are equal. Lean does not generally rearrange arbitrary expressions during reduction. Thus `a + b` and `b + a` do not reduce to the same expression when `a` and `b` are unknown. Their equality is true, but it needs the theorem `Nat.add_comm a b`.",
          "This division protects meaning. Definitions determine computation; proved theorems determine mathematical knowledge. If `rfl` fails, do not conclude the statement is false. Ask whether the equality requires a law rather than calculation, or whether a definition must be unfolded before both sides line up.",
        ],
        analogy: {
          title: "A folded instruction card",
          body: "Definitional equality is like unfolding a card to reveal that two printed descriptions are literally the same instruction. Propositional equality is like attaching a signed certificate that two different instructions always produce the same result.",
          limit: "The analogy stops at authority: Lean does not trust a signature or reputation. It checks the certificate as a proof term under precise logical rules.",
        },
        workedExample: {
          title: "Separate computation from a mathematical law",
          setup: "The first theorem computes. The second uses an existing Core theorem because variables prevent full calculation.",
          code: `def double (n : Nat) : Nat := n + n

example : double 3 = 6 := by
  rfl

example (a b : Nat) : double (a + b) = (a + b) + (a + b) := by
  rfl`,
          steps: [
            { label: "Read the definition", explanation: "`double n` is an abbreviation for `n + n`.", proofState: "⊢ double 3 = 6" },
            { label: "Unfold", explanation: "Lean replaces `double 3` with `3 + 3`.", proofState: "⊢ 3 + 3 = 6" },
            { label: "Compute", explanation: "Natural-number addition evaluates both sides to the same numeral.", proofState: "⊢ 6 = 6" },
            { label: "Close by reflexivity", explanation: "`rfl` supplies the proof that the remaining expression equals itself.", proofState: "no goals" },
          ],
          conclusion: "`rfl` did not use an arithmetic search procedure; it succeeded because definition unfolding and computation made the sides identical.",
        },
        commonMistakes: [
          { mistake: "Trying `rfl` on `a + b = b + a`.", why: "Unknown variables prevent evaluation, and commutativity is a theorem rather than a reduction rule.", repair: "Use `exact Nat.add_comm a b` or rewrite with `Nat.add_comm`." },
          { mistake: "Assuming different-looking source text can never be definitionally equal.", why: "Lean compares reduced expressions, not just their printed spelling.", repair: "Mentally unfold definitions and compute small closed expressions before choosing a tactic." },
          { mistake: "Unfolding every definition manually.", why: "This creates noisy goals and hides the mathematical step.", repair: "Try `rfl`; unfold only the definition that prevents Lean from seeing the reduction." },
        ],
        selfCheck: [
          { prompt: "Would `example : (fun x : Nat => x + 1) 4 = 5 := by rfl` work?", answer: "Yes. Function application substitutes `4` for `x`, and the closed addition computes to `5`." },
          { prompt: "Why is `n + 0 = n` not merely the same situation as `3 + 0 = 3`?", answer: "The second is closed computation. With unknown `n`, whether `rfl` works depends on which argument `Nat.add` recursively examines; the general fact may need a theorem or induction." },
          { prompt: "What question should you ask after `rfl` fails?", answer: "Ask whether the sides require a mathematical law, a hypothesis, or controlled unfolding rather than computation alone." },
        ],
      },
      {
        title: "Rewriting as justified substitution",
        question: "What exactly changes when Lean executes `rw [h]`, and how do you control its direction and location?",
        whyItMatters: "Most practical proofs connect known facts to a goal by replacing equals inside larger expressions.",
        explanation: [
          "Suppose the context contains `h : oldPrice = newPrice`. Equality's central promise is substitutability: any occurrence of `oldPrice` may be replaced by `newPrice` without changing truth. The tactic `rw [h]` searches the target for an expression matching the left side of `h` and replaces it with the right side.",
          "Direction matters because the target might contain `newPrice` instead. Writing `rw [← h]` uses the same evidence backward. The left arrow does not create a new fact; equality is symmetric, and the notation tells the rewriter which orientation to use.",
          "A rewrite may happen in the goal or in an assumption. By default `rw [h]` changes the goal. Writing `rw [h] at invoice` changes the hypothesis named `invoice`; `rw [h] at *` tries all hypotheses and the goal. Targeted rewriting is usually easier to understand because it limits the changing surface.",
          "When Lean reports that a pattern was not found, compare the exact left side of the chosen orientation with the printed target. Parentheses, an unopened definition, a reversed equality, or a slightly different function can block a match. Rewriting is precise structural replacement, not an English-language similarity search.",
        ],
        analogy: {
          title: "A controlled find-and-replace",
          body: "A proof of equality is like an approved replacement rule, and `rw` applies that rule inside a larger document. Direction chooses which phrase is replaced; `at` chooses which document is edited.",
          limit: "Text replacement matches characters, while Lean matches typed expression structure and can infer hidden arguments. Two phrases that look similar may still have different types and therefore cannot be rewritten.",
        },
        workedExample: {
          title: "Transport an equal price through a total",
          setup: "No arithmetic is needed. One known equality is transported through multiplication.",
          code: `def total (price quantity : Nat) : Nat := price * quantity

example (oldPrice newPrice quantity : Nat)
    (h : oldPrice = newPrice) :
    total oldPrice quantity = total newPrice quantity := by
  rw [h]`,
          steps: [
            { label: "Inspect the context", explanation: "`h` permits replacement from `oldPrice` to `newPrice`.", proofState: "h : oldPrice = newPrice\n⊢ total oldPrice quantity = total newPrice quantity" },
            { label: "Find a match", explanation: "The goal contains `oldPrice` as the first argument on the left.", proofState: "matched: oldPrice" },
            { label: "Rewrite", explanation: "`rw [h]` changes that occurrence to `newPrice`.", proofState: "⊢ total newPrice quantity = total newPrice quantity" },
            { label: "Finish", explanation: "The rewrite tactic closes the resulting reflexive equality automatically.", proofState: "no goals" },
          ],
          conclusion: "Equality evidence can be used under any surrounding function; we did not need a special theorem about `total`.",
        },
        commonMistakes: [
          { mistake: "Using `rw [h]` when only the right side of `h` occurs.", why: "The chosen orientation has no matching left-hand pattern.", repair: "Try `rw [← h]` after confirming that the reverse replacement leads toward the goal." },
          { mistake: "Rewriting every location with `at *` immediately.", why: "Useful hypotheses may become harder to recognize, and the proof's intended change becomes unclear.", repair: "Name the exact goal or hypothesis to rewrite first." },
          { mistake: "Expecting `rw` to perform algebra around a near match.", why: "`rw` substitutes an exact expression shape; it does not rearrange the goal to create that shape.", repair: "Use an intermediate equality, unfold a definition, or first rewrite with an algebraic lemma that exposes the needed pattern." },
        ],
        selfCheck: [
          { prompt: "If `h : a = b` and the goal contains only `b`, which direction should you try?", answer: "`rw [← h]`, because its oriented left side is then `b`." },
          { prompt: "What does `rw [h] at invoice` change?", answer: "Only the hypothesis named `invoice`; the target remains unchanged unless the tactic later affects it." },
          { prompt: "Does rewriting prove that the surrounding function respects equality?", answer: "That substitutability is built into equality itself, so the rewrite is valid inside any well-typed surrounding expression." },
        ],
      },
      {
        title: "Readable chains and responsible simplification",
        question: "When should you use `calc`, and when is `simp` the right amount of automation?",
        whyItMatters: "A proof should be easy to audit after it works; these tools balance explicit reasoning with routine cleanup.",
        explanation: [
          "A `calc` block presents an equality argument as a chain of intermediate expressions. Each line states a destination and gives evidence for that single transition. Lean checks that the end of one line is the start of the next, so a long transformation becomes a series of small, local obligations.",
          "`simp` is a rewriting engine with a curated collection of equations oriented toward simpler forms. It unfolds selected definitions, uses facts such as `x + 0 = x`, and repeats safe rewrites until no rule applies. Supplying `simp [total, h]` adds a definition and a local fact to that run.",
          "The word simpler is operational, not philosophical. The simplifier follows its registered rules; it does not invent the human proof strategy. It is excellent for constructor equations, neutral elements, and routine Boolean or logical cleanup. It is a poor substitute for explaining the central surprising step.",
          "Combine the tools deliberately: use `calc` to expose the conceptual route and `simp` at a line where the remaining work is normalization. If a bare `simp` succeeds but you cannot explain why, inspect a more explicit version or restrict its rules. A short proof is valuable only if future readers can understand its dependencies.",
        ],
        analogy: {
          title: "Journey legs and housekeeping",
          body: "`calc` is an itinerary listing each meaningful stop, while `simp` is a housekeeping crew that removes routine clutter at a stop.",
          limit: "Unlike human cleaners, `simp` has no judgment about your story or intent. It follows a fixed and extensible rule database and may change when imports change.",
        },
        workedExample: {
          title: "Expose the important substitution",
          setup: "The `calc` block records the hypothesis-driven step, then Core's `simp` handles multiplication by zero.",
          code: `def total (price quantity : Nat) : Nat := price * quantity

example (oldPrice newPrice : Nat) (h : oldPrice = newPrice) :
    total oldPrice 0 = 0 := by
  calc
    total oldPrice 0 = total newPrice 0 := by rw [h]
    _ = 0 := by simp [total]`,
          steps: [
            { label: "Choose an intermediate", explanation: "We make price replacement visible as its own equality.", proofState: "⊢ total oldPrice 0 = total newPrice 0" },
            { label: "Justify the leg", explanation: "`rw [h]` substitutes the equal price.", proofState: "first calc line complete" },
            { label: "Continue from `_`", explanation: "The underscore means the previous expression, `total newPrice 0`.", proofState: "⊢ total newPrice 0 = 0" },
            { label: "Normalize", explanation: "`simp [total]` unfolds `total` and simplifies multiplication by zero.", proofState: "no goals" },
          ],
          conclusion: "The proof displays its meaningful dependency on `h` while delegating unsurprising arithmetic cleanup to `simp`.",
        },
        commonMistakes: [
          { mistake: "Treating `simp` as a general theorem prover.", why: "It rewrites with known simplification rules; it does not search arbitrary mathematical arguments.", repair: "Identify the main lemma or case split yourself, then use `simp` for the residue." },
          { mistake: "Adding many unrelated lemmas to `simp [...]`.", why: "Large rule sets obscure dependencies and can rewrite in unexpected directions.", repair: "Pass the smallest definition and local facts needed for this normalization." },
          { mistake: "Writing a `calc` chain whose adjacent expressions do not match.", why: "Each new line must begin conceptually where the previous line ended.", repair: "Use `_` for the previous expression and verify one transition at a time." },
        ],
        selfCheck: [
          { prompt: "What does `_` mean at the start of a later `calc` line?", answer: "It stands for the expression reached by the preceding line." },
          { prompt: "Why might `simp [total]` succeed where `simp` does not?", answer: "The bracketed name explicitly permits unfolding `total`, exposing multiplication rules the simplifier already knows." },
          { prompt: "Which part of a proof belongs in `calc` rather than hidden in broad automation?", answer: "The conceptually important transformations a reader needs to see and audit." },
        ],
      },
    ],
    closingQuestions: [
      "For each equality in your latest proof, was it computation, a hypothesis, or a library theorem?",
      "Can you predict the exact target after a forward and backward rewrite?",
      "Could a `calc` block make the central idea clearer than a sequence of tactics?",
    ],
  },
  {
    day: 7,
    opening: [
      "Before proving facts about data, we must understand how Lean says what data can exist. An inductive type is a declaration of every legal way to build a value. This is more than a storage format: its constructors determine how programs may inspect the value, how recursive functions may consume it, and later how proofs may cover every possibility.",
      "We begin with small finite choices, then constructors that carry fields, and finally recursive data such as natural numbers, lists, and expression trees. The recurring discipline is to follow the shape given by constructors. When code mirrors that shape, exhaustiveness and termination stop feeling like arbitrary compiler restrictions and become evidence that the definition covers all inputs and produces an answer.",
    ],
    prerequisites: [
      "Recognize a type as a collection of possible values.",
      "Read a function signature `A → B` as taking an `A` and returning a `B`.",
      "Understand that a definition must produce a result for every promised input.",
    ],
    topics: [
      {
        title: "Constructors define a closed set of possibilities",
        question: "How does an inductive declaration tell Lean both how to build values and how to reason about every value?",
        whyItMatters: "Constructor literacy is the foundation of pattern matching, recursion, case proofs, and induction.",
        explanation: [
          "An inductive declaration first names a new type, then lists constructors. A constructor is a certified way to create a value of that type. If `TrafficLight` has constructors `red`, `amber`, and `green`, every `TrafficLight` value came from exactly one of those choices.",
          "This is called a closed world: code elsewhere cannot secretly add a fourth constructor. Because the list is complete, a function can inspect a value by writing one branch for every constructor. Lean checks exhaustiveness and reports a missing branch instead of letting an unhandled input fail later.",
          "Constructors may carry data. `Shape.circle` can carry a radius; `Shape.rectangle` can carry a width and height. Pattern matching does two jobs at once: it discovers which constructor was used and gives names to that constructor's fields.",
          "Constructor names are often written with a leading dot inside a context where Lean already knows the type. Thus `.circle r` abbreviates `Shape.circle r`. This is convenient notation, not a different value or a method call.",
        ],
        analogy: {
          title: "Sealed labeled packages",
          body: "Imagine a warehouse accepting only three certified package shapes. Looking at a package label tells you which shape it has, and opening it reveals the fields packed by that constructor.",
          limit: "Real warehouses may receive damaged or unknown packages. A Lean value cannot be an unlisted constructor once it has successfully been assigned the inductive type.",
        },
        workedExample: {
          title: "Cover every delivery status",
          setup: "This is Lean 4 Core. The function returns a message for each possible constructor.",
          code: `inductive Delivery where
  | preparing
  | inTransit (stopsRemaining : Nat)
  | delivered

def statusMessage (d : Delivery) : String :=
  match d with
  | .preparing => "Preparing"
  | .inTransit n => "Stops left: " ++ toString n
  | .delivered => "Delivered"`,
          steps: [
            { label: "Introduce the type", explanation: "`Delivery` is the new set of values.", proofState: "constructors: preparing | inTransit Nat | delivered" },
            { label: "Read the input", explanation: "`statusMessage` promises a `String` for every `Delivery`.", proofState: "d : Delivery ⊢ String" },
            { label: "Match constructors", explanation: "Each branch corresponds to one and only one construction form.", proofState: "three constructor branches required" },
            { label: "Expose carried data", explanation: "In the `inTransit` branch, `n` names the stored natural number.", proofState: "n : Nat ⊢ String" },
            { label: "Check exhaustiveness", explanation: "All three constructors appear, so there is no missing input case.", proofState: "definition accepted" },
          ],
          conclusion: "The declaration is simultaneously a recipe for creating deliveries and a checklist for consuming them.",
        },
        commonMistakes: [
          { mistake: "Thinking a later file can add a constructor.", why: "Inductive constructors are fixed when the type is declared.", repair: "Change the original model or wrap it in a larger type with an additional case." },
          { mistake: "Forgetting to bind constructor fields in a pattern.", why: "`inTransit` is not a complete value until its `Nat` field is supplied.", repair: "Write `.inTransit n` and use or deliberately ignore `n`." },
          { mistake: "Adding a catch-all branch before understanding the cases.", why: "It can hide meaningful distinctions and make later changes less visible.", repair: "List constructors explicitly while learning or when each case carries domain meaning." },
        ],
        selfCheck: [
          { prompt: "Can a `Delivery` value exist that is neither preparing, in transit, nor delivered?", answer: "No. Those constructors are the complete public ways to create the type." },
          { prompt: "What new information becomes available in `.inTransit n`?", answer: "The stored `Nat` is exposed and named `n` for that branch." },
          { prompt: "Why is exhaustive matching safer than checking a tag with a default?", answer: "Lean verifies that every constructor is handled and alerts you when the data model changes." },
        ],
      },
      {
        title: "Recursive data and structural recursion",
        question: "How can a type contain smaller values of itself, and how does that shape a terminating function?",
        whyItMatters: "Lists, trees, syntax, and natural numbers are recursive; most useful Lean programs and proofs traverse them.",
        explanation: [
          "A recursive inductive type has a constructor containing one or more values of the type being defined. A list is either empty, or a head element paired with a smaller tail list. A tree is a leaf, or a node containing subtrees. These are finite construction histories, not circular objects.",
          "A structurally recursive function follows those constructors. It gives an immediate result for a nonrecursive constructor and may call itself on recursive fields in another constructor. For a list, recursion on `xs` in `x :: xs` is accepted because `xs` is visibly a smaller component of the original input.",
          "Lean checks termination because definitions are used inside types and proofs. If unrestricted nontermination could masquerade as a proof value, logical claims would lose their intended meaning. Structural recursion gives Lean a simple, local reason that evaluation must eventually reach a base constructor.",
          "When writing a recursive function, first write the constructor branches without their bodies. The data declaration supplies the skeleton. Then ask what result belongs to the base case and how the current fields combine with the already-computed result for each smaller field.",
        ],
        analogy: {
          title: "A stack of trays",
          body: "A nonempty list is like a top tray plus a smaller stack underneath. Processing the stack means handling the top and delegating the rest to the strictly smaller stack until no trays remain.",
          limit: "A physical stack might be infinite in imagination or rearranged during processing. Lean's ordinary inductive lists are finite immutable values, and recursion does not mutate them.",
        },
        workedExample: {
          title: "Count list elements from its construction",
          setup: "The definition duplicates the idea of Core's `List.length` for teaching.",
          code: `def myLength {α : Type} : List α → Nat
  | [] => 0
  | _ :: xs => 1 + myLength xs

#eval myLength ["tea", "bread", "rice"]`,
          steps: [
            { label: "Identify constructors", explanation: "`List` offers `[]` and `x :: xs`.", proofState: "input : List α" },
            { label: "Handle empty", explanation: "An empty list contains zero elements and makes no recursive call.", proofState: "myLength [] = 0" },
            { label: "Handle cons", explanation: "A nonempty list contributes one head element.", proofState: "myLength (_ :: xs) = 1 + myLength xs" },
            { label: "Recurse smaller", explanation: "`xs` is the tail field and is structurally smaller.", proofState: "recursive call: myLength xs" },
            { label: "Evaluate", explanation: "Three cons layers lead to `1 + 1 + 1 + 0`.", proofState: "result: 3" },
          ],
          conclusion: "The recursive program is not an arbitrary loop; it is a direct reading of how lists are constructed.",
        },
        commonMistakes: [
          { mistake: "Recursing on the original list instead of its tail.", why: "Lean cannot see progress, and evaluation would repeat forever.", repair: "Call the function on a recursive field such as `xs`." },
          { mistake: "Omitting the empty-list branch.", why: "Every finite list traversal eventually reaches `[]`.", repair: "Start from the base constructor before designing the recursive branch." },
          { mistake: "Assuming `_` deletes the head.", why: "It is only a pattern saying the field exists but its value is not needed.", repair: "Bind it as `x` whenever the result depends on the head." },
        ],
        selfCheck: [
          { prompt: "Why is `xs` smaller in the pattern `x :: xs`?", answer: "It is a recursive field used to construct the original list, with one fewer cons layer." },
          { prompt: "What guarantees `myLength` reaches its base case?", answer: "Every recursive call uses the finite list's tail, removing one constructor layer." },
          { prompt: "What two questions define a typical list function?", answer: "What happens for `[]`, and how does the answer for `x :: xs` use `x` and the recursive answer for `xs`?" },
        ],
      },
      {
        title: "Expression trees and evaluation",
        question: "How do constructors let us model a tiny language and write a total interpreter for it?",
        whyItMatters: "Syntax trees make the connection between modeling, recursive computation, and later correctness proofs concrete.",
        explanation: [
          "A language expression is data describing a computation, rather than the result of that computation. The constructor `number 3` describes a literal. The constructor `add left right` describes an addition whose operands are themselves expressions. Because operands can contain more operators, the type is a tree.",
          "An evaluator gives meaning to each constructor. A number evaluates to its stored value. An addition evaluates both subexpressions and adds their results. Multiplication does the analogous work. Covering all constructors means the evaluator defines semantics for the entire tiny language.",
          "Notice the separation between syntax and semantics. `Expr.add (.number 2) (.number 3)` is a tree value; `5` is the natural number it denotes after evaluation. This separation is the basis of compilers, interpreters, query languages, and theorem statements about programs.",
          "Recursive calls occur on direct subexpressions, so termination follows the finite tree structure. Later, induction over `Expr` will give one proof branch per constructor and induction hypotheses for recursive children—the proof plan will mirror this evaluator.",
        ],
        analogy: {
          title: "A written recipe and the finished dish",
          body: "An expression tree is a recipe containing smaller recipes, while evaluation is the act of following it to produce a result.",
          limit: "Cooking can fail or depend on the world. This evaluator is total and deterministic: every well-formed `Expr` has exactly one natural-number result.",
        },
        workedExample: {
          title: "Evaluate a nested arithmetic expression",
          setup: "This Core example models `(2 + 3) * 4` explicitly as data.",
          code: `inductive Expr where
  | number (value : Nat)
  | add (left right : Expr)
  | multiply (left right : Expr)

def eval : Expr → Nat
  | .number n => n
  | .add a b => eval a + eval b
  | .multiply a b => eval a * eval b

#eval eval (.multiply (.add (.number 2) (.number 3)) (.number 4))`,
          steps: [
            { label: "Read the root", explanation: "The outer constructor is `multiply`, so evaluation multiplies two recursive results.", proofState: "eval addTree * eval (.number 4)" },
            { label: "Evaluate the left tree", explanation: "Its root is `add`, leading to `eval 2 + eval 3`.", proofState: "(2 + 3) * eval (.number 4)" },
            { label: "Evaluate literals", explanation: "Each `number n` branch returns its stored `n`.", proofState: "(2 + 3) * 4" },
            { label: "Compute addition", explanation: "The left subtree becomes `5`.", proofState: "5 * 4" },
            { label: "Compute multiplication", explanation: "Natural-number computation returns `20`.", proofState: "result: 20" },
          ],
          conclusion: "Each constructor receives a meaning, and recursive structure composes those meanings into the whole result.",
        },
        commonMistakes: [
          { mistake: "Confusing `.number 2` with the natural number `2`.", why: "They have different types: one is syntax `Expr`, the other is a semantic value `Nat`.", repair: "Use `eval` when you need to cross from an expression description to its result." },
          { mistake: "Forgetting to evaluate child expressions before combining them.", why: "`a` and `b` have type `Expr`, so natural-number `+` cannot combine them directly.", repair: "Write `eval a + eval b`." },
          { mistake: "Adding a constructor without updating `eval`.", why: "The new expression form has no specified meaning.", repair: "Let Lean's exhaustiveness error guide you to add a corresponding branch." },
        ],
        selfCheck: [
          { prompt: "What is the type of `.add (.number 1) (.number 2)`?", answer: "`Expr`, not `Nat`." },
          { prompt: "Why are two recursive calls allowed in the multiplication branch?", answer: "Both operands are direct, structurally smaller subexpressions." },
          { prompt: "What would a new `subtract` constructor require?", answer: "A declaration field shape and a new `eval` branch defining its natural-number semantics." },
        ],
      },
    ],
    closingQuestions: [
      "Can you list every constructor before writing a consumer for a type?",
      "Which recursive field gets smaller in each function call?",
      "Can you distinguish a syntax tree from the value its evaluator returns?",
    ],
  },
  {
    day: 8,
    opening: [
      "Induction is often taught as a mysterious ladder: prove zero, prove the next number, and somehow receive all numbers. Lean makes the mechanism less mystical. Natural numbers and lists are built by constructors, and induction is the rule for proving a property across every possible construction. The base branch covers a constructor with no recursive content; the step branch receives the property for smaller content and must establish it for the newly built value.",
      "The skill is not merely typing `induction`. You must choose the input whose structure drives the computation, read the induction hypothesis as a precisely typed reusable fact, and sometimes strengthen the claim so that fact is general enough. We will trace the proof state rather than treating simplification as magic, because the moment just before the hypothesis applies is where induction becomes understandable.",
    ],
    prerequisites: [
      "Know the constructors `Nat.zero`, `Nat.succ`, `List.nil`, and `List.cons`.",
      "Be able to read a recursive definition and identify which argument gets smaller.",
      "Use `rfl`, `rw`, and small `simp` calls for equality goals.",
    ],
    topics: [
      {
        title: "Induction as exhaustive constructor reasoning",
        question: "Why does proving a base case and a step case establish a statement for every natural number?",
        whyItMatters: "Understanding where the induction hypothesis comes from prevents rote, directionless induction proofs.",
        explanation: [
          "A property of natural numbers can be represented as `P : Nat → Prop`: for each number `n`, `P n` is the claim about that number. To prove `∀ n, P n`, we must cover every way a natural number is built. One constructor is zero. The other is successor, which builds `Nat.succ n` from a smaller `n`.",
          "The zero branch asks for `P 0`. The successor branch gives an arbitrary `n` and an induction hypothesis `ih : P n`, then asks for `P (Nat.succ n)`. The hypothesis is justified because `n` is the recursive ingredient used to build the successor value.",
          "This covers all finite naturals: zero is covered directly; one is the successor of zero and uses the zero result; two uses the one result; and so on. Lean's induction principle packages this constructor-based argument. There is no hidden statistical leap from a few examples.",
          "The tactic syntax names each constructor branch. Read the goal after entering a branch. The names `n` and `ih` are local values supplied by Lean, and the type of `ih` tells you exactly what smaller statement is available—not whatever statement you wish were available.",
        ],
        analogy: {
          title: "Dominoes with a construction rule",
          body: "The base proof stands the first domino, and the step proof shows that whenever the domino for `n` falls, the constructed next domino falls too.",
          limit: "Physical dominoes can be missing or infinitely spaced. Induction is not an experiment; it follows from the formal constructors of `Nat` and establishes a logical statement.",
        },
        workedExample: {
          title: "Prove right addition by zero",
          setup: "This Lean 4 Core proof uses induction because `Nat.add` computes by recursion in a direction that does not make the general goal reflexive.",
          code: `theorem add_zero_right (n : Nat) : n + 0 = n := by
  induction n with
  | zero =>
      rfl
  | succ n ih =>
      simp [Nat.succ_add, ih]`,
          steps: [
            { label: "Start universally", explanation: "The input `n` is arbitrary; the target is its property.", proofState: "n : Nat ⊢ n + 0 = n" },
            { label: "Split by constructors", explanation: "`induction n` creates zero and successor branches.", proofState: "zero: ⊢ 0 + 0 = 0\nsucc: ih : n + 0 = n ⊢ (n+1)+0 = n+1" },
            { label: "Solve the base", explanation: "Closed reduction makes both sides zero.", proofState: "zero branch: no goals" },
            { label: "Expose the smaller expression", explanation: "In the successor branch, simplification reduces the outer successor addition.", proofState: "ih : n + 0 = n ⊢ Nat.succ (n + 0) = Nat.succ n" },
            { label: "Use `ih`", explanation: "Rewriting the inner `n + 0` with `ih` makes both sides identical.", proofState: "no goals" },
          ],
          conclusion: "The step succeeds because the recursive computation exposes exactly the smaller equality promised by the induction hypothesis.",
        },
        commonMistakes: [
          { mistake: "Calling the induction hypothesis the final theorem.", why: "`ih` covers only the smaller `n` in the current successor branch.", repair: "Read its displayed type and identify where that exact expression appears in the goal." },
          { mistake: "Using induction when simple reduction or a known theorem suffices.", why: "The proof becomes longer and can hide the direct reason.", repair: "Try computation and a relevant library lemma before introducing induction." },
          { mistake: "Ignoring constructor shape in the branches.", why: "The branch goals are generated from `zero` and `succ`, not generic cases named 'easy' and 'hard'.", repair: "Say aloud which constructor each branch handles and what recursive data it contains." },
        ],
        selfCheck: [
          { prompt: "What is the type of the induction hypothesis for a property `P` in the `succ n` branch?", answer: "`ih : P n`." },
          { prompt: "Why does the zero branch receive no induction hypothesis?", answer: "`Nat.zero` has no recursive `Nat` field, so there is no smaller constructed number attached to it." },
          { prompt: "What should appear in the reduced step goal for `ih` to be useful?", answer: "An occurrence of the exact smaller proposition or equality that `ih` proves." },
        ],
      },
      {
        title: "List induction follows list computation",
        question: "How do you choose which list to induct on in a theorem involving two lists?",
        whyItMatters: "Choosing the computation-driving argument often turns a stuck proof into two routine constructor cases.",
        explanation: [
          "List induction reflects the two constructors. The `nil` branch proves the property for `[]`. The `cons` branch considers `x :: xs`, receives `ih` for the tail `xs`, and asks for the property of the larger list.",
          "When a theorem mentions a recursive function, inspect that function's definition. List append `xs ++ ys` examines its first argument: appending to `[]` returns `ys`, while appending from `x :: xs` preserves `x` and recursively appends `xs`. Therefore induction on `xs` exposes append's computation rules.",
          "Inducting on `ys` is logically allowed, but may be strategically unhelpful because append cannot reduce while its first argument remains an unknown `xs`. The resulting branch goals may require additional lemmas that were unnecessary with the structurally aligned choice.",
          "After choosing the argument, let simplification expose the recursive call. In the cons branch of a length-and-append theorem, `(x :: xs ++ ys).length` reduces to one plus `(xs ++ ys).length`. That smaller expression is exactly where the induction hypothesis applies.",
        ],
        analogy: {
          title: "Opening the box a machine reads first",
          body: "If a machine's instructions say to inspect the left box first, open that box when explaining its behavior. Its empty and nonempty forms reveal the next machine step.",
          limit: "Lean functions are not physically forced to inspect arguments left-to-right. You must read the actual recursive definition; another function may recurse on a different argument.",
        },
        workedExample: {
          title: "Length distributes over append",
          setup: "The theorem and proof use only Lean 4 Core list operations.",
          code: `theorem length_append_core {α : Type} (xs ys : List α) :
    (xs ++ ys).length = xs.length + ys.length := by
  induction xs with
  | nil =>
      rfl
  | cons x xs ih =>
      simp [ih]`,
          steps: [
            { label: "Find recursion direction", explanation: "`List.append` pattern matches on its first input, `xs`.", proofState: "⊢ (xs ++ ys).length = xs.length + ys.length" },
            { label: "Induct on `xs`", explanation: "We receive empty and cons branches matching append's equations.", proofState: "nil branch; cons x xs ih branch" },
            { label: "Compute empty", explanation: "`[] ++ ys` reduces to `ys`, and both lengths are the same after reduction.", proofState: "⊢ ys.length = 0 + ys.length" },
            { label: "Compute cons", explanation: "Append and length expose the recursive tail expression.", proofState: "ih : (xs ++ ys).length = xs.length + ys.length\n⊢ 1 + (xs ++ ys).length = 1 + (xs.length + ys.length)" },
            { label: "Rewrite smaller fact", explanation: "`simp [ih]` uses `ih` and routine natural-number simplification.", proofState: "no goals" },
          ],
          conclusion: "The proof works smoothly because its induction follows the same input and constructor cases as append's recursion.",
        },
        commonMistakes: [
          { mistake: "Always inducting on the visually longest or most important list.", why: "Length and business meaning do not determine which definition can compute.", repair: "Inspect which argument the relevant recursive function pattern matches on." },
          { mistake: "Expecting the induction hypothesis to mention the head `x`.", why: "The hypothesis concerns the recursive field `xs`; `x` is new data added by the cons constructor.", repair: "Reduce the goal so the tail theorem sits under the same outer operation on both sides." },
          { mistake: "Using broad arithmetic automation before reducing list structure.", why: "The blocker is symbolic list computation, not arithmetic.", repair: "Induct and simplify constructor equations first." },
        ],
        selfCheck: [
          { prompt: "For a theorem mainly about `xs ++ ys`, which argument is the default induction candidate?", answer: "`xs`, because Core's append recursively examines its first list." },
          { prompt: "What fact does `ih` provide in the worked example?", answer: "`(xs ++ ys).length = xs.length + ys.length` for the tail `xs`." },
          { prompt: "Why is `rfl` plausible in the nil branch?", answer: "Append and length both reduce directly on their base constructors." },
        ],
      },
      {
        title: "Strengthening a claim when induction gets stuck",
        question: "Why can a true theorem produce an induction hypothesis that is too specific, and how does generalization repair it?",
        whyItMatters: "Many intermediate induction proofs fail because of statement shape, not because the theorem or overall idea is wrong.",
        explanation: [
          "The moment you introduce or fix variables determines what the induction hypothesis may quantify over. If a second input is fixed before induction, Lean may give an `ih` that works only for that one input. The step case might need the property for a changed input, making the hypothesis unusable.",
          "A stronger theorem can be easier to prove because it grants a more flexible induction hypothesis. Instead of proving a claim for one fixed accumulator, prove it for every accumulator. The step branch can then instantiate the hypothesis with the adjusted accumulator produced by recursion.",
          "This technique is called generalization or strengthening. It does not mean claiming something recklessly broad. It means preserving enough universal information across the induction so the recursive step has the tool it naturally needs.",
          "In tactic proofs, `generalizing` can keep selected variables general during induction. Another clear approach is to state the theorem with `∀` in the right order or introduce only the structural variable before inducting. When stuck, compare the exact `ih` type with the fact you wish to use; their mismatch tells you what must remain general.",
        ],
        analogy: {
          title: "A reusable travel pass",
          body: "A pass valid only from one fixed station may be useless after your route moves you elsewhere. A pass valid from every station can be instantiated at the station reached in the next step.",
          limit: "Logical strengthening requires proving the broader statement; Lean does not upgrade a narrow hypothesis merely because broader access would be convenient.",
        },
        workedExample: {
          title: "Generalize the accumulator in tail-recursive addition",
          setup: "A small recursive function makes the need for a flexible second argument visible.",
          code: `def addTo : Nat → Nat → Nat
  | 0, acc => acc
  | n + 1, acc => addTo n (acc + 1)

theorem addTo_eq (n : Nat) : ∀ acc, addTo n acc = acc + n := by
  induction n with
  | zero =>
      intro acc
      rfl
  | succ n ih =>
      intro acc
      simp [addTo, ih, Nat.add_assoc]`,
          steps: [
            { label: "Keep `acc` general", explanation: "The target is `∀ acc`, so induction happens before choosing a particular accumulator.", proofState: "n : Nat ⊢ ∀ acc, addTo n acc = acc + n" },
            { label: "Base introduction", explanation: "For zero, introduce any `acc`; `addTo 0 acc` reduces to `acc`.", proofState: "acc : Nat ⊢ acc = acc + 0" },
            { label: "Receive a flexible hypothesis", explanation: "`ih` proves the claim for every accumulator, not one fixed value.", proofState: "ih : ∀ acc, addTo n acc = acc + n" },
            { label: "Expose changed accumulator", explanation: "The successor equation calls `addTo n (acc + 1)`.", proofState: "⊢ addTo n (acc + 1) = acc + (n + 1)" },
            { label: "Instantiate and normalize", explanation: "`ih (acc + 1)` applies, and associativity aligns the arithmetic.", proofState: "no goals" },
          ],
          conclusion: "The universally quantified accumulator makes the induction hypothesis usable at the changed value created by the recursive call.",
        },
        commonMistakes: [
          { mistake: "Assuming a stuck `ih` means induction was the wrong method.", why: "The method may be right while the hypothesis was specialized too early.", repair: "Compare the needed fact to `ih` and generalize the variables that change in recursion." },
          { mistake: "Strengthening the theorem without checking truth.", why: "A broader statement can be false even when the original special case is true.", repair: "Test examples and explain why the recursive definition supports the stronger invariant." },
          { mistake: "Adding unrelated lemmas to force the narrow hypothesis to match.", why: "No rewrite can make a fact about one fixed accumulator prove a fact about a different arbitrary accumulator.", repair: "Change quantifier order or use `generalizing` so the induction hypothesis ranges over the needed values." },
        ],
        selfCheck: [
          { prompt: "What symptom suggests a variable was specialized too early?", answer: "The step goal needs the theorem at a changed value, while `ih` mentions only the original fixed value." },
          { prompt: "Why can a stronger claim be easier?", answer: "It produces a more general induction hypothesis that can be instantiated where recursion needs it." },
          { prompt: "Which variables are candidates for generalization?", answer: "Variables that are not the induction subject but change in recursive calls or must vary in the step case." },
        ],
      },
    ],
    closingQuestions: [
      "What constructors generate the branches of your induction?",
      "Which recursive definition suggests the best induction variable?",
      "Does your induction hypothesis quantify over every value that changes in the recursive call?",
    ],
  },
  {
    day: 9,
    opening: [
      "Real models contain several related pieces: a name with an identifier, a balance with a currency, or a value with evidence that it satisfies a rule. Lean structures package those pieces under field names. Unlike a loose bundle, a structure becomes a type in its own right, so construction, field access, and updates are checked consistently everywhere.",
      "Type classes build on the same structure mechanism but add automatic instance search. A function can declare that it needs some behavior—equality testing, printable representation, ordering—without receiving the implementation manually at every call. This is powerful plumbing, but it should remain visible at the interface: inference fills an explicit requirement; it does not guess what your program means.",
    ],
    prerequisites: [
      "Know how ordinary inductive constructors create values.",
      "Read named function arguments and dot notation.",
      "Understand that propositions and their proofs can appear as types and values.",
    ],
    topics: [
      {
        title: "Structures, fields, and projections",
        question: "What does a structure add beyond passing several values separately?",
        whyItMatters: "Structures make domain models readable and keep related data under one checked type.",
        explanation: [
          "A structure is a record type with named fields. Declaring `structure User where` creates the type `User` and a constructor requiring values for every field. Named construction with `where` documents which supplied value belongs to which field, even when several fields share the same type.",
          "A projection retrieves a field. If `u : User`, then `u.name` has the type declared for `name`. Lean elaborates dot notation using generated projection functions, so `u.name` is convenient typed access rather than a dynamic property lookup.",
          "A function that accepts a `User` promises that its inputs arrive together in the modeled shape. This is different from accepting three unrelated arguments that callers might accidentally reorder. The structure also gives the concept a name that can appear in later signatures and theorem statements.",
          "Structure update syntax can create a new value while preserving unchanged fields, but values are immutable: updating does not alter the old value. That functional style makes proofs easier because a value's fields do not silently change after a fact about them has been established.",
        ],
        analogy: {
          title: "A labeled form",
          body: "A structure resembles a form with labeled boxes. Construction fills every required box, and projection reads one box by its label.",
          limit: "Paper forms may contain illegible, missing, or later-edited entries. Lean checks field types at construction, and values do not mutate behind existing proofs.",
        },
        workedExample: {
          title: "Model and read a course enrollment",
          setup: "The example uses only Lean 4 Core.",
          code: `structure Enrollment where
  studentName : String
  completedLessons : Nat
  active : Bool

def learner : Enrollment where
  studentName := "Sam"
  completedLessons := 4
  active := true

example : learner.completedLessons = 4 := by
  rfl`,
          steps: [
            { label: "Declare fields", explanation: "Each field has a name and a type.", proofState: "Enrollment.studentName : Enrollment → String" },
            { label: "Construct a value", explanation: "Named assignments supply all three required fields.", proofState: "learner : Enrollment" },
            { label: "Project one field", explanation: "`learner.completedLessons` reduces through the constructor to the stored numeral.", proofState: "⊢ learner.completedLessons = 4" },
            { label: "Reduce", explanation: "Unfolding `learner` and the projection leaves `4 = 4`.", proofState: "⊢ 4 = 4" },
            { label: "Close", explanation: "`rfl` proves the reflexive result.", proofState: "no goals" },
          ],
          conclusion: "Field names make both construction and later claims about the data precise.",
        },
        commonMistakes: [
          { mistake: "Treating field access as an unchecked dictionary lookup.", why: "Every projection has a fixed input and output type generated from the structure.", repair: "Use the projected type shown by `#check Enrollment.completedLessons` to understand access." },
          { mistake: "Expecting a new value to mutate an existing structure.", why: "Lean values are immutable.", repair: "Return a new structure value and state relationships between old and new values explicitly." },
          { mistake: "Using a tuple when fields have important domain meanings.", why: "Positions such as `.1` and `.2` hide intent and are easy to confuse.", repair: "Define a small structure with descriptive field names." },
        ],
        selfCheck: [
          { prompt: "What is the type of `Enrollment.active`?", answer: "`Enrollment → Bool`: given an enrollment, it projects the Boolean field." },
          { prompt: "Must named fields be supplied in their declaration order?", answer: "Named `where` construction identifies fields by name; following declaration order is still clearer, but names prevent positional confusion." },
          { prompt: "Why is a structure better than three arguments for a recurring domain entity?", answer: "It names and bundles the relationship once, preventing ordering mistakes and giving later APIs a meaningful input type." },
        ],
      },
      {
        title: "Proof fields encode invariants",
        question: "How can a structure make an invalid state impossible to construct?",
        whyItMatters: "Bundling evidence with data moves important checks to trusted boundaries and preserves guarantees downstream.",
        explanation: [
          "A structure field may depend on an earlier field. If `amount : Nat` is followed by `isPositive : amount > 0`, construction requires both a number and proof about that exact number. The second field is called an invariant: a property every value of the structure must satisfy.",
          "Once a `PositiveBalance` value exists, any function receiving it may project both `amount` and `isPositive`. It does not need to recheck positivity. The guarantee travels with the data and cannot become detached or accidentally applied to a different amount.",
          "This design changes where work happens. Creation and transformation become more demanding because they must produce proofs, while consumers become safer and simpler. A smart constructor can hide the raw structure constructor and return an optional certified value after checking input.",
          "Not every business rule belongs in a type. Rules that change frequently, depend on external state, or add heavy proof obligations may be better expressed as explicit predicates at a boundary. Use proof fields when the invariant is stable, valuable, and maintained by the operations you control.",
        ],
        analogy: {
          title: "A product with its inspection certificate",
          body: "The data is the product and the proof field is a certificate tied to that exact serial number. Downstream users can rely on the certified property.",
          limit: "A paper certificate can be forged or separated from the item. In Lean, the proof is type-linked to the field value and checked by the kernel.",
        },
        workedExample: {
          title: "Carry a positive balance certificate",
          setup: "The concrete proof uses Core's `decide` for a computable proposition.",
          code: `structure PositiveBalance where
  amount : Nat
  isPositive : amount > 0

def openingBalance : PositiveBalance where
  amount := 100
  isPositive := by decide

example : openingBalance.amount > 0 :=
  openingBalance.isPositive`,
          steps: [
            { label: "Set the data field", explanation: "Construction first fixes `amount` to `100`.", proofState: "amount := 100" },
            { label: "Generate the obligation", explanation: "The dependent proof field now specifically requires `100 > 0`.", proofState: "⊢ 100 > 0" },
            { label: "Compute evidence", explanation: "`decide` proves this concrete decidable inequality.", proofState: "isPositive filled" },
            { label: "Project the amount", explanation: "The later theorem's target reduces to the property stored with `openingBalance`.", proofState: "⊢ openingBalance.amount > 0" },
            { label: "Project the certificate", explanation: "`openingBalance.isPositive` has exactly the required dependent type.", proofState: "no goals" },
          ],
          conclusion: "Consumers use the stored certificate directly; positivity is established once at construction.",
        },
        commonMistakes: [
          { mistake: "Using `Bool` when later proofs need logical evidence.", why: "`true` is data; by itself it is not a proof of the proposition relating fields.", repair: "Store a `Prop` proof field or prove a theorem connecting the Boolean test to the proposition." },
          { mistake: "Assuming subtraction preserves positivity.", why: "With naturals, withdrawing the full amount produces zero.", repair: "Require and use a strict bound, or return a plain account when positivity is no longer guaranteed." },
          { mistake: "Encoding every temporary policy as a proof field.", why: "Each change and constructor inherits the proof burden.", repair: "Reserve type-level invariants for stable guarantees with clear downstream value." },
        ],
        selfCheck: [
          { prompt: "What must be supplied after choosing `amount := 0`?", answer: "A proof of `0 > 0`, which cannot be constructed in consistent Lean, so the structure value cannot be completed." },
          { prompt: "Why can a consumer trust `p.isPositive`?", answer: "Its type depends on `p.amount`, and the kernel checked it when the structure was constructed." },
          { prompt: "What is the tradeoff of proof fields?", answer: "More work at construction and transformation in exchange for stronger, reusable guarantees for every consumer." },
        ],
      },
      {
        title: "Type classes are inferred interfaces",
        question: "What do square-bracket parameters and instances actually ask Lean to do?",
        whyItMatters: "Type classes power common notation and reusable APIs while keeping behavioral requirements type checked.",
        explanation: [
          "A type class is a structure marked for automatic instance search. Its fields describe behavior available for a type. For example, a tiny `Named α` class can require a function that converts an `α` to a display name. An instance supplies that behavior for a particular type.",
          "A parameter written `[Named α]` is still a real function argument, but Lean is asked to synthesize it rather than requiring the caller to pass it explicitly. Search examines registered instances whose result type matches `Named α`, possibly solving further class requirements along the way.",
          "This is dependency injection guided by types. A generic function states the capability it needs, and each type supplies an implementation. The function does not inspect type names or perform runtime reflection. If no instance is available, elaboration fails with a useful unsolved-synthesis message.",
          "Instances should be coherent and unsurprising. Several equally plausible global instances can make inference ambiguous or make notation mean different things across scopes. Use classes for shared behavior that users expect to be inferred; use ordinary explicit arguments when selecting among policies is meaningful.",
        ],
        analogy: {
          title: "A standard wall socket",
          body: "A function declares the socket shape it needs; an instance is the adapter supplied for a particular device type. Lean connects a matching adapter automatically.",
          limit: "Electrical adapters are chosen by physical fit and may be unsafe. Lean searches by precise types and checks the resulting term, but it still cannot decide which of several semantically different policies you intended.",
        },
        workedExample: {
          title: "Define and infer a tiny naming interface",
          setup: "This self-contained example uses Lean 4 Core class and instance syntax.",
          code: `class Named (α : Type) where
  name : α → String

def label {α : Type} [Named α] (value : α) : String :=
  Named.name value

instance : Named Bool where
  name
    | true => "yes"
    | false => "no"

example : label true = "yes" := by
  rfl`,
          steps: [
            { label: "Declare capability", explanation: "`Named α` promises a `name` function for values of `α`.", proofState: "Named.name : [Named α] → α → String" },
            { label: "Require it generically", explanation: "`label` works for any `α` provided instance search finds `[Named α]`.", proofState: "α : Type, inst : Named α, value : α ⊢ String" },
            { label: "Register behavior", explanation: "The instance defines names for both Boolean constructors.", proofState: "instance : Named Bool" },
            { label: "Infer at the call", explanation: "From `true : Bool`, Lean searches for and finds `Named Bool`.", proofState: "label true reduces using Bool instance" },
            { label: "Compute", explanation: "Pattern matching selects the `true` branch, yielding `\"yes\"`.", proofState: "⊢ \"yes\" = \"yes\"" },
          ],
          conclusion: "The caller supplied only the value; the type exposed the required instance and Lean filled it from registered evidence.",
        },
        commonMistakes: [
          { mistake: "Thinking square brackets make a requirement optional.", why: "The argument is implicit, but Lean must still find a value of the required class.", repair: "Read `[C α]` as 'require an inferred implementation of `C` for `α`'." },
          { mistake: "Creating multiple global policy instances for the same type.", why: "Inference lacks the business context to choose your intended policy.", repair: "Pass policies explicitly or use distinct wrapper types/scoped instances." },
          { mistake: "Blaming notation when instance synthesis fails.", why: "Operators often depend on missing class evidence.", repair: "Inspect the expected class and use `#synth` or `#check` to test whether an instance is available." },
        ],
        selfCheck: [
          { prompt: "Is `[Named α]` present at runtime or merely a comment?", answer: "It is a real argument, usually inserted by elaboration and often reducible during computation." },
          { prompt: "What determines that the Boolean instance is used for `label true`?", answer: "`true` fixes `α` as `Bool`, so instance search seeks `Named Bool`." },
          { prompt: "When is an explicit argument preferable to a class?", answer: "When callers should consciously select among multiple meaningful behaviors or policies." },
        ],
      },
    ],
    closingQuestions: [
      "Which related values deserve a named structure in your model?",
      "Which invariants are stable and valuable enough to carry as proof fields?",
      "Is a behavior naturally inferred from a type, or should the caller choose it explicitly?",
    ],
  },
  {
    day: 10,
    opening: [
      "Automation in Lean is not a way to bypass proof. A tactic searches, computes, or rewrites to construct a proof term, and Lean's small kernel checks that term against the theorem. This architecture lets us use convenient tools without trusting every tactic as a new logical axiom. The practical challenge is choosing an automation tool whose domain matches the shape of the goal.",
      "Responsible automation also means maintainable proofs. A one-line tactic can be excellent when it communicates a standard decision procedure or routine normalization. It can be harmful when it hides the central lemma, depends accidentally on a huge import, or leaves the author unable to explain the result. Today we learn `simp`, `decide`, theorem discovery, and a Mathlib arithmetic solver as different instruments rather than interchangeable magic buttons.",
    ],
    prerequisites: [
      "Distinguish computation, rewriting, and theorem application.",
      "Read the current goal and local hypotheses after each tactic.",
      "Understand that all accepted proof terms are checked by Lean's kernel.",
    ],
    topics: [
      {
        title: "The simplifier is a controlled normalization engine",
        question: "What does `simp` know, and how can you keep its work predictable?",
        whyItMatters: "Simplification appears in nearly every Lean project, but opaque use makes proofs fragile and learning shallow.",
        explanation: [
          "`simp` repeatedly rewrites using lemmas marked for simplification, local hypotheses when supplied, and computational equations for selected definitions. Rules are normally oriented from a more complicated expression toward a simpler one, helping the process terminate instead of oscillating.",
          "The simplifier is sensitive to context. Imports can register additional rules, and local declarations can add facts. `simp [definition, h]` explicitly includes the named definition's equations and hypothesis `h`; `simp only [...]` restricts the run to the provided rules plus minimal reflexive machinery.",
          "Use `simp` when the remaining reasoning is routine normalization: constructor projections, empty lists, neutral elements, known equalities, and reducible definitions. First expose the mathematical structure with induction, cases, or a key rewrite if necessary. Then simplification can clean the predictable residue.",
          "A responsible proof can answer three questions: what definition was unfolded, what important fact was used, and why the result is a normal form. If those answers matter to the argument, name them in the bracket list or use a `calc` step. Proof brevity is not the same as conceptual clarity.",
        ],
        analogy: {
          title: "A rule-based editor",
          body: "`simp` is like an editor applying an approved style guide repeatedly until no listed cleanup rule matches.",
          limit: "A human editor understands meaning and emphasis. The simplifier has no semantic taste; its behavior is determined by typed rewrite rules and their orientation.",
        },
        workedExample: {
          title: "Simplify with an explicit local fact",
          setup: "This Lean 4 Core example shows the key rewrite in the bracket list.",
          code: `def feeTotal (base fee : Nat) : Nat := base + fee

example (base fee : Nat) (h : fee = 0) :
    feeTotal base fee = base := by
  simp [feeTotal, h]`,
          steps: [
            { label: "Read the target", explanation: "The wrapper definition and symbolic `fee` prevent immediate reflexivity.", proofState: "h : fee = 0 ⊢ feeTotal base fee = base" },
            { label: "Unfold explicitly", explanation: "Including `feeTotal` exposes `base + fee`.", proofState: "h : fee = 0 ⊢ base + fee = base" },
            { label: "Use local equality", explanation: "Including `h` rewrites `fee` to `0`.", proofState: "⊢ base + 0 = base" },
            { label: "Normalize arithmetic", explanation: "The simplifier uses the standard right-zero theorem.", proofState: "⊢ base = base" },
            { label: "Close", explanation: "Reflexivity finishes the normalized goal.", proofState: "no goals" },
          ],
          conclusion: "The one-line proof remains explainable because its nondefault dependencies—`feeTotal` and `h`—are visible.",
        },
        commonMistakes: [
          { mistake: "Running `simp` repeatedly without reading the goal.", why: "Repetition does not supply a missing conceptual lemma and hides where progress stopped.", repair: "Inspect the residue and identify whether it needs cases, induction, a rewrite direction, or a theorem." },
          { mistake: "Using `simp at *` as the first move.", why: "It changes every hypothesis and the target, making the proof state harder to compare.", repair: "Simplify the target or one named hypothesis unless broad normalization is intentionally required." },
          { mistake: "Assuming the simplifier's rule set is identical in every file.", why: "Imports and local attributes affect registered lemmas.", repair: "Use explicit lists or `simp only` when stability and dependency visibility matter." },
        ],
        selfCheck: [
          { prompt: "Why did `simp [feeTotal, h]` need `feeTotal` in brackets?", answer: "It explicitly unfolds the wrapper so its arithmetic body becomes visible." },
          { prompt: "When would `simp only [...]` be preferable?", answer: "When you want a narrow, reproducible list of rewrite dependencies and no ambient simplifier rules." },
          { prompt: "What should you do if `simp` leaves a meaningful nontrivial goal?", answer: "Read it, identify the missing reasoning step, perform that step explicitly, and simplify afterward if useful." },
        ],
      },
      {
        title: "Decidable propositions and specialized solvers",
        question: "Why can `decide` prove some concrete propositions, while arithmetic with variables may need a different tool?",
        whyItMatters: "Matching a goal to the right decision procedure saves time and makes the proof's reason apparent.",
        explanation: [
          "A proposition is decidable when Lean has an effective procedure that returns either evidence of the proposition or evidence of its negation. Equality and order on concrete natural numbers are decidable. `by decide` asks Lean to compute that procedure and extract a proof when the result is positive.",
          "Concrete is important for easy computation. The goal `(21 : Nat) < 34` reduces to a definite answer. A universally quantified symbolic arithmetic claim may be decidable in principle but not close merely by evaluating unknown variables. It needs reasoning that covers all values.",
          "Specialized solvers implement such reasoning for particular fragments. Mathlib's `omega` handles Presburger arithmetic over natural numbers and integers: addition, order, equality, constants, and multiplication by constants. It does not solve arbitrary nonlinear multiplication such as `x * y` in general.",
          "Mark environmental boundaries honestly. `decide` and basic `simp` are available in Lean 4 Core examples here. `omega` requires Mathlib, commonly through `import Mathlib`. Using it is responsible when the theorem genuinely belongs to its documented fragment and the solver communicates that fact better than a long low-level derivation.",
        ],
        analogy: {
          title: "Different calculators for different jobs",
          body: "`decide` is like evaluating a fully entered comparison, while `omega` is like a symbolic calculator specialized for linear integer constraints.",
          limit: "These tools return checked proof terms, not merely numeric answers, and each has a precise logical domain rather than the broad intuition of a human mathematician.",
        },
        workedExample: {
          title: "Solve a linear bound with Mathlib's `omega`",
          setup: "Mathlib required: place `import Mathlib` at the top of the file. The example is intentionally linear.",
          code: `import Mathlib

example (items shipped : Nat)
    (hTotal : items + shipped = 20)
    (hItems : 7 ≤ items) :
    shipped ≤ 13 := by
  omega`,
          steps: [
            { label: "Classify the expressions", explanation: "The context uses natural numbers, addition, equality, and order.", proofState: "items shipped : Nat\nhTotal : items + shipped = 20\nhItems : 7 ≤ items\n⊢ shipped ≤ 13" },
            { label: "Check the fragment", explanation: "There is no product of unknowns or exponentiation; this is linear arithmetic.", proofState: "Presburger arithmetic goal" },
            { label: "Invoke the solver", explanation: "`omega` combines the total of 20 with the minimum of 7.", proofState: "solver derives shipped ≤ 20 - 7" },
            { label: "Construct evidence", explanation: "The tactic emits a proof term for the inequality rather than adding an axiom.", proofState: "candidate proof term" },
            { label: "Kernel check", explanation: "Lean verifies that term against `shipped ≤ 13`.", proofState: "no goals" },
          ],
          conclusion: "`omega` is appropriate because the theorem is a linear arithmetic consequence; its Mathlib dependency is explicit.",
        },
        commonMistakes: [
          { mistake: "Using `decide` on a symbolic theorem and expecting broad search.", why: "`decide` computes a decision instance; unknown variables prevent the concrete reduction you had in mind.", repair: "Introduce variables and use lemmas, induction, or a solver matching the symbolic fragment." },
          { mistake: "Expecting `omega` to solve nonlinear arithmetic.", why: "Products of variables fall outside Presburger arithmetic.", repair: "Use nonlinear lemmas or an appropriate Mathlib tactic after confirming its documented scope." },
          { mistake: "Forgetting to mention the Mathlib import.", why: "A learner using Core alone will see an unknown tactic or import error.", repair: "Label examples and dependencies exactly where the non-Core feature appears." },
        ],
        selfCheck: [
          { prompt: "Why is `(8 : Nat) ≤ 13` a good `decide` goal?", answer: "It is a closed decidable proposition whose comparison can compute." },
          { prompt: "Is `x * y = y * x` a natural `omega` goal?", answer: "No. It contains nonlinear multiplication of variables; use the commutativity theorem instead." },
          { prompt: "What protects trust when a complex tactic is used?", answer: "The tactic must produce a proof term that Lean's kernel independently checks." },
        ],
      },
      {
        title: "Theorem discovery and automation audits",
        question: "How do you find a useful theorem without guessing names, and how do you decide whether an automated proof is maintainable?",
        whyItMatters: "Most real Lean work is library navigation and proof maintenance, not proving every basic fact from first principles.",
        explanation: [
          "Begin with the gap as a type. If you need to turn `a = b` into `b = a`, write that input-output shape down. Names vary, but theorem types express exact capabilities. Namespace exploration and `#check` then confirm candidates without changing the proof.",
          "Lean 4 Core supports commands such as `#check Nat.add_comm` and `#check Eq.symm`. Editor completion and documentation help search nearby names. Mathlib adds tools such as `exact?`, `apply?`, and `library_search` that can suggest declarations. Treat suggestions as leads: inspect the resulting theorem type and understand how its arguments match.",
          "After automation succeeds, audit the proof. Identify its conceptual dependencies, check whether it used the intended hypotheses, and consider whether a narrower tactic invocation would communicate more. Compilation proves validity, but maintainability also concerns human expectations and stability under changes in imports or simplification rules.",
          "A good refactoring ladder is manual first, focused automation second. Once you understand the proof, replace repetitive steps with a tactic whose name describes the reasoning domain. Keep an explicit intermediate lemma when it carries the central idea. The goal is compressed ceremony, not compressed understanding.",
        ],
        analogy: {
          title: "Searching a tool catalog by specification",
          body: "Instead of guessing that a tool is named 'reverse equality,' you search for one accepting an equality in one direction and returning it in the other, then inspect its specification.",
          limit: "Library search is type-directed but not a complete mind reader. Equivalent theorem statements may require unfolding, argument reordering, or a bridge lemma before their shapes align.",
        },
        workedExample: {
          title: "Discover and apply equality symmetry",
          setup: "This uses Lean 4 Core. The `#check` lines are exploration commands, not proof steps.",
          code: `#check Eq.symm
#check Eq.trans

example {α : Type} (a b c : α)
    (hab : a = b) (hbc : b = c) :
    c = a := by
  exact Eq.symm (Eq.trans hab hbc)`,
          steps: [
            { label: "Describe the gap", explanation: "Combining assumptions should first produce `a = c`, then symmetry should produce `c = a`.", proofState: "hab : a = b\nhbc : b = c\n⊢ c = a" },
            { label: "Inspect candidates", explanation: "`#check Eq.trans` reveals equality chaining; `#check Eq.symm` reveals reversal.", proofState: "Eq.trans : a = b → b = c → a = c\nEq.symm : a = c → c = a" },
            { label: "Build the inner fact", explanation: "`Eq.trans hab hbc` has type `a = c`.", proofState: "inner : a = c" },
            { label: "Reverse it", explanation: "`Eq.symm` consumes that inner proof and returns `c = a`.", proofState: "term : c = a" },
            { label: "Exact match", explanation: "`exact` closes the goal because the constructed term has precisely the target type.", proofState: "no goals" },
          ],
          conclusion: "Searching and composing by theorem type turns library use into predictable input-output reasoning.",
        },
        commonMistakes: [
          { mistake: "Copying a suggestion without inspecting its theorem.", why: "The proof may rely on an unintended lemma or fail after small contextual changes.", repair: "Use `#check` and explain how each argument and result type fits the goal." },
          { mistake: "Searching only with guessed English theorem names.", why: "Library naming conventions and namespaces may differ from your phrasing.", repair: "Search by type shape, namespace, editor completion, and focused suggestion tools." },
          { mistake: "Keeping a long manual proof solely because it was educational.", why: "Repeated low-level ceremony can obscure the stable mathematical idea.", repair: "After understanding it, refactor routine parts with focused automation while retaining the key lemma or intermediate statement." },
        ],
        selfCheck: [
          { prompt: "What should you write down before searching for a theorem?", answer: "The type of the missing fact: required inputs, assumptions, and desired output." },
          { prompt: "What is the difference between `#check` and applying a theorem?", answer: "`#check` reports a term's type for inspection; it does not alter or solve the current proof." },
          { prompt: "What makes an automated proof responsible?", answer: "It matches a known problem domain, has understandable conceptual dependencies, is kernel checked, and remains readable and stable enough for its context." },
        ],
      },
    ],
    closingQuestions: [
      "Can you name the exact problem fragment before choosing an automated tactic?",
      "Which imports and lemmas does your short proof conceptually depend on?",
      "Could you reconstruct the proof manually enough to explain why the automation is appropriate?",
    ],
  },
];
