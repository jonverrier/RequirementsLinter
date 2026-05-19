# Requirement Linter

Because no-one wants a fluffy requirement.

Influenced by Annie Vella's work on collaborative AI-Driven Development (which you can find [here](https://annievella.com/posts/the-sdlc-strikes-back/) and [here](https://dl.acm.org/doi/10.1145/3715003)).

## What this is

This is a **demonstration library**, not a full application. It shows one approach to using LLMs in the software development lifecycle (SDLC) — specifically for improving the quality of software requirements and user stories before they reach an AI coding assistant or a development team.

AI isn't just accelerating development, it is changing the way we build software. We are not writing all the code by hand anymore. We are increasingly writing specifications and prompts for AI coding assistants to generate code for us. These specifications and prompts need to be clearer to stakeholders and LLMs alike. This library addresses that problem.

## How it works

We prompt an LLM (currently OpenAI GPT-4) to review your user story or formal requirement against a set of guidelines.

For a **formal requirement**, we use the guidelines from the International Council of Systems Engineering '[Guide to Writing Requirements](https://www.incose.org/wp-content/uploads/legacy/working-groups/requirements-wg/guidetowritingrequirements/incose_rwg_gtwr_v4_summary_sheet.pdf)' (GtWR). The GtWR is a mature product that is widely used in the industry.

For a **user story**, we use a set of common industry guidelines:
- [UK Government - Writing User Stories](https://www.gov.uk/service-manual/agile-delivery/writing-user-stories)
- [Miro - How to Write Good User Stories](https://miro.com/agile/how-to-write-good-user-story/)
- [The Product Person - Writing Better User Stories Through Active Acceptance Criteria](https://medium.com/theproductperson/writing-better-user-stories-through-active-acceptance-criteria-5615a54e2750)

and then supplement these with a subset of the GtWR rules. User Stories are by definition less formal, so fewer tight rules apply.

You can find an online version of the Requirement Linter [here](https://nice-wave-0746ea503.6.azurestaticapps.net/index).

## Documentation

Generated architecture docs (C4 context and component diagrams) in the source tree:

- [Context diagram](src/README.StrongAI.Context.md) – how the linter interacts with users and external systems
- [Component diagram](src/README.StrongAI.Component.md) – library structure and modules

## Features

- Validates user stories or requirements against established guidelines
- Improves specification clarity and measurability
- Splits compound requirements into atomic statements when necessary
- Quick-check API to test whether a piece of text even looks like a requirement or user story

## Architecture

The library is structured around three main modules:

- **`Evaluate.ts`** — core evaluation engine. Loads guidelines from markdown files, builds prompts, calls the LLM, and extracts the improved specification from the response.
- **`QuickCheck.ts`** — lightweight pre-check that asks the LLM whether the input even looks like a requirement or user story (uses a smaller/faster model).
- **`entry.ts`** — public API surface, re-exporting the four main functions: `evaluateRequirement`, `evaluateUserStory`, `quickCheckLooksLikeRequirement`, `quickCheckLooksLikeUserStory`.

The prompts themselves are stored in `src/Prompts.json` as a structured repository, and the guidelines used for evaluation live in `src/RequirementsGuidelines.md` and `src/UserStoryGuidelines.md`.

C4 architecture diagrams at different levels of detail are available in the root:
- [System context](C4Context.C4Diagrammer.md)
- [Container diagram](C4Container.C4Diagrammer.md)
- [Component diagram](src/C4Component.C4Diagrammer.md)

## Prompts

There are two prompts per specification type:

**Review prompt** — asks the LLM to analyse the specification against the guidelines and suggest an improved version (wrapped in code fences so it can be extracted programmatically):

````
Given the following guidelines:
```guidelines
{guidelines}
```
review this requirement:
```requirement
{specification}
```
Review the requirement in the light of the guidelines. Please generate a succinct {wordCount} word review of the requirement by applying the guidelines. Focus on the most important issues first. For each issue found, cite the specific guideline rule number that was violated. Provide a re-phrased requirement (or multiple requirements if necessary) to comply with the guidelines, using code fences to demarcate the suggested new requirement(s). Check your spelling and grammar.
````

**Splitter prompt** (requirements only) — post-processes the reviewed requirement to break compound statements into atomic ones:

````
Here is a requirement:
```requirement
{requirement}
```
If the requirement should be split into multiple distinct requirements for clarity, testability, or traceability, please rewrite them as separate requirements. Use code fences to demarcate the set of new requirements. Do not split if the requirement can reasonably be written as a single requirement. If the requirement does not need to be split, return it unchanged within code fences.
````

## Examples

### User Story

Input:
```plaintext
As a developer I want to check user stories against my organisation's standards in my development environment
```

Output:
```plaintext
Basic Structure (R1-R4)

R1: Includes the actor ("developer")
R2: Includes what the user needs ("check user stories against my organisation's standards")
R3: Missing the goal/benefit (no "so that..." clause)
R4: Missing acceptance criteria completely

INVEST Framework (R6)

R6.1 Independent: Story stands alone
R6.2 Negotiable: Not overly specific about implementation
R6.3 Valuable: Checking against standards provides value
R6.4 Estimable: Lacks specifics to estimate effort
R6.5 Small: Scope seems appropriately sized
R6.6 Testable: No acceptance criteria to verify against

General Rules Violations

R8.11: Contains vague terms ("organisation's standards" is not specific)
R8.20: Uses indefinite article ("a developer") instead of definite article
"Check": This verb is somewhat vague; a more specific action would improve clarity
The story lacks completeness (one of the characteristics of good specifications)

Improved Version:
As a developer, I need to validate user stories against the organization's documented quality standards within my integrated development environment so that all project requirements meet quality thresholds before sprint planning.
Acceptance Criteria:

The validation tool identifies violations of each quality standard in the user story text.
The validation tool provides recommendations for correcting each identified violation.
The validation results appear in the IDE within 10 seconds of initiating the check.
```

### Formal Requirement

Input:
```plaintext
The system should respond quickly.
```

Output:
```plaintext
The requirement "the system should respond quickly" needs improvement based on several guidelines.
1. **Vague Terms (R7):** The term "quickly" is vague and lacks specific measurable performance targets. It should be defined with a specific response time.
2. **Active Voice (R2):** The requirement does not clearly identify the responsible entity. It should specify who or what is responsible for the action.
3. **Measurable Performance (R34):** The requirement lacks specific, measurable performance criteria that can be verified.
4. **Unambiguous (Characteristics):** The requirement is ambiguous and can be interpreted in multiple ways.

Here's a revised version:
The system shall respond to user inputs within 2 seconds under normal operating conditions.

This revision addresses the issues by providing a specific response time, using active voice, and ensuring the requirement is measurable and unambiguous.
```

## Tests

The functional tests are in [test/userstory-eval.test.ts](test/userstory-eval.test.ts) and [test/requirements.eval.test.ts](test/requirements.eval.test.ts). The test cases are taken from the [INCOSE Guide to Writing Requirements summary sheet](https://www.incose.org/wp-content/uploads/legacy/working-groups/requirements-wg/guidetowritingrequirements/incose_rwg_gtwr_v4_summary_sheet.pdf).

Not all tests are included — this is because the remaining cases turned into an exercise in writing increasingly complex regular expressions, and the value of those tests seemed to drop off versus getting the existing set passing reliably. As noted below, not all of the current tests always pass. The next focus area is getting the base set of evaluations to pass 100% of the time through prompt engineering, which seems more valuable than adding more regex-heavy test cases.

## Development

### Prerequisites

This library depends on the [PromptRepository](https://github.com/jonverrier/PromptRepository) companion package, which provides the prompt loading and LLM driver infrastructure. Clone it as a sibling directory before installing:

```bash
git clone https://github.com/jonverrier/PromptRepository ../PromptRepository
```

You also need an OpenAI API key set as an environment variable:

```bash
export OPENAI_API_KEY=<your key>
```

### Install and build

```bash
npm run setup   # installs the local PromptRepository package
npm install     # installs remaining dependencies
npm run build
```

### Run tests

```bash
npm run test
```

> **Note:** The tests do not always succeed. The case that fails most often involves a reference to a standard for the test `"The <SOI> shall not contain mercury."` — the guidelines state that a better form should have conditional and qualification clauses, and key terms defined in the project glossary or data dictionary. So far no amount of prompt engineering has reliably caught this; it is still a work in progress.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request against the `develop` branch in the main repo.

## License

MIT
Copyright (c) 2025 Jon Verrier
