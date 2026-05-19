/**
 * @module Evaluate
 * Core functions for evaluating and improving specifications using AI models.
 * Provides functionality for:
 * - Analyzing and evaluating specifications against best practices
 * - Breaking down complex specifications into atomic statements
 * - Extracting structured content from model responses
 * - Suggesting improvements for clarity, completeness and testability
 * - Validating specifications against standard guidelines
 * 
 *  Where we say 'specification', we mean either a Requirement or a User Story.  
 */
// Copyright (c) 2025 Jon Verrier

// ===Start StrongAI Generated Comment (20260314)===
// This module evaluates and improves textual specifications (requirements and user stories) using AI prompts and guideline documents. It loads prompt templates and guideline markdown files, calls a chat model, and extracts improved, structured results.
// 
// Main exports:
// - extractCodeFencedContent: Pulls and concatenates content from fenced code blocks in a model response.
// - improveSpecificationWithPrompt: Expands a selected prompt with parameters, calls the chat model (large OpenAI model, medium verbosity), and returns the raw evaluation plus the improved specification extracted from code fences.
// - improveSpecification: Validates inputs, injects guidelines, specification, and a target word count into a prompt, and delegates to improveSpecificationWithPrompt.
// - improveRequirementSplit: Uses a splitter prompt to break a requirement into atomic statements.
// - evaluateRequirement: Computes a bounded word count from input length, improves the requirement using requirement guidelines, then splits the result into atomic statements.
// - evaluateUserStory: Similar to evaluateRequirement but uses user story guidelines and does not split.
// 
// Key imports:
// - prompt-repository: ChatDriverFactory, PromptInMemoryRepository, model/provider enums, verbosity, IPrompt, InvalidParameterError.
// - PromptIds constants for selecting prompts.
// - fs and path for loading guideline files.
// - API types for request and response shapes.
// ===End StrongAI Generated Comment===


import path from "path";
import fs from "fs";

import { ISpecificationEvaluation, ISpecificationEvaluationRequest } from "../export/RequirementsLinterApiTypes";

import { EModel, EModelProvider, EVerbosity, ChatDriverFactory, IPrompt, PromptInMemoryRepository, InvalidParameterError } from "@jonverrier/prompt-repository";
import { requirementsGuidelineCheckerPromptId, requirementsSplitterPromptId, userStoryGuidelineCheckerPromptId } from './PromptIds';

import prompts from './Prompts.json';

const typedPrompts = prompts as IPrompt[];

const MIN_WORD_COUNT = 100;
const MAX_WORD_COUNT = 400;

const requirementGuidelines = fs.readFileSync(path.join(__dirname, './RequirementsGuidelines.md'), 'utf-8');
const userStoryGuidelines = fs.readFileSync(path.join(__dirname, './UserStoryGuidelines.md'), 'utf-8');

/**
 * Extracts all code-fenced content from a given response string.
 * 
 * @param response - The response string containing code-fenced content.
 * @returns The extracted code-fenced content or an empty string if no content is found.
 */
export function extractCodeFencedContent(response: string): string {
   const codeBlocks = response.match(/```(?:code|plaintext|requirement|userstory|specification)?\s*([\s\S]*?)```/g);
   if (!codeBlocks) {
       return '';
   }

   return codeBlocks
       .map(block => {
           const content = block.match(/```(?:code|plaintext|requirement|userstory|specification)?\s*([\s\S]*?)```/);
           return content ? content[1].trim() : '';
       })
       .filter(content => content.length > 0)
       .join('\n\n');
}

/**
 * Improves a requirement using a specified prompt and parameters.
 * 
 * @param promptId - The ID of the prompt to use for improvement
 * @param params - Key-value pairs of parameters to be expanded in the prompt
 * @returns A promise resolving to the improved requirement extracted from code-fenced content
 */
export async function improveSpecificationWithPrompt(
   promptId: string,
   params: { [key: string]: string }
): Promise<ISpecificationEvaluation> {
   // Load & expend the prompt
   const promptRepo = new PromptInMemoryRepository(typedPrompts);
   const prompt = promptRepo.getPrompt(promptId);
   const userPrompt = promptRepo.expandUserPrompt(prompt!, params);

   // Get the response from the model
   const chatDriverFactory = new ChatDriverFactory();
   const chatDriver = chatDriverFactory.create(EModel.kLarge, EModelProvider.kOpenAI);
   const response = await chatDriver.getModelResponse(prompt!.systemPrompt, userPrompt, EVerbosity.kMedium);

   return {
      evaluation: response,
      proposedNewSpecification: extractCodeFencedContent(response)
   };
}


/**
 * Evaluates a requirement against provided guidelines.
 * 
 * @param specification - The requirement to be evaluated.
 * @param wordCount - The word count to use to generate comments on the requirement.
 * @param promptId - The ID of the prompt to use for evaluation.
 * @param guidelines - The guidelines to evaluate the requirement against.
 * @returns A promise resolving to the evaluated requirement.
 */
export async function improveSpecification(
   specification: string, 
   wordCount: number, 
   promptId: string,
   guidelines: string
): Promise<ISpecificationEvaluation> {

   if (!specification || specification.trim().length === 0) {
      throw new InvalidParameterError('InvalidParameter: Specification cannot be empty');
   }
   if (!wordCount || wordCount <= 0) {
      throw new InvalidParameterError('InvalidParameter: Word count must be greater than 0');
   }
   if (!promptId || promptId.trim().length === 0) {
      throw new InvalidParameterError('InvalidParameter: Prompt ID cannot be empty');
   }
   if (!guidelines || guidelines.trim().length === 0) {
      throw new InvalidParameterError('InvalidParameter: Guidelines cannot be empty');
   }

   let evaluation = await improveSpecificationWithPrompt(promptId, {
      guidelines: guidelines,
      specification: specification,
      wordCount: wordCount.toString()
   })

   return evaluation;
}


/**
 * Updates a requirement if necessary by splitting it into atomic statements.
 * 
 * @param requirement - The requirement to be evaluated.
 * @returns A promise resolving to the evaluated requirement.
 */
export async function improveRequirementSplit(requirement: string): Promise<ISpecificationEvaluation> {
   let evaluation = await improveSpecificationWithPrompt(requirementsSplitterPromptId, {
      requirement: requirement
   });

   return evaluation;
}

function countWords(str: string): number {
   return str.split(/\s+/).reduce((count, word) => word.length > 0 ? count + 1 : count, 0);
}

/**
 * Evaluates a requirement against the standard guidelines.
 * 
 * @param requirement - The requirement to be evaluated.
 * @returns A promise resolving to the evaluated requirement.
 */
export async function evaluateRequirement(request: ISpecificationEvaluationRequest): Promise<ISpecificationEvaluation> {

   // The input is usually present in the output twice. We bracket this with min and max absolute incremental words. 
   let wordCount: number = Math.min(Math.max(countWords(request.specification) * 5, 
      countWords(request.specification) * 2 + MIN_WORD_COUNT), 
      countWords(request.specification) * 2 + MAX_WORD_COUNT);

   const improvedSpecification = await improveSpecification(request.specification, wordCount, 
                                                            requirementsGuidelineCheckerPromptId, requirementGuidelines);

   let splitSpecification = await improveRequirementSplit(improvedSpecification.proposedNewSpecification);

   return {
      evaluation: improvedSpecification.evaluation,
      proposedNewSpecification: splitSpecification.proposedNewSpecification
   }
}

/**
 * Evaluates a user story against the standard guidelines.
 *    
 * @param requirement - The user story to be evaluated.
 * @returns A promise resolving to the evaluated user story.
 */
export async function evaluateUserStory(request: ISpecificationEvaluationRequest): Promise<ISpecificationEvaluation> {

   // The input is usually present in the output twice. We bracket this with min and max absolute incremental words. 
   let wordCount: number = Math.min(Math.max(countWords(request.specification) * 5, 
      countWords(request.specification) * 2 + MIN_WORD_COUNT), 
      countWords(request.specification) * 2 + MAX_WORD_COUNT);

   const improvedSpecification = await improveSpecification(request.specification, wordCount, 
                                                            userStoryGuidelineCheckerPromptId, userStoryGuidelines);

   return {
      evaluation: improvedSpecification.evaluation,
      proposedNewSpecification: improvedSpecification.proposedNewSpecification
   }
}