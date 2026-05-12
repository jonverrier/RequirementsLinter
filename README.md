# Requirement Linter

Because no-one wants a fluffy requirement.

Influenced by Annie Vella's work on collaborative AI-Driven Development (which you can find [here](https://annievella.com/posts/the-sdlc-strikes-back/) and [here](https://dl.acm.org/doi/10.1145/3715003)). 

Why build this:
AI isn't just accelerating development, it is changing the way we build software. We are not writing all the code by hand anymore. We are increasingly writing specifications and prompts for AI coding assistants to generate code for us. These specifications and prompts need to be clearer to stakeholders and LLMs. This tool addresses that problem.  

How it works:
We prompt an LLM (currently OpenAI GPT5) to review your user story or formal requirement against a set of guidelines. 

For a formal requirement, we use the guidelines from the International Council of Systems Engineering '[Guide to Writing Requirements](https://www.incose.org/wp-content/uploads/legacy/working-groups/requirements-wg/guidetowritingrequirements/incose_rwg_gtwr_v4_summary_sheet.pdf)' (GtWR). The GtWR is a mature product that is widely used in the industry.  

For a user story, we use a set of common industry guidelines:
- [UK Government - Writing User Stories](https://www.gov.uk/service-manual/agile-delivery/writing-user-stories)
- [Miro - How to Write Good User Stories](https://miro.com/agile/how-to-write-good-user-story/)
- [The Product Person - Writing Better User Stories Through Active Acceptance Criteria](https://medium.com/theproductperson/writing-better-user-stories-through-active-acceptance-criteria-5615a54e2750)

and them supplement these with a subset of the GtWR rules. User Stories are by definition less formal, so fewer tight rules apply. 

You can find an online version of the Requirement Linter [here](https://nice-wave-0746ea503.6.azurestaticapps.net/index). 

## Documentation

Generated architecture docs (C4 context and component diagrams) in the source tree:

- [Context diagram](src/README.StrongAI.Context.md) – how the linter interacts with users and external systems
- [Component diagram](src/README.StrongAI.Component.md) – library structure and modules

## Features

- Validates user stories or requirements against established guidelines
- Improves specification clarity and measurability
- Splits compound requirements into atomic statements when necessary

## Examples

For a User Story: 

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

For a formal Requirement:

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

## How it works

We use the guidelines to build a prompt: 
````code
Here is a requirement:
```requirement
{requirement}
```
Review the requirement in the light of the following guidelines:
```guidelines 
{guidelines} 
```
Please give a succinct {wordCount} word review of the requirement by applying the guidelines. Focus on the most important issues first. For each issue found, cite the specific guideline rule number that was violated. Provide a re-phrased requirement (or multiple requirements if necessary) to comply with the guidelines, using code fences to demarcate the suggested new requirement(s). Consider the specific guidelines you have cited. Check your spelling and grammar.
````
There is another prompt to catch cases that need to be split - the main prompt was not great at this. This is run to post-process the result that comes from the main review. 

````code
Here is a requirement:
```requirement
{requirement}
```
If the requirement should be split into multiple distinct requirements for clarity, testability, or traceability, please rewrite them as separate requirements. Use code fences to demarcate the set of new requirements. Do not split if the requirement can reasonably be written as a single requirement. If the requirement does not need to be split, return it unchanged within code fences.
```` 

The functional tests are in [userstory-eval.test.ts](test/userstory-eval.test.ts) and [test/requirements.eval.test.ts](test/requirements.eval.test.ts). The test cases are taken from the [INCOSE Guide to Writing Requirements summary sheet](https://www.incose.org/wp-content/uploads/legacy/working-groups/requirements-wg/guidetowritingrequirements/incose_rwg_gtwr_v4_summary_sheet.pdf). Not all of the tests are included - this is because:
- it turned into an exercise of writing regular expressions to catch increasigly compex conditions, and the value of the tests seemed to be dropping off vs just publishing the tool in a reasonable first draft state. 
- as noted under installation, not all of the current tests always pass. The next focus area is getting the base set of evaluations to pass 100% of the time, which is a prompt engineering journey, and seems more valuable than coding dozens more regular expressions. 


## Development

To install:

Clone the companion [PromptRepository repo](https://github.com/jonverrier/PromptRepository). 

```plaintext
npm i

Ensure you have set your OpenAI API key as an environment variable: OPENAI_API_KEY, and that the PromptRepository package points to your local version.

npm run build
```
To run tests:
```plaintext
npm run test
```
Note that the tests do not currently always succeed. The case that fails most often is reference to a standard for the following test: "The <SOI> shall not contain mercury.". The guidlines state a better form should have conditional and qualification clauses, and key terms defined in the project glossary or data dictionary. So far no amount of prompt engineering has caught this - it's still a work in progress.  


## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request against the development branch in the main repo. 

## License

MIT
Copyright (c) 2025 Jon Verrier
