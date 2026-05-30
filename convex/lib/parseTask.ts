// Pure, deterministic natural-language → task parser.
//
// Used as the zero-key fallback for the `tasks.parseText` action (and unit-tested
// in isolation). No Convex imports, no side effects — given the same text and
// `now`, it always returns the same result.

export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface ParsedTask {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: number; // epoch milliseconds (local midnight of the due day)
}

const PRIORITY_PATTERNS: ReadonlyArray<readonly [RegExp, TaskPriority]> = [
  [/\b(urgent|asap|critical|immediately|right away)\b/i, "urgent"],
  [/\b(high[\s-]?priority|important)\b/i, "high"],
  [/\b(low[\s-]?priority|whenever|someday|no rush)\b/i, "low"],
];

const WEEKDAYS: Record<string, number> = {
  sunday: 0, sun: 0,
  monday: 1, mon: 1,
  tuesday: 2, tue: 2, tues: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4, thurs: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
};

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, n: number): Date {
  const r = startOfDay(d);
  r.setDate(r.getDate() + n);
  return r;
}

interface DueMatch {
  date: Date;
  match: string; // the substring to strip from the title
}

function extractDueDate(text: string, now: Date): DueMatch | null {
  const checks: Array<[RegExp, (m: RegExpMatchArray) => Date]> = [
    [/\bday after tomorrow\b/i, () => addDays(now, 2)],
    [/\btomorrow\b/i, () => addDays(now, 1)],
    [/\b(today|tonight|this evening)\b/i, () => startOfDay(now)],
    [/\bnext week\b/i, () => addDays(now, 7)],
    [/\bin (\d+) (day|days)\b/i, (m) => addDays(now, parseInt(m[1], 10))],
    [/\bin (\d+) (week|weeks)\b/i, (m) => addDays(now, parseInt(m[1], 10) * 7)],
    [
      /\b(next\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday|sun|mon|tues|tue|wed|thurs|thu|fri|sat)\b/i,
      (m) => {
        const target = WEEKDAYS[m[2].toLowerCase()];
        const dow = now.getDay();
        let diff = (target - dow + 7) % 7;
        if (diff === 0) diff = 7; // a bare weekday means the next one, not today
        if (m[1]) diff += 7; // "next friday" → the following week
        return addDays(now, diff);
      },
    ],
  ];

  for (const [re, toDate] of checks) {
    const m = text.match(re);
    if (m) return { date: toDate(m), match: m[0] };
  }
  return null;
}

export function parseTaskText(text: string, now: Date = new Date()): ParsedTask {
  let working = ` ${text.trim()} `;
  let priority: TaskPriority = "medium";

  for (const [re, p] of PRIORITY_PATTERNS) {
    if (re.test(working)) {
      priority = p;
      working = working.replace(re, " ");
      break;
    }
  }

  let dueDate: number | undefined;
  const due = extractDueDate(working, now);
  if (due) {
    dueDate = due.date.getTime();
    working = working.replace(due.match, " ");
  }

  // Clean up dangling connector words ("by", "due", "on", "before") and punctuation.
  let title = working
    .replace(/\b(by|due|on|before|at)\b\s*(?=\s|$)/gi, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/^[\s,:;–-]+|[\s,:;–-]+$/g, "")
    .trim();

  if (!title) title = text.trim();
  title = title.charAt(0).toUpperCase() + title.slice(1);

  return { title, priority, dueDate };
}
