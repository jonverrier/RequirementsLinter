   /**
 * @module evaluaterequirement.eval.test
 * Integration tests for the reviewAndImproveRequirement function.
 */
// Copyright (c) 2025 Jon Verrier

// ===Start StrongAI Generated Comment (20260314)===
// This module is a test suite for extractCodeFencedContent. It verifies that the function correctly extracts and normalizes text from Markdown-style code fences. The tests focus on behavior across common and edge cases to prevent regressions.
// 
// There are no exports from this module. It defines a Mocha describe block with several it cases. Each case exercises a specific scenario and asserts the output.
// 
// The tested function, extractCodeFencedContent, is imported from ../src/Evaluate. The suite checks that it:
// - Extracts content from a single fenced block.
// - Combines content from multiple fenced blocks, inserting a blank line between blocks.
// - Ignores optional language specifiers following the opening fence (for example, code, plaintext, requirement, userstory).
// - Handles empty code blocks by returning an empty string.
// - Returns an empty string when the input has no fenced blocks.
// 
// Key dependencies are:
// - describe and it from mocha to define and organize tests.
// - expect from expect to perform assertions.
// These imports provide the test structure and verification mechanism around the target function.
// ===End StrongAI Generated Comment===


import { expect } from 'expect';
import { extractCodeFencedContent } from '../src/Evaluate';

describe('extractCodeFencedContent Unit Tests', () => {
    it('should extract content from a single code block', () => {
        // Arrange
        const input = '```\nThis is a test\n```';
        
        // Act
        const result = extractCodeFencedContent(input);
        
        // Assert
        expect(result).toBe('This is a test');
    });

    it('should extract content from multiple code blocks', () => {
        // Arrange
        const input = '```\nFirst block\n```\nSome text\n```\nSecond block\n```';
        
        // Act
        const result = extractCodeFencedContent(input);
        
        // Assert
        expect(result).toBe('First block\n\nSecond block');
    });

    it('should handle code blocks with language specifiers', () => {
        // Arrange
        const input = '```code\nTest code\n```\n```plaintext\nTest text\n```';
        
        // Act
        const result = extractCodeFencedContent(input);
        
        // Assert
        expect(result).toBe('Test code\n\nTest text');
    });

    it('should handle empty code blocks', () => {
        // Arrange
        const input = '```\n```';
        
        // Act
        const result = extractCodeFencedContent(input);
        
        // Assert
        expect(result).toBe('');
    });

    it('should return empty string when no code blocks are present', () => {
        // Arrange
        const input = 'This is just regular text';
        
        // Act
        const result = extractCodeFencedContent(input);
        
        // Assert
        expect(result).toBe('');
    });

    it('should handle code blocks with requirement language specifier', () => {
        // Arrange
        const input = '```requirement\nTest requirement\n```';
        
        // Act
        const result = extractCodeFencedContent(input);
        
        // Assert
        expect(result).toBe('Test requirement');
    });

    it('should handle code blocks with user story language specifier', () => {
      // Arrange
      const input = '```userstory\nTest user story\n```';
      
      // Act
      const result = extractCodeFencedContent(input);
      
      // Assert
      expect(result).toBe('Test user story');
  });    
});

