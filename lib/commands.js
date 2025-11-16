const { calculateScore, generateReason } = require('./scoring');
const { loadProspects, saveProspects } = require('./data');

/**
 * Leaderboard command - display top prospects by score
 */
function leaderboard(limit) {
  // Validate limit
  if (limit === undefined || limit === null) {
    console.error('Error: --limit parameter is required');
    console.log('Usage: node app.js leaderboard --limit <number>');
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
    console.log('Usage: node app.js nudge <id>');
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

  // Update prospect with quarterly logic
  const now = new Date();
  const lastTouch = new Date(prospect.last_touch);

  // Check if we're in the same quarter
  const sameQuarter =
    now.getFullYear() === lastTouch.getFullYear() &&
    Math.floor(now.getMonth() / 3) === Math.floor(lastTouch.getMonth() / 3);

  const nowISO = now.toISOString();
  prospect.last_touch = nowISO;
  prospect.touches_this_quarter = sameQuarter
    ? prospect.touches_this_quarter + 1  // Same quarter: increment
    : 1;                                  // New quarter: reset to 1

  // Save updated data
  saveProspects(prospects);

  // Calculate new score
  const score = calculateScore(prospect);

  // Display result
  console.log(`Nudged ${prospect.name} at ${nowISO}`);
  console.log('Updated record:');
  console.log(JSON.stringify({
    ...prospect,
    score,
    message: `Noted follow-up at ${nowISO}`
  }, null, 2));
}

module.exports = {
  leaderboard,
  nudge
};
