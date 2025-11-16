#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'sample_prospects.json');

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

/**
 * Load prospects from JSON file
 */
function loadProspects() {
  try {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error loading prospects: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Save prospects to JSON file
 */
function saveProspects(prospects) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(prospects, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error saving prospects: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Leaderboard command - display top prospects by score
 */
function leaderboard(limit) {
  // Validate limit
  if (limit === undefined || limit === null) {
    console.error('Error: --limit parameter is required');
    console.log('Usage: node index.js leaderboard --limit <number>');
    process.exit(1);
  }

  const limitNum = parseInt(limit, 10);

  if (isNaN(limitNum) || limitNum <= 0) {
    console.error('Error: --limit must be a positive number');
    process.exit(1);
  }

  const prospects = loadProspects();

  // Calculate scores and sort
  const scoredProspects = prospects.map(p => ({
    ...p,
    score: calculateScore(p),
    reason: null
  }));

  scoredProspects.sort((a, b) => b.score - a.score);

  // Add reasons after sorting
  scoredProspects.forEach(p => {
    p.reason = generateReason(p, p.score);
  });

  // Get top N
  const top = scoredProspects.slice(0, limitNum);

  // Display results
  console.log('Rank  Name                    Stage          Score  Reason');
  console.log('----  ----------------------  -------------  -----  -------------------------');

  top.forEach((p, index) => {
    const rank = String(index + 1).padEnd(4);
    const name = p.name.padEnd(22);
    const stage = p.stage.padEnd(13);
    const score = String(p.score).padEnd(5);
    console.log(`${rank}  ${name}  ${stage}  ${score}  ${p.reason}`);
  });
}

/**
 * Nudge command - update last_touch and increment touches_this_quarter
 */
function nudge(id) {
  // Validate id
  if (id === undefined || id === null) {
    console.error('Error: prospect ID is required');
    console.log('Usage: node index.js nudge <id>');
    process.exit(1);
  }

  const prospectId = parseInt(id, 10);

  if (isNaN(prospectId)) {
    console.error('Error: ID must be a number');
    process.exit(1);
  }

  const prospects = loadProspects();
  const prospect = prospects.find(p => p.id === prospectId);

  if (!prospect) {
    console.error(`Error: No prospect found with ID ${prospectId}`);
    process.exit(1);
  }

  // Update prospect
  const now = new Date().toISOString();
  prospect.last_touch = now;
  prospect.touches_this_quarter += 1;

  // Save updated data
  saveProspects(prospects);

  // Calculate new score
  const score = calculateScore(prospect);

  // Display result
  console.log(`Nudged ${prospect.name} at ${now}`);
  console.log('Updated record:');
  console.log(JSON.stringify({
    ...prospect,
    score,
    message: `Noted follow-up at ${now}`
  }, null, 2));
}

/**
 * Display help message
 */
function showHelp() {
  console.log('Prospect Scoreboard Console');
  console.log('');
  console.log('Usage:');
  console.log('  node index.js leaderboard --limit <number>');
  console.log('  node index.js nudge <id>');
  console.log('');
  console.log('Commands:');
  console.log('  leaderboard    Display top prospects ranked by score');
  console.log('  nudge          Update a prospect\'s last touch and increment quarterly touches');
  console.log('');
  console.log('Examples:');
  console.log('  node index.js leaderboard --limit 3');
  console.log('  node index.js nudge 5');
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    showHelp();
    process.exit(0);
  }

  const command = args[0];

  switch (command) {
    case 'leaderboard': {
      const limitIndex = args.indexOf('--limit');
      if (limitIndex === -1) {
        leaderboard(null);
      } else {
        const limit = args[limitIndex + 1];
        leaderboard(limit);
      }
      break;
    }

    case 'nudge': {
      const id = args[1];
      nudge(id);
      break;
    }

    case 'help':
    case '--help':
    case '-h':
      showHelp();
      break;

    default:
      console.error(`Error: Unknown command '${command}'`);
      console.log('');
      showHelp();
      process.exit(1);
  }
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    calculateScore,
    generateReason,
    loadProspects,
    saveProspects,
    leaderboard,
    nudge
  };
}

// Run if executed directly
if (require.main === module) {
  main();
}
