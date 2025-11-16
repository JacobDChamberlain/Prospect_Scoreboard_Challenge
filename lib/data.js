const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', 'data', 'sample_prospects.json');

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

module.exports = {
  loadProspects,
  saveProspects
};
