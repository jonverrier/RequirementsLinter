/**
 * @module requirements-feasibility.eval.test
 * Integration tests for the evaluateRequirementFeasibility function.
 */
// Copyright (c) 2025 Jon Verrier

// ===Start StrongAI Generated Comment (20260314)===
// This module defines integration tests for evaluating if a natural-language requirement is feasible, returning a normalized “yes” or “no”. It builds a prompt-driven chat request using an in-memory prompt repository and a chat driver, then asserts behavior across representative inputs.
// 
// Two local helpers drive the tests. extractResponse normalizes model output by trimming, lowering case, and removing punctuation to reduce noise. evaluateRequirementFeasibility loads the requirements feasibility checker prompt, expands it with the given statement, invokes a chat model, and returns the normalized answer.
// 
// The module does not export symbols. Its observable behavior is validated through three mocha test cases: a clear requirement yields “yes”, a similar requirement with different numeric values also yields “yes”, and a non-requirement sentence yields “no”. Each test uses a 30-second timeout.
// 
// Key dependencies include mocha (describe, it) and expect for assertions. From prompt-repository it relies on PromptInMemoryRepository, IPromptRepository, IPrompt, ChatDriverFactory, and enums EModel, EModelProvider, and EVerbosity to select the model and verbosity. It also uses Prompts.json and requirementsFeasibilityCheckerPromptId.
// ===End StrongAI Generated Comment===


import { expect } from 'expect';
import { PromptInMemoryRepository, IPromptRepository, IPrompt, EModel, EModelProvider, EVerbosity, ChatDriverFactory } from "@jonverrier/prompt-repository";
import prompts from '../src/Prompts.json';
import { requirementsFeasibilityCheckerPromptId } from '../src/PromptIds';

const typedPrompts = prompts as IPrompt[];

function extractResponse(response: string): string {
    // we expect just 'yes' or 'no', we'll trim, lowercase and remove punctuation from the response
    return response.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
}

async function evaluateRequirementFeasibility(promptRepo: IPromptRepository, statement: string): Promise<string> {
    const prompt = promptRepo.getPrompt(requirementsFeasibilityCheckerPromptId);
    const userPrompt = promptRepo.expandUserPrompt(prompt!, {
        statement: statement
    });

    const chatDriverFactory = new ChatDriverFactory();
    const chatDriver = chatDriverFactory.create(EModel.kMini, EModelProvider.kOpenAI);    

    const response = await chatDriver.getModelResponse(prompt!.systemPrompt, userPrompt, EVerbosity.kMedium);
    return extractResponse(response);
}

describe('Requirements Feasibility Tests', () => {
    const TEST_TIMEOUT = 30000;

    const promptRepo: IPromptRepository = new PromptInMemoryRepository(typedPrompts);

    // Test 1: Clear requirement statement that should return "yes"
    it('should identify a clear requirement statement', async () => {
        const input = "The Formula 1 car shall maintain a minimum fuel level of 1.0 liters after completing the race.";
        const response = await evaluateRequirementFeasibility(promptRepo, input);
        expect(response).toBe("yes");
    });

    // Test 2: Similar requirement with different values but same structure
    it('should identify a similar requirement with different values', async () => {
        const input = "The Formula 1 car shall maintain a minimum fuel level of 0.5 liters after completing the race.";
        const response = await evaluateRequirementFeasibility(promptRepo, input);
        expect(response).toBe("yes");
    });

    // Test 3: Non-requirement statement that should return "no"
    it('should reject a non-requirement statement', async () => {
        const input = "Formula 1 cars are really fast and exciting to watch during the race.";
        const response = await evaluateRequirementFeasibility(promptRepo, input);
        expect(response).toBe("no");
    });
});