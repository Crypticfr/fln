/**
 * conceptMasteryCalculator.ts
 *
 * Deterministic concept-mastery calculation.
 *
 * This module is intentionally independent of:
 * - Gemini / AI
 * - Express routes
 * - Database operations
 *
 * Gemini is responsible for evaluating individual question correctness.
 * This module converts those results into a standardized mastery level
 * for each concept/topic.
 */

import { answersMatch } from './answerMatching';
import { Question } from './db';

export type ConceptMastery =
  | 'Strong'
  | 'Satisfactory'
  | 'Needs Practice';

export interface ConceptQuestionResult {
  topic: string;
  isCorrect: boolean;
}

/**
 * Calculate mastery for a single concept.
 *
 * Mastery thresholds:
 * - 95%–100%  -> Strong
 * - 60%–<95%  -> Satisfactory
 * - <60%      -> Needs Practice
 */
export function calculateSingleConceptMastery(
  correctQuestions: number,
  totalQuestions: number
): ConceptMastery {
  if (totalQuestions <= 0) {
    return 'Needs Practice';
  }

  const safeCorrectQuestions = Math.max(
    0,
    Math.min(correctQuestions, totalQuestions)
  );

  const score =
    (safeCorrectQuestions / totalQuestions) * 100;

  if (score >= 95) {
    return 'Strong';
  }

  if (score >= 60) {
    return 'Satisfactory';
  }

  return 'Needs Practice';
}

export function calculateConceptMastery(
  correctQuestions: number,
  totalQuestions: number
): ConceptMastery;
export function calculateConceptMastery(
  evaluatedQuestions: ConceptQuestionResult[]
): Record<string, ConceptMastery>;
export function calculateConceptMastery(
  questions: Question[],
  answers: Record<string, unknown>
): Record<string, ConceptMastery>;
export function calculateConceptMastery(
  arg1: number | ConceptQuestionResult[] | Question[],
  arg2?: number | Record<string, unknown>
): ConceptMastery | Record<string, ConceptMastery> {
  if (typeof arg1 === 'number') {
    return calculateSingleConceptMastery(arg1, typeof arg2 === 'number' ? arg2 : 0);
  }

  if (Array.isArray(arg1) && arg2 && typeof arg2 === 'object') {
    const questions = arg1 as Question[];
    const answers = arg2 as Record<string, unknown>;
    const evaluated: ConceptQuestionResult[] = questions.map(q => ({
      topic: q.topic || 'General Mathematics',
      isCorrect: answersMatch(answers[q.question_id], q.answer)
    }));
    return calculateConceptMastery(evaluated);
  }

  const evaluatedQuestions = (arg1 as ConceptQuestionResult[]) || [];
  const topicResults: Record<
    string,
    { correct: number; total: number }
  > = {};

  for (const question of evaluatedQuestions) {
    const topic = (question.topic && question.topic.trim()) || 'General Mathematics';

    if (!topicResults[topic]) {
      topicResults[topic] = {
        correct: 0,
        total: 0,
      };
    }

    topicResults[topic].total += 1;

    if (question.isCorrect) {
      topicResults[topic].correct += 1;
    }
  }

  const conceptMastery: Record<string, ConceptMastery> = {};

  for (const [topic, result] of Object.entries(topicResults)) {
    conceptMastery[topic] = calculateSingleConceptMastery(
      result.correct,
      result.total
    );
  }

  return conceptMastery;
}