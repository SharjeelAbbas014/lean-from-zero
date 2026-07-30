import { deepDivesPart1 } from "./deep-dives-1";
import { deepDivesPart2 } from "./deep-dives-2";
import { deepDivesPart3 } from "./deep-dives-3";

export const deepDives = [
  ...deepDivesPart1,
  ...deepDivesPart2,
  ...deepDivesPart3,
];

export const deepDiveByDay = new Map(
  deepDives.map((chapter) => [chapter.day, chapter]),
);
