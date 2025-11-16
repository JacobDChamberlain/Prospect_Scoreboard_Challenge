/**
 * Calculate the promise score for a prospect
 * Formula: score = opportunity_value / 1000 + touches_this_quarter * 5 - days_since_last_touch
 */
function calculateScore(prospect) {
  const now = new Date();
  const lastTouch = new Date(prospect.last_touch);
  const daysSinceLastTouch = Math.floor((now - lastTouch) / (1000 * 60 * 60 * 24));

  const score =
    prospect.opportunity_value / 1000 +
    prospect.touches_this_quarter * 5 -
    daysSinceLastTouch;

  return parseFloat(score.toFixed(1));
}

/**
 * Generate a reason string based on prospect attributes
 */
function generateReason(prospect, score) {
  const reasons = [];

  if (prospect.opportunity_value >= 60000) {
    reasons.push('highest value');
  } else if (prospect.opportunity_value >= 40000) {
    reasons.push('high value');
  }

  const now = new Date();
  const lastTouch = new Date(prospect.last_touch);
  const daysSinceLastTouch = Math.floor((now - lastTouch) / (1000 * 60 * 60 * 24));

  if (daysSinceLastTouch <= 7) {
    reasons.push('recent touch');
  }

  if (prospect.touches_this_quarter >= 4) {
    reasons.push('recent touches');
  }

  return reasons.length > 0 ? reasons.join(' + ') : 'active prospect';
}

module.exports = {
  calculateScore,
  generateReason
};
