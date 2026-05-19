/**
 * @module QuickCheck
 * Provides functionality to quickly check if a given statement looks like a system requirement.
 * Uses AI to evaluate the statement against standard requirement criteria.
 */
// Copyright (c) 2025 Jon Verrier

// ===Start StrongAI Generated Comment (20260314)===
// This module provides a fast AI-backed check to assess whether a given statement looks like a system requirement or a user story. It exposes two async functions: quickCheckLooksLikeRequirement and quickCheckLooksLikeUserStory. Both accept an IQuickCheckRequest containing a statement and an optional beFriendly flag, and return an IQuickCheckResponse with an isSpecification boolean. Each function delegates to a shared helper that selects the appropriate prompt.
// 
// The implementation relies on prompt-repository for core functionality: ChatDriverFactory to create a chat driver, EModel.kMini and EModelProvider.kOpenAI to choose a lightweight OpenAI model, EVerbosity.kMedium for response verbosity, PromptInMemoryRepository to load and expand prompts from Prompts.json, and InvalidParameterError for input validation. It imports requirement and user story prompt IDs from PromptIds, and API types from RequirementsLinterApiTypes.
// 
// Behavior: it requires request.statement, builds the user prompt with the statement, invokes the model, then normalizes the reply (trim, lowercase, strip punctuation). It returns true for “yes”, false for “no”, and otherwise falls back to beFriendly (true -> true, false -> false).
// ===End StrongAI Generated Comment===


import { IQuickCheckRequest, IQuickCheckResponse } from "../export/RequirementsLinterApiTypes";

import { ChatDriverFactory, EModel, EModelProvider, EVerbosity, IPrompt, PromptInMemoryRepository, InvalidParameterError } from "@jonverrier/prompt-repository";
import { requirementsFeasibilityCheckerPromptId, userStoryFeasibilityCheckerPromptId } from "./PromptIds";
import prompts from "./Prompts.json";
const typedPrompts = prompts as IPrompt[];

/**
 * Checks if a given statement looks like a system requirement.
 * @param request - The request query specification.
 * @returns True if the statement looks like a system requirement, false otherwise.
 */
export async function quickCheckLooksLikeRequirement (request: IQuickCheckRequest) : Promise<IQuickCheckResponse> {

    return await quickCheckLooksLikeRequirementWithPrompt(request, requirementsFeasibilityCheckerPromptId);
}

/**
 * Checks if a given statement looks like a system requirement.
 * @param request - The request query specification.
 * @returns True if the statement looks like a system requirement, false otherwise.
 */
export async function quickCheckLooksLikeUserStory (request: IQuickCheckRequest) : Promise<IQuickCheckResponse> {

   return await quickCheckLooksLikeRequirementWithPrompt(request, userStoryFeasibilityCheckerPromptId);
}

/**
 * Checks if a given statement looks like a system requirement using a specified prompt.
 * @param request - The request query specification.
 * @param promptId - The ID of the prompt to use for checking.
 * @returns True if the statement looks like a system requirement, false otherwise.
 */
async function quickCheckLooksLikeRequirementWithPrompt (request: IQuickCheckRequest, promptId: string) : Promise<IQuickCheckResponse> {

    if (!request.statement) {
        throw new InvalidParameterError("Statement is required.");
    }

    // Create a fast chat driver
    const chatDriverFactory = new ChatDriverFactory();
    const chatDriver = chatDriverFactory.create(EModel.kMini, EModelProvider.kOpenAI);  

    // Load & expend the prompt
    const promptRepo = new PromptInMemoryRepository(typedPrompts);
    const prompt = promptRepo.getPrompt(promptId);
    const userPrompt = promptRepo.expandUserPrompt(prompt!, {
      statement: request.statement
    });

    // Get the response from the AI
    const response = await chatDriver.getModelResponse(prompt!.systemPrompt, userPrompt, EVerbosity.kMedium);

    // Trim, lower case and remove punctuation from the response
    const trimmed = response.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');

    switch (trimmed) {
        case 'yes':
            return { isSpecification: true };
        case 'no':
            return { isSpecification: false };
        default:
         if (request.beFriendly) {
            return { isSpecification: true };
         }
         else {
            return { isSpecification: false };
         }
    }
}
