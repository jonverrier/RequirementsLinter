/**
 * @module requirements-splitter.eval.test
 * Integration tests for the evaluateRequirementSplit function.
 */
// Copyright (c) 2025 Jon Verrier

// ===Start StrongAI Generated Comment (20260314)===
// This module defines an integration test suite for the requirement-splitting logic. It verifies that the function under test produces an appropriate number of distinct requirement statements when given different types of input. The focus is on ensuring single, simple requirements are not split, while compound requirements are split into multiple clauses.
// 
// The suite does not export any symbols. Instead, it registers tests with the Mocha runner using describe and it. Each test is asynchronous and applies a per-test timeout to guard against long-running operations.
// 
// The core dependency is improveRequirementSplit imported from ../src/Evaluate. The tests call this function with a specification sentence and expect a structured response containing a proposedNewSpecification field. The content of this field is inspected by counting occurrences of the modal verbs “shall” or “must” via a case-insensitive regular expression. The expect library provides assertion utilities to compare the counted occurrences against expected values, checking both equality and greater-than scenarios. Collectively, these tests validate semantic splitting behavior across simple, equivalent-wording, and compound inputs.
// ===End StrongAI Generated Comment===


import { expect } from 'expect';
import { improveRequirementSplit } from '../src/Evaluate';

describe('Requirements Splitter Tests', () => {
    const TEST_TIMEOUT = 30000;

    // Test 1: Simple single requirement that should not be split
    it('should not split a simple single requirement', async () => {
        const input = "The vehicle's engine oil shall operate at a minimum temperature of 80°C.";
        const response = await improveRequirementSplit(input);
        
        // Should have single "shall/must" statements      
        const shallCount = (response.proposedNewSpecification.toLowerCase().match(/(shall|must)/g) || []).length;
        expect(shallCount).toEqual(1);        
    });

    // Test 2: Similar requirement with different wording but same meaning
    it('should handle equivalent requirement with different wording', async () => {
        const input = "The vehicle's engine oil shall operate at a minimum temperature of 90°C.";
        const response = await improveRequirementSplit(input);
        
        // Should have single "shall/must" statements       
        const shallCount = (response.proposedNewSpecification.toLowerCase().match(/(shall|must)/g) || []).length;
        expect(shallCount).toEqual(1);
    });

    // Test 3: Complex requirement that should be split
    it('should split compound requirements', async () => {
        const input = "The vehicle's engine oil shall operate at a minimum temperature of 80°C and the Speedometer shall display speed in kph.";
        const response = await improveRequirementSplit(input);      

        // Should have multiple "shall/must" statements
        const shallCount = (response.proposedNewSpecification.toLowerCase().match(/(shall|must)/g) || []).length;

        expect(shallCount).toBeGreaterThan(1);
    });
});