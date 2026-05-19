// Copyright (c) 2025 Jon Verrier

// ===Start StrongAI Generated Comment (20260314)===
// This module defines a Mocha test suite that verifies automated improvements to natural-language requirements. It imports expect from the expect assertion library, describe and it from mocha to structure tests, and evaluateRequirement from ../src/Evaluate, which performs the actual requirement rewriting. The module does not export anything.
// 
// It declares sample requirement cases covering common quality issues: passive voice, missing definitions or references, spelling, missing units, combined requirements, ambiguous options, and non-measurable statements. Each case has an unacceptable string and one or more improved examples used only for context.
// 
// A helper, getRevisedRequirement, calls evaluateRequirement with a fixed SESSION_ID and returns the proposedNewSpecification. It sets but does not use a wordCount and suppresses optional logging via logAIResponseVsSuggested.
// 
// The test suite “Requirements Evaluation Tests” runs multiple async tests with a 30-second timeout. Each test feeds an unacceptable requirement to getRevisedRequirement, then asserts the AI-produced text matches targeted regex patterns. These patterns check for active-voice constructions, presence of definition references, corrected spelling, units, measurable criteria, or splitting into multiple requirements as appropriate.
// ===End StrongAI Generated Comment===


import { expect } from 'expect';

import { evaluateRequirement } from '../src/Evaluate';

const SESSION_ID = '1234567890';

interface IRequirementExample {
    unacceptable: string;
    improved: string[];
}

const noActiveVoice: IRequirementExample = {
    unacceptable: "The Identity of the Customer shall be confirmed.",
    improved: ["The Identity of the Customer shall be confirmed by the {System}.", "The {System} shall confirm the Customer_Identity."]
};

const noDefinitionReference: IRequirementExample = {
    unacceptable: "The <SOI> shall display the current time as defined in <Display Standard xyz>.",
    improved: ["The <SOI> shall display the Current_Time as defined in <Display Standard xyz>."]
};

const noDefinition: IRequirementExample = {
    unacceptable: "The <SOI> shall provide a time display.",
    improved: ["The <SOI> shall display the Current_Time as defined in <display standard xyz>."]
};

const noDefinition2: IRequirementExample = {
   unacceptable: "The <corporate website> shall only use Approved_Fonts.",
   improved: ["The <corporate website> shall display information using Approved_Fonts defined in <Display Standard xyz>."]
};

const incorrectSpelling: IRequirementExample = {
   unacceptable: "The Weapon_System shall store the location of each ordznance.",
   improved: ["The Weapon_System shall store the Location of each Ordnance."]
};

const noUnits: IRequirementExample = {
    unacceptable: "With power applied, The Circuit_Board shall <…> a temperature of less than 30 degrees.",
    improved: ["With power applied, The Circuit_Board shall <…> a temperature of less than 30 degrees Celsius."] 
};

const noActiveVoiceAndNoDefinitionsEither: IRequirementExample = {
    unacceptable: "The user shall either be trusted or not trusted.", 
    improved: ["The Security_System shall categorize each User as EITHER Trusted OR Not_Trusted."]
};

const twoRequirements: IRequirementExample = {
    unacceptable: "The <SOI> shall display the Location and Identity of the Lead_Vehicle.",
    improved: ["The <SOI> shall display the Location of the Lead_Vehicle per <Display Standard xyx>.", "The <SOI> shall display the Identity of the Lead_Vehicle per <Display Standard xyx>."]
};

const unclearDefinitions: IRequirementExample = {
    unacceptable: "The <SOI> shall provide an audible or visual alarm having the characteristics defined in <alarm standard xyz>.",
    improved: ["The <SOI> shall provide EITHER an Audible_Alarm OR Visual_Alarm having the characteristics defined in <Alarm Standard xyz>.",
      "The <SOI> shall provide an Audible_Alarm having the characteristics defined in <Alarm Standard xyz>.", "The <SOI> shall provide a Visual_Alarm having the characteristics defined in <Alarm Standard xyz>."
    ]
};

const notMeasurable: IRequirementExample = {
    unacceptable: "The <SOI> shall not fail.",
    improved: ["The <SOI> shall have an Availability of greater than or equal to 95%.", "The <SOI> shall have a Mean Time Between Failures (MTBF) of xx operating hours."]
};

const notMeasurable2: IRequirementExample = {
    unacceptable: "The <SOI> shall not contain mercury.",
    improved: ["The <SOI> shall limit metallic mercury exposure to those coming in contact with the <SOI> to less than or equal 0.025 mg/m3 over a period of 8 hours"]
};

function logAIResponseVsSuggested(initial: string, aiResponse: string, suggested: string[]) {
   console.log(`\nInitial: ${initial}`);
   console.log(`AI Response: ${aiResponse}`);
   console.log(`Suggested: ${suggested.join(", ")}`);
}

async function getRevisedRequirement(requirement: string, suggested: string[]) : Promise<string> {

   let wordCount : number = requirement.length * 5;

   const improvedRequirement = await evaluateRequirement({ specification: requirement, sessionId: SESSION_ID });

   //logAIResponseVsSuggested(requirement, improvedRequirement.proposedNewRequirement, suggested);

   return improvedRequirement.proposedNewSpecification || '';
}

describe('Requirements Evaluation Tests', () => {

   const TEST_TIMEOUT = 60000; // 60 seconds as we have a large prompt with all the requirements
   
   it('should improve General Rules / no active voice', async () => {

      const response = await getRevisedRequirement(noActiveVoice.unacceptable, noActiveVoice.improved);
      // Checks if response contains "shall" or "must" followed by confirmation/verification terms,
      // indicating proper active voice construction
      expect(response).toMatch(/(shall|must) (be confirmed by|confirm|be verified by|verify|validate|prevent|record|determine)/);

   });

   it('should improve General Rules / no definition reference', async () => {

      const response = await getRevisedRequirement(noDefinitionReference.unacceptable, noDefinitionReference.improved);
      // Checks if response contains "as defined in" or "as defined by" or "in accordance with"
      // indicating proper definition construction
      expect(response).toMatch(/(as defined in|as defined by|defined in|defined by|in accordance with|adhering to|according to|specified by|specified in|listed in|shall adhere to|shall conform to|conform to)/);

   });

   it('should improve General Rules / spelling', async () => {

      const response = await getRevisedRequirement(incorrectSpelling.unacceptable, incorrectSpelling.improved);

      expect(response).toMatch(/(ordnance)/);

   });   

   it('should improve General Rules / no definition', async () => {

      const response = await getRevisedRequirement(noDefinition.unacceptable, noDefinition.improved);
      // Checks if response contains "as defined in" or "as defined by" or "in accordance with" etc
      // indicating proper definition construction
      expect(response).toMatch(/(defined in|defined by|in accordance with|adhering to|according to|specified by|specified in|listed in|time display shall|shall adhere to|format|current time in|current time of day|coordinated universal time|UTC|resolution|update)/);

   });   

   it('should improve General Rules / no definition 2', async () => {

      const response = await getRevisedRequirement(noDefinition2.unacceptable, noDefinition2.improved);
      // Checks if response contains "as defined in" or "as defined by" or "in accordance with"
      // indicating proper definition construction
      expect(response).toMatch(/(defined in|defined by|in accordance with|adhering to|according to|specified by|specified in|listed in|selected from)/);

   });     

   it('should improve General Rules / no units', async () => {

      const response = await getRevisedRequirement(noUnits.unacceptable, noUnits.improved);
      // Checks if response contains "Celsius" or "Farenheit" or "Kelvin"
      // indicating proper unit construction
      expect(response).toMatch(/(Celsius|Farenheit|Kelvin|°C|deg C|degrees C)/);

   });  

   it('should improve General Rules / no active voice and no definitions', async () => {

      const response = await getRevisedRequirement(noActiveVoiceAndNoDefinitionsEither.unacceptable, noActiveVoiceAndNoDefinitionsEither.improved);
      // Checks if response contains either:
      // 1. The word "shall" or "must" appearing twice in any order with any text between them
      // 2. The exact phrases "shall categorize" or "shall assess"
      expect(response).toMatch(/(?:shall|must)[\s\S]*?(?:shall|must)|(shall categorize|shall assess|shall classify|shall verify|shall adhere to)/s);    

   });

   it('should improve General Rules / two Requirements', async () => {

      const response = await getRevisedRequirement(twoRequirements.unacceptable, twoRequirements.improved);

      // Checks if response contains "shall" or "must" at least twice
      // indicating requirement has been split into two separate requirements
      expect(response).toMatch(/(?:shall|must)[\s\S]*?(?:shall|must)/s);

      });

   it('should improve General Rules / unclear definitions', async () => {

      const response = await getRevisedRequirement(unclearDefinitions.unacceptable, unclearDefinitions.improved);

      // Checks if response contains either:
      // 1. The word "shall" or "must" appearing twice in any order with any text between them
      // 2. The phrases "defined in" and variants 
      expect(response).toMatch(/(?:shall|must)[\s\S]*?(?:shall|must)|(defined in|defined by|defined as)/s);       

      });

   it('should improve General Rules / not measurable', async () => {

      const response = await getRevisedRequirement(notMeasurable.unacceptable, notMeasurable.improved);

      expect(response).toMatch(/(%|≥|<=|>=|less than|more than|greater than|at least|at most|not exceeding|not below|confirmed by|verified by|verified through|verified via|specified|measured over|operating period)/);

   });

   it('should improve General Rules / not measurable 2', async () => {

      const response = await getRevisedRequirement(notMeasurable2.unacceptable, notMeasurable2.improved);

      expect(response).toMatch(/(mg|ppm|PPM|%|less than|more than|greater than|at least|at most|not exceeding|not below|confirmed by|verified by|verified through|verified via|shall verify|specified)/);

   });

});
