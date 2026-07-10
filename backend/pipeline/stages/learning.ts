/**
 * Quick Challenge / learning stage — re-exports session-based implementation.
 */
export {
  abandonActiveChallengeSession,
  createQuickCheck,
  createQuickCheckSession,
  evaluateQuickCheck,
  evaluateQuickCheckSessionAnswer,
  getChallengeSession,
  getMasteryState,
  shouldOfferQuickCheck,
} from './quick-check-session.js';

export { buildQuickCheckQuestions } from './quick-check-questions.js';
