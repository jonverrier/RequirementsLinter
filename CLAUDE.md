# CLAUDE.md — RequirementLinter

## Project overview

This is a **demonstration TypeScript library** (not a runnable application) showing how LLMs can be used in the SDLC to improve software requirements and user stories. It was published on Hacker News and has public watchers; changes should maintain that "educational demo" character.

## Repository structure

```
src/           — library source code
  Evaluate.ts          — core evaluation engine (main logic)
  QuickCheck.ts        — lightweight pre-validation module
  entry.ts             — public API exports
  PromptIds.ts         — UUID constants for each prompt
  Prompts.json         — prompt definitions (structured repository)
  RequirementsGuidelines.md  — INCOSE GtWR rules used at runtime
  UserStoryGuidelines.md     — user story guidelines used at runtime
export/        — public type definitions (API surface)
  RequirementsLinterApiTypes.ts
test/          — mocha + ts-node tests
C4*.md         — C4 architecture diagrams (context, container, component)
```

## Local dependency

The `prompt-repository` package is a **local sibling repository** at `../PromptRepository`. It must be cloned separately before running `npm install`. The `npm run setup` script handles linking it.

## Build and test

```bash
npm run setup     # links ../PromptRepository
npm install       # installs remaining deps
npm run build     # tsc + copies markdown guidelines to dist/
npm run test      # mocha via ts-node
```

Requires `OPENAI_API_KEY` in the environment. Tests call the real OpenAI API and are not fully deterministic — some eval tests are known to fail intermittently.

## Key conventions

- All prompts live in `src/Prompts.json` — do not hardcode prompt text in `.ts` files.
- Guidelines (the content injected into prompts) are markdown files loaded at runtime via `fs.readFileSync`; they are copied to `dist/` by the build script.
- The `extractCodeFencedContent` helper in `Evaluate.ts` is the canonical way to parse LLM responses — reuse it rather than writing new regex.
- TypeScript `strict` mode is enabled; avoid `any` casts.
- The `package.json` `"install"` lifecycle hook is intentionally **not** used here — the local-package setup uses `"setup"` instead to avoid npm hook conflicts.

## What not to change

- The `export/RequirementsLinterApiTypes.ts` file defines the public API; changes here are breaking for consumers.
- The prompt UUIDs in `PromptIds.ts` must stay stable — they are keys into `Prompts.json`.
