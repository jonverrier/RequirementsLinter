/**
 * @module evaluateuserstory.eval.test
 * Integration tests for the evaluateUserStory function.
 */
// Copyright (c) 2025 Jon Verrier

// ===Start StrongAI Generated Comment (20260314)===
// This module defines an integration test suite for the evaluateUserStory function. It verifies that the function can assess and improve user story text and return structured feedback. The suite uses a fixed session identifier to group calls and increases the per-test timeout to accommodate slower API-style processing.
// 
// There are tests for several scenarios:
// - A simple, well-formed user story should yield a non-empty evaluation and a proposed improved specification.
// - A complex story should produce multiple lines, indicating suggested splitting.
// - Empty input must cause the function to reject with an error.
// - A very short, informal story should be reformatted into a standard “As a … I want … so that …” shape.
// - Stories containing special characters should be handled without failure.
// - Stories with acceptance criteria should retain or enhance those criteria.
// 
// The module exports no symbols. It relies on Mocha’s describe and it for structuring asynchronous tests with timeouts, Expect for assertions, and the evaluateUserStory function imported from ../src/Evaluate as the unit under test.
// ===End StrongAI Generated Comment===


import { expect } from 'expect';
import { evaluateUserStory } from '../src/Evaluate';

const SESSION_ID = '1234567890';

describe('evaluateUserStory Integration Tests', () => {
    // Increase timeout for API calls
    const TEST_TIMEOUT = 30000; // 30 seconds as we have a large prompt with all the requirements

    it('should improve a simple user story', async () => {
        // Arrange
        const inputUserStory = 'As a user, I want to log in so that I can access my account';

        // Act
        const result = await evaluateUserStory({ specification: inputUserStory, sessionId: SESSION_ID });

        // Assert
        expect(result.evaluation.length).toBeGreaterThan(0);
        expect(result.proposedNewSpecification.length).toBeGreaterThan(0);
    });

    it('should handle a complex user story', async () => {
        // Arrange
        const inputUserStory = 'As a customer, I want to be able to view my order history, track shipments, and manage my payment methods so that I can have better control over my shopping experience';

        // Act
        const result = await evaluateUserStory({ specification: inputUserStory, sessionId: SESSION_ID });

        // Assert
        expect(result.evaluation.length).toBeGreaterThan(0);
        expect(result.proposedNewSpecification.length).toBeGreaterThan(0);
        // Complex user stories should be split into multiple stories
        expect(result.proposedNewSpecification.split('\n').length).toBeGreaterThan(1);
    });

    it('should handle empty input', async () => {
        // Arrange
        const inputUserStory = '';

        // Act
        await expect(evaluateUserStory({ specification: inputUserStory, sessionId: SESSION_ID }))
            .rejects
            .toThrow();
    });

    it('should handle very short user stories', async () => {
        // Arrange
        const inputUserStory = 'I want to login';

        // Act
        const result = await evaluateUserStory({ specification: inputUserStory, sessionId: SESSION_ID });

        // Assert
        expect(result.evaluation.length).toBeGreaterThan(0);
        expect(result.proposedNewSpecification.length).toBeGreaterThan(0);
        // Improved version should be more detailed and follow user story format
        expect(result.proposedNewSpecification).toMatch(/As a .* I want to .* so that .*/);
    });

    it('should handle user stories with special characters', async () => {
        // Arrange
        const inputUserStory = 'As a user, I want to use special characters like: é, ñ, 漢字 in my profile';

        // Act
        const result = await evaluateUserStory({ specification: inputUserStory, sessionId: SESSION_ID });

        // Assert
        expect(result.evaluation.length).toBeGreaterThan(0);
        expect(result.proposedNewSpecification.length).toBeGreaterThan(0);
    });

    it('should handle user stories with acceptance criteria', async () => {
        // Arrange
        const inputUserStory = 'As a user, I want to reset my password so that I can regain access to my account. Acceptance Criteria: The user can reset their password by clicking the reset password link in the login page.';

        // Act
        const result = await evaluateUserStory({ specification: inputUserStory, sessionId: SESSION_ID });

        // Assert
        expect(result.evaluation.length).toBeGreaterThan(0);
        expect(result.proposedNewSpecification.length).toBeGreaterThan(0);
        // Should maintain or improve the acceptance criteria
        expect(result.proposedNewSpecification.toLowerCase()).toContain('acceptance criteria');
    });
}); 