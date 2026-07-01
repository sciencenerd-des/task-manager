# AI Task Parser

This document explains the OpenAI-assisted task parsing flow.

## User flow

1. User opens the create-task dialog.
2. User enters natural language text.
3. Convex action `tasks.parseText` parses the text.
4. The form is pre-filled with suggested fields.
5. User reviews and submits.

## Files

- `convex/tasks.ts` — task actions and mutations.
- task creation UI — calls the parser and renders suggestions.

## Fallback behavior

If `OPENAI_API_KEY` is unavailable, the app uses deterministic parsing rules so local development still works.

## Developer notes

This is intentionally a small AI feature:

- narrow scope
- structured output
- review before write
- safe fallback
