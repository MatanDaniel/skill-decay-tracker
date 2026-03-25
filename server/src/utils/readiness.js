// API functions for skill, notes, and progress history
// Utility function:
// Restrict a number into a range.
// Example:
// clamp(120, 0, 100) -> 100
// clamp(-5, 0, 100) -> 0
function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

// Utility function:
// Calculate how many whole days passed since a given datetime.
// If date is missing/invalid, return a very large number so the formula
// treats the skill as stale / long-unpracticed.
function getDaysSince(dateValue) {
  if (!dateValue) return 9999;

  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return 9999;

  const diffMs = Date.now() - d.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

// Score from number of practice sessions.
// Cap at 40 so practice cannot grow forever.
function getPracticeScore(practiceSessionsCount) {
  return Math.min(practiceSessionsCount * 5, 40);
}

// Score from number of solved questions.
// Right now this is ready for use,
// but if your DB does not yet track solved questions properly,
// you can pass 0 for now.
function getQuestionsScore(questionsSolvedCount) {
  return Math.min(questionsSolvedCount * 3, 35);
}

// Score from notes count.
// Notes matter, but less than real practice/questions.
function getNotesScore(notesCount) {
  return Math.min(notesCount * 2, 10);
}

// Extra bonus for very recent practice.
// This rewards “freshness”.
function getRecencyBonus(daysSinceLastPractice) {
  if (daysSinceLastPractice <= 1) return 15;
  if (daysSinceLastPractice <= 3) return 10;
  if (daysSinceLastPractice <= 7) return 5;
  return 0;
}

// Penalty for long inactivity.
// This is different from recency bonus:
// it actively hurts old / neglected skills.
function getDecayPenalty(daysSinceLastPractice) {
  if (daysSinceLastPractice <= 3) return 0;
  if (daysSinceLastPractice <= 7) return 5;
  if (daysSinceLastPractice <= 14) return 10;
  if (daysSinceLastPractice <= 30) return 18;
  return 25;
}

// Main formula builder.
// It returns BOTH:
// 1. final readiness_score
// 2. full breakdown of how the score was built
//
// This is very useful for Reports.jsx later,
// because you can show the user exactly WHY the score is what it is.
function buildReadinessBreakdown({
  practiceSessionsCount,
  questionsSolvedCount,
  notesCount,
  lastPracticedAt,
}) {
  const daysSinceLastPractice = getDaysSince(lastPracticedAt);

  const practiceScore = getPracticeScore(practiceSessionsCount);
  const questionsScore = getQuestionsScore(questionsSolvedCount);
  const notesScore = getNotesScore(notesCount);
  const recencyBonus = getRecencyBonus(daysSinceLastPractice);
  const decayPenalty = getDecayPenalty(daysSinceLastPractice);

  const rawScore =
    practiceScore +
    questionsScore +
    notesScore +
    recencyBonus -
    decayPenalty;

  const readinessScore = clamp(rawScore, 0, 100);

  return {
    readinessScore,
    breakdown: {
      practice_sessions_count: practiceSessionsCount,
      questions_solved_count: questionsSolvedCount,
      notes_count: notesCount,
      days_since_last_practice: daysSinceLastPractice,
      practice_score: practiceScore,
      questions_score: questionsScore,
      notes_score: notesScore,
      recency_bonus: recencyBonus,
      decay_penalty: decayPenalty,
      raw_score: rawScore,
    },
  };
}

module.exports = {
  buildReadinessBreakdown,
};