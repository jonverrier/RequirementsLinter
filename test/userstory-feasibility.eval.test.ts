/**
 * @module userstory-feasibility.eval.test
 * Integration tests for the evaluateUserStory function.
 */
// Copyright (c) 2025 Jon Verrier

// ===Start StrongAI Generated Comment (20260314)===
// This module defines integration tests for a user story feasibility evaluator. It verifies that a prompt-driven model returns a normalized yes or no for given statements. There are no exports; everything runs as a Mocha test suite.
// 
// The key function is evaluateUserStory. It loads a prompt by ID from an in-memory prompt repository, expands the user prompt with the provided story, and sends it to a chat model. It uses ChatDriverFactory to create a client targeting EModel.kMini from EModelProvider.kOpenAI. It requests a response at EVerbosity.kMedium. The raw response is then normalized by extractResponse, which trims, lowercases, and removes punctuation to ensure clean yes/no output.
// 
// The test suite uses Mocha’s describe and it to define three cases with a 30s timeout. Two inputs are valid user stories that should yield yes, and one is a non-story that should yield no. It relies on expect for assertions. It imports PromptInMemoryRepository, typing interfaces (IPromptRepository, IPrompt), and prompt data from Prompts.json along with userStoryFeasibilityCheckerPromptId.
// ===End StrongAI Generated Comment===


import { expect } from 'expect';
import { PromptInMemoryRepository, IPromptRepository, IPrompt, EModel, EModelProvider, EVerbosity, ChatDriverFactory } from "@jonverrier/prompt-repository";
import prompts from '../src/Prompts.json';
import { userStoryFeasibilityCheckerPromptId } from '../src/PromptIds';

const typedPrompts = prompts as IPrompt[];

function extractResponse(response: string): string {
    // we expect just 'yes' or 'no', we'll trim, lowercase and remove punctuation from the response
    return response.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
}

async function evaluateUserStory(promptRepo: IPromptRepository, story: string): Promise<string> {
    const prompt = promptRepo.getPrompt(userStoryFeasibilityCheckerPromptId);
    const userPrompt = promptRepo.expandUserPrompt(prompt!, {
        statement: story
    });

    const chatDriverFactory = new ChatDriverFactory();
    const chatDriver = chatDriverFactory.create(EModel.kMini, EModelProvider.kOpenAI);    

    const response = await chatDriver.getModelResponse(prompt!.systemPrompt, userPrompt, EVerbosity.kMedium);
    return extractResponse(response);
}

describe('User Story Feasibility Tests', () => {
    const TEST_TIMEOUT = 30000;

    const promptRepo: IPromptRepository = new PromptInMemoryRepository(typedPrompts);

    // Test 1: Clear user story that should return "yes"
    it('should identify a clear user story', async () => {
        const input = "As a Race Engineer, I want to monitor the tire temperature to ensure it stays between 80-100°C during the race.";
        const response = await evaluateUserStory(promptRepo, input);
        expect(response).toBe("yes");
    });

    // Test 2: Similar user story with different values but same structure
    it('should identify a similar user story with different values', async () => {
        const input = "As a Race Engineer, I want to monitor the tire temperature to ensure it stays between 75-95°C during the race.";
        const response = await evaluateUserStory(promptRepo, input);
        expect(response).toBe("yes");
    });

    // Test 3: Non-user story statement that should return "no"
    it('should reject a non-user story statement', async () => {
        const input = "I love looking at the tires on an F1 car.";
        const response = await evaluateUserStory(promptRepo, input);
        expect(response).toBe("no");
    });
}); 