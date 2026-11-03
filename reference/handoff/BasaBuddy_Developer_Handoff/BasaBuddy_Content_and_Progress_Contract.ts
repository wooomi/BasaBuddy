// BasaBuddy educational domain types — illustrative starter contract, not release-ready lesson data.
export type Language = 'fil' | 'en';
export type Role = 'student' | 'guardian' | 'teacher';
export type LevelStatus = 'locked' | 'unlocked' | 'in_progress' | 'completed';
export type ActivityType =
  | 'listen_select' | 'phoneme_match' | 'syllable_build' | 'word_read'
  | 'picture_match' | 'reorder' | 'listen_repeat' | 'read_aloud'
  | 'find_word' | 'sentence_build' | 'story_read' | 'story_quiz';

export interface AnswerChoice {
  id: string;
  text?: string;
  imageAssetId?: string;
  accessibilityLabel: string;
}
export interface AssessmentItem {
  id: string;
  skillTags: string[];
  type: ActivityType;
  prompt: string;
  choices?: AnswerChoice[];
  correctAnswer: string | string[];
  rationale: string;
  hint: string;
  modelAudioId?: string;
  contentStatus: 'draft' | 'reviewed';
}
export interface LessonContent {
  id: string;
  language: Language;
  levelId: `L${string}`;
  version: number;
  title: string;
  practiceItemIds: string[];
  assessmentItemIds: string[]; // at least 5 reviewed items for a release lesson
  skillTags: string[];
  contentStatus: 'draft' | 'reviewed';
}
export interface ProgressRecord {
  studentId: string;
  language: Language;
  levelId: string;
  status: LevelStatus;
  lastActivityIndex: number;
  bestAssessmentCorrect: number | null;
  masteredAt: string | null;
  revision: number;
  updatedAt: string;
}

export type AnswerResult = {
  isCorrect: boolean;
  explanation: string;
  skillTags: string[];
};

export function gradeAnswer(item: AssessmentItem, submitted: string | string[]): AnswerResult {
  const normalize = (s: string) => s.trim().normalize('NFC');
  const actual = Array.isArray(submitted) ? submitted.map(normalize) : normalize(submitted);
  const expected = Array.isArray(item.correctAnswer)
    ? item.correctAnswer.map(normalize) : normalize(item.correctAnswer);
  return {isCorrect: JSON.stringify(actual) === JSON.stringify(expected), explanation: item.rationale, skillTags: item.skillTags};
}

export function mastered(correctCount: number, total: number, threshold = 0.8): boolean {
  if (!Number.isInteger(total) || total < 5 || !Number.isInteger(correctCount) || correctCount < 0 || correctCount > total) {
    throw new Error('Invalid assessment counts');
  }
  return correctCount / total >= threshold;
}

export function canUnlockLevel(previous: ProgressRecord | null, isFirstLevel: boolean, authorizedOverride = false): boolean {
  return isFirstLevel || authorizedOverride || previous?.status === 'completed';
}

// Production notes:
// - Never check pronunciation automatically without a validated audio model.
// - Audio practice is non-scored by default.
// - Store progress separately by studentId + language + levelId.
// - Use a persistent database transaction for completing a level and unlocking the next.
// - A lower-scoring retry must never downgrade an already completed level.
// - Validate all lesson data at load time; do not publish draft curriculum examples.
