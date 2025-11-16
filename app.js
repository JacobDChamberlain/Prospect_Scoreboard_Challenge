#!/usr/bin/env node

const { leaderboard, nudge } = require('./lib/commands');


function showHelp() {
  console.log('Prospect Scoreboard Console');
  console.log('');
  console.log('Usage:');
  console.log('  node app.js leaderboard --limit <number>');
  console.log('  node app.js nudge <id>');
  console.log('');
  console.log('Commands:');
  console.log('  leaderboard    Display top prospects ranked by score');
  console.log('  nudge          Update a prospect\'s last touch and increment quarterly touches');
  console.log('');
  console.log('Examples:');
  console.log('  node app.js leaderboard --limit 3');
  console.log('  node app.js nudge 5');
}

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

main();