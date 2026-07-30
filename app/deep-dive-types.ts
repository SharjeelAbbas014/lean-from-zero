export type DeepDiveAnalogy = {
  title: string;
  body: string;
  limit: string;
};

export type WorkedStep = {
  label: string;
  explanation: string;
  proofState?: string;
};

export type DeepDiveTopic = {
  title: string;
  question: string;
  whyItMatters: string;
  explanation: string[];
  analogy: DeepDiveAnalogy;
  workedExample: {
    title: string;
    setup: string;
    code: string;
    steps: WorkedStep[];
    conclusion: string;
  };
  commonMistakes: {
    mistake: string;
    why: string;
    repair: string;
  }[];
  selfCheck: {
    prompt: string;
    answer: string;
  }[];
};

export type DeepDiveChapter = {
  day: number;
  opening: string[];
  prerequisites: string[];
  topics: DeepDiveTopic[];
  closingQuestions: string[];
};
