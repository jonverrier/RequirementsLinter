/**
 * @module evaluaterequirement.eval.test
 * Integration tests for the reviewAndImproveRequirement function.
 */
// Copyright (c) 2025 Jon Verrier

// ===Start StrongAI Generated Comment (20260314)===
// This module defines integration tests for the evaluateRequirement function. Its purpose is to verify end-to-end behavior when evaluating and improving natural-language requirements, including successful outputs and error handling under varied inputs.
// 
// There are no exports from this module. It runs a Mocha test suite with several cases:
// - Simple requirement produces non-empty evaluation and proposedNewSpecification.
// - Complex requirement yields non-empty outputs and splits the improved specification across multiple lines.
// - Empty input causes the promise to reject with an error.
// - Very short requirement is expanded; the improved text is longer than the input.
// - Requirements containing special characters are processed without failing.
// 
// Each test calls evaluateRequirement with an object containing a specification string and a fixed sessionId. Assertions check the shape and minimal quality of the results. The suite uses an extended timeout (30 seconds) to accommodate potentially slow API calls made by evaluateRequirement.
// 
// Key imports:
// - describe and it from mocha to structure and run tests.
// - expect from expect for assertions.
// - evaluateRequirement from ../src/Evaluate, the function under test.
// ===End StrongAI Generated Comment===


import { expect } from 'expect';
import { evaluateRequirement } from '../src/Evaluate';

const SESSION_ID = '1234567890';

describe('evaluateRequirement Integration Tests', () => {
    // Increase timeout for API calls
    const TEST_TIMEOUT = 60000; // 60 seconds as we have a large prompt with all the requirements

    it('should handlea simple requirement', async () => {
        // Arrange
        const inputRequirement = 'The system must handle user authentication';

        // Act
        const result = await evaluateRequirement({ specification: inputRequirement, sessionId: SESSION_ID });

        // Assert
        expect(result.evaluation.length).toBeGreaterThan(0);
        expect(result.proposedNewSpecification.length).toBeGreaterThan(0);
    });

    it('should handle a complex requirement', async () => {
        // Arrange
        const inputRequirement = 'The system must handle user authentication, perform data validation, and ensure proper error handling while maintaining high performance and scalability';

        // Act
        const result = await evaluateRequirement({ specification: inputRequirement, sessionId: SESSION_ID });

        // Assert
        expect(result.evaluation.length).toBeGreaterThan(0);
        expect(result.proposedNewSpecification.length).toBeGreaterThan(0);
        // Complex requirements should be split into multiple lines
        expect(result.proposedNewSpecification.split('\n').length).toBeGreaterThan(1);
    });

    it('should handle empty input', async () => {
        // Arrange
        const inputRequirement = '';

        // Act
        await expect(evaluateRequirement({ specification: inputRequirement, sessionId: SESSION_ID }))
            .rejects
            .toThrow();
    });

    it('should handle very short requirements', async () => {
        // Arrange
        const inputRequirement = 'Must be fast';

        // Act
        const result = await evaluateRequirement({ specification: inputRequirement, sessionId: SESSION_ID });

        // Assert
        expect(result.evaluation.length).toBeGreaterThan(0);
        expect(result.proposedNewSpecification.length).toBeGreaterThan(0);
        // Improved version should be more detailed
        expect(result.proposedNewSpecification.length).toBeGreaterThan(inputRequirement.length);
    });

    it('should handle requirements with special characters', async () => {
        // Arrange
        const inputRequirement = 'System must handle UTF-8 characters like: é, ñ, 漢字';

        // Act
        const result = await evaluateRequirement({ specification: inputRequirement, sessionId: SESSION_ID });

        // Assert
        expect(result.evaluation.length).toBeGreaterThan(0);
        expect(result.proposedNewSpecification.length).toBeGreaterThan(0);
    });
});