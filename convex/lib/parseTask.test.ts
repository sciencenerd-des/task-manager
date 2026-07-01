import { describe, it, expect } from "vitest";
import { parseTaskText } from "./parseTask";

// Fixed reference date: Wednesday, 2026-06-10 (local).
const NOW = new Date(2026, 5, 10);
// Format using LOCAL date parts (the parser works in local time; toISOString
// would shift the day in +offset timezones).
const ymd = (ms?: number) => {
  if (ms === undefined) return undefined;
  const d = new Date(ms);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
};

describe("parseTaskText", () => {
  it("keeps a plain task as the title at medium priority", () => {
    const r = parseTaskText("Write the launch announcement", NOW);
    expect(r.title).toBe("Write the launch announcement");
    expect(r.priority).toBe("medium");
    expect(r.dueDate).toBeUndefined();
  });

  it("detects urgent priority and strips the keyword", () => {
    const r = parseTaskText("urgent: fix the login bug", NOW);
    expect(r.priority).toBe("urgent");
    expect(r.title.toLowerCase()).toContain("fix the login bug");
    expect(r.title.toLowerCase()).not.toContain("urgent");
  });

  it("detects high and low priority phrases", () => {
    expect(parseTaskText("ship docs, high priority", NOW).priority).toBe("high");
    expect(parseTaskText("clean up TODOs whenever", NOW).priority).toBe("low");
  });

  it("resolves 'tomorrow' to the next day", () => {
    const r = parseTaskText("Call the vendor tomorrow", NOW);
    expect(ymd(r.dueDate)).toBe("2026-06-11");
    expect(r.title).toBe("Call the vendor");
  });

  it("resolves 'in 3 days'", () => {
    expect(ymd(parseTaskText("Renew domain in 3 days", NOW).dueDate)).toBe("2026-06-13");
  });

  it("resolves a bare weekday to the next occurrence (not today)", () => {
    // NOW is Wednesday; next Friday is 2026-06-12
    expect(ymd(parseTaskText("Send invoice by friday", NOW).dueDate)).toBe("2026-06-12");
  });

  it("resolves 'next monday' to the following week", () => {
    // NOW is Wed 06-10; this coming Monday is 06-15, "next monday" → 06-22
    expect(ymd(parseTaskText("Plan sprint next monday", NOW).dueDate)).toBe("2026-06-22");
  });

  it("combines priority and due date and produces a clean title", () => {
    const r = parseTaskText("urgent: submit the GST return by tomorrow", NOW);
    expect(r.priority).toBe("urgent");
    expect(ymd(r.dueDate)).toBe("2026-06-11");
    expect(r.title).toBe("Submit the GST return");
  });

  it("falls back to the raw text when stripping leaves nothing", () => {
    const r = parseTaskText("tomorrow", NOW);
    expect(r.title).toBe("Tomorrow");
  });

  it("handles empty input gracefully", () => {
    const r = parseTaskText("", NOW);
    expect(r.title).toBe("");
    expect(r.priority).toBe("medium");
    expect(r.dueDate).toBeUndefined();
  });

  it("handles whitespace-only input", () => {
    const r = parseTaskText("   ", NOW);
    expect(r.title.trim()).toBe("");
    expect(r.priority).toBe("medium");
  });

  it("preserves capitalization in title", () => {
    const r = parseTaskText("urgent: Review Q4 Budget", NOW);
    expect(r.title).toBe("Review Q4 Budget");
  });

  it("handles multiple weekday references", () => {
    const r = parseTaskText("Meet Monday, follow up Friday", NOW);
    // Should pick the first weekday mentioned
    expect(ymd(r.dueDate)).toBe("2026-06-15"); // Next Monday
  });
});
