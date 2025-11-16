# Prospect Scoreboard Console

A command-line application for tracking and ranking sales prospects based on opportunity value, engagement frequency, and recency of contact.

## Features

- **Leaderboard Command**: Displays top prospects ranked by a calculated "promise score"
- **Nudge Command**: Updates a prospect's last touch timestamp and increments their quarterly touch count
- **Input Validation**: Comprehensive error handling for invalid inputs
- **Automated Tests**: 15 test cases covering core functionality and edge cases
- **Data Persistence**: Updates are saved to the JSON file for persistence across sessions

## Prerequisites

- **Node.js**: Version 18.14.0 or higher (tested with Node 22.2.0)
  - The application requires Node 18+ due to Jest testing framework requirements
  - Check your version: `node --version`
  - If using nvm: `nvm use 22.2.0` or `nvm install 22.2.0`

## Installation

1. Clone or download this repository
2. Navigate to the project directory:
   ```bash
   cd Prospect_Scoreboard_Challenge
   ```
3. Install dependencies:
   ```bash
   npm install
   ```

## Usage

### Leaderboard Command

Display the top N prospects ranked by score:

```bash
node app.js leaderboard --limit <number>
```

**Example:**
```bash
node app.js leaderboard --limit 3
```

**Output:**
```
Rank  Name                    Stage          Score  Reason
----  ----------------------  -------------  -----  -------------------------
1     Ember Grid              demo           72.0   high value + recent touch + recent touches
2     Cider Labs              contract       71.0   highest value + recent touches
3     Grove Capital           negotiation    64.0   high value + recent touch
```

### Nudge Command

Update a prospect's last touch and increment their quarterly touches:

```bash
node app.js nudge <id>
```

**Example:**
```bash
node app.js nudge 5
```

**Output:**
```
Nudged Ember Grid at 2024-03-25T16:10:00Z
Updated record:
{
  "id": 5,
  "name": "Ember Grid",
  "stage": "demo",
  "opportunity_value": 52000,
  "last_touch": "2024-03-25T16:10:00Z",
  "touches_this_quarter": 4,
  "score": 72.0,
  "message": "Noted follow-up at 2024-03-25T16:10:00Z"
}
```

### Help Command

Display usage information:

```bash
node app.js --help
```

## Running Tests

Execute the automated test suite:

```bash
npm test
```

**Expected output:**
```
Test Suites: 1 passed, 1 total
Tests:       15 passed, 15 total
```

The test suite includes:
- Scoring calculation tests
- Reason generation tests
- Data loading and saving tests
- Nudge functionality tests
- Edge case and validation tests

## Scoring Algorithm

The "promise score" is calculated using the following formula:

```
score = (opportunity_value / 1000) + (touches_this_quarter × 5) - days_since_last_touch
```

**Factors:**
- **Opportunity Value**: Higher dollar amounts increase the score
- **Touches This Quarter**: Each touch adds 5 points to the score
- **Days Since Last Touch**: More recent touches result in higher scores

## Data Persistence

The application uses `data/sample_prospects.json` as its data store. The `nudge` command modifies this file directly, persisting changes across sessions. The original sample data includes 10 prospects.

**Resetting Data**: The nudge command will mutate the JSON file. To restore the original sample data:
- Copy `data/sample_prospects_original.json` to `data/sample_prospects.json`

## Project Structure

```
Prospect_Scoreboard_Challenge/
├── data/
│   ├── sample_prospects.json             # Active data file (10 prospect records)
│   └── sample_prospects_original.json    # Backup of original data
├── lib/
│   ├── scoring.js                        # Scoring calculation and reason generation
│   ├── data.js                           # Data loading and persistence
│   └── commands.js                       # Leaderboard and nudge command logic
├── tests/
│   └── lib.test.js                       # Test suite for lib modules
├── app.js                                # Main CLI entry point
├── package.json                          # Node.js dependencies and scripts
├── README.md                             # This file
└── Prospect_Scoreboard_Challenge.md      # Original requirements
```

## Error Handling

The application includes comprehensive error handling:

- **Missing Parameters**: Clear error messages when required parameters are omitted
- **Invalid Input**: Validates that IDs and limits are numeric
- **Non-existent Prospects**: Reports when a prospect ID is not found
- **File Access Errors**: Handles JSON file read/write errors gracefully

## Implementation Details

**Technology Choices:**
- **Runtime**: Node.js (I'm most familiar with Node)
- **Testing**: Jest (industry-standard testing framework - also, most familiar with Jest)
- **Persistence**: Direct JSON file mutation (simple, no database needed)
- **CLI Parsing**: Native `process.argv` (lightweight, no external dependencies)

**Trade-offs:**
- JSON file mutation provides simple persistence without database overhead
- File-based storage is suitable for small datasets (10 prospects)
- For larger datasets or concurrent access, a database would be recommended

## Development Notes

- Tests use Date mocking to ensure consistent, predictable results
- The application restores original data in test cleanup (afterEach hooks)
- Input validation prevents common errors and provides helpful feedback

## Questions
- What range should sores be within? (ex: 0-100?)
- Clarify 'recent touch' (ex: within 1 week?)
- Clarify 'recent touches' (ex: 4+ this quarter?)
- Do we need to handle quarterly logic? How will the app know we're in a given quarter? Original data was all for 2024, so initial scores are all coming back negative.
- When viewing leaderboard, do we want only one reason, or all potential reasons? How do we rank reasons?