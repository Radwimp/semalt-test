const PASS_THRESHOLD = 0.9;
const RATINGS = {
  PASS: { label: 'pass', minScore: PASS_THRESHOLD },
  AVERAGE: { label: 'average', minScore: 0.5 },
  FAIL: { label: 'fail' },
  ERROR: { label: 'error' },
};

function showAsPassed(audit) {
  switch (audit.scoreDisplayMode) {
    case 'manual':
    case 'notApplicable':
      return true;
    case 'error':
    case 'informative':
      return false;
    case 'numeric':
    case 'binary':
    default:
      return Number(audit.score) >= RATINGS.PASS.minScore;
  }
}

function getWastedMs(audit) {
  if (audit.result && audit.result.details && audit.result.details.type === 'opportunity') {
    const details = audit.result.details;
    if (typeof details.overallSavingsMs !== 'number') {
      throw new Error('non-opportunity details passed to _getWastedMs');
    }
    return details.overallSavingsMs;
  }

  return Number.MIN_VALUE;
}

export {
  showAsPassed,
  getWastedMs,
};
