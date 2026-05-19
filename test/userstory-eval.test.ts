// ===Start StrongAI Generated Comment (20260314)===
// This module defines a Mocha test suite that verifies automated evaluation of user stories. It exercises the evaluateUserStory function with several input variations to ensure the evaluator flags common issues and recognizes compliant stories.
// 
// There are no exports from this file. Its primary role is to run five tests:
// - Missing Actor: expects the evaluation to indicate an absent actor.
// - Missing Goal: expects the evaluation to indicate an absent goal.
// - Non-INVEST Compliant: expects detection of INVEST violations.
// - Vague Terms: expects identification of vague wording.
// - Good Compliance: expects no violation language for a well-formed story with acceptance criteria and performance constraints.
// 
// Key imports:
// - describe and it from mocha to define and run asynchronous tests with a 30-second timeout.
// - expect from expect to assert on evaluation text using toMatch and toContain.
// - evaluateUserStory from ../src/Evaluate, the async function under test returning an object with an evaluation string.
// - ISpecificationEvaluationRequest from the API types to type the request shape.
// 
// A helper creates requests with a fixed session ID to simulate a stable evaluation context.
// ===End StrongAI Generated Comment===

import { expect } from 'expect';
import { evaluateUserStory } from '../src/Evaluate';
import { ISpecificationEvaluationRequest } from '../export/RequirementsLinterApiTypes';

const SESSION_ID = 'test-session-123';

describe('User Story Evaluation Tests', () => {

   const TEST_TIMEOUT = 30000; // 30 seconds as we have a large prompt with all the requirements

    const createRequest = (requirement: string): ISpecificationEvaluationRequest => ({
        specification: requirement,
        sessionId: SESSION_ID
    });

    it('Test Case 1: Missing Actor', async () => {
        const input = "I need to validate requirements so that quality is ensured.";
        const request = createRequest(input);
        
        const result = await evaluateUserStory(request);
        
        expect(result.evaluation.toLowerCase()).toMatch(/(missing|lacks)/);
        expect(result.evaluation.toLowerCase()).toContain('actor');
    });

    it('Test Case 2: Missing Goal', async () => {
        const input = "As a developer, I need to validate requirements.";
        const request = createRequest(input);
        
        const result = await evaluateUserStory(request);
        
        expect(result.evaluation.toLowerCase()).toMatch(/(missing|lacks)/);
        expect(result.evaluation.toLowerCase()).toMatch(/(goal|business outcome|outcome|benefit)/);
    });

    it('Test Case 3: Non-INVEST Compliant', async () => {
        const input = "As a team, we need to build everything in the system so users are happy.";
        const request = createRequest(input);
        
        const result = await evaluateUserStory(request);
        
        expect(result.evaluation.toLowerCase()).toMatch(/(violates|violating|does not comply|does not adhere|fails to meet|does not meet|not a valid user story|does not follow|not testable|not estimable)/);
    });

    it('Test Case 4: Vague Terms', async () => {
        const input = "As a developer, I need an appropriate tool to efficiently validate many requirements.";
        const request = createRequest(input);
        
        const result = await evaluateUserStory(request);
        
        expect(result.evaluation.toLowerCase()).toMatch(/(vague|terms)/);
    });

    it('Test Case 5: Good Compliance', async () => {
        const input = "As a developer, I need to validate requirements so that I can ensure they meet quality standards. Acceptance criteria: I receive at least one suggestion to improve each user story I provide to the system. The system processes requirements in noi less than 30 seconds with a target of 10 seconds.";
        const request = createRequest(input);
        
        const result = await evaluateUserStory(request);
        
        expect(result.evaluation).not.toMatch(/(violates|does not adhere|does not comply|fails to meet|does not meet)/);
    });
}); 