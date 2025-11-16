# Prospect Scoreboard Console Challenge

You are building a tiny console program for the Opportunity Tracker team. The ops crew wants a quick way to see which prospects look most promising and to log a manual “nudge” when someone follows up. Use **any language, framework, or runtime you’re comfortable with** (Python, Node, Go, Perl, etc.), but document how to run and test your solution from a clean checkout.

## Data Set

We provide a JSON file at `docs/sample_prospects.json` containing 10 fictional prospect snapshots. Each record provides:

- `id` (integer)
- `name` (string)
- `stage` (string such as demo, proposal, contract)
- `opportunity_value` (USD integer)
- `last_touch` (ISO 8601 timestamp)
- `touches_this_quarter` (integer count)

Feel free to reorder the data or convert it into another format at runtime, but keep the schema intact. The scoring and expected outputs below assume the data exactly as shipped in this file.

## Feature Requirements

1. **Leaderboard command (read-only)**
   - Provide a command such as `leaderboard --limit 3` (CLI flags/arguments are up to you).
   - Calculate a “promise score” that ranks prospects. One simple heuristic:  
     `score = opportunity_value / 1000 + touches_this_quarter * 5 - days_since_last_touch`.
   - Print the top `limit` prospects sorted by `score` descending.
   - Include the score and a short reason string (e.g., “high value + recent touch”).

2. **Nudge command (state update)**
   - Provide a command such as `nudge 5` or `nudge --id 5`.
   - Update the in-memory or on-disk record to set `last_touch` to “now” and increment `touches_this_quarter`.
   - Print the updated record plus the recalculated score.

3. **Persistence expectations**
   - You don’t need a real database. It’s fine to mutate a JSON/CSV file, keep everything in memory for the process lifetime, or use a lightweight store; explain the trade-off you chose.

4. **Tests**
   - Provide AT LEAST one automated test that covers the leaderboard scoring or the nudge update behavior. Any test framework is acceptable.

5. **Documentation**
   - Supply commands to install dependencies, run the console app, and execute tests.
   - Clarify environment prerequisites (e.g., “Node 18+”, “Python 3.11”).

## Expected Outputs

Use the sample data file so your outputs match (timestamps may differ for “now”).

### Leaderboard Example

Command:

```bash
$ app leaderboard --limit 3
```

Sample console output (scores assume “today” = 2024-03-25):

```
Rank  Name           Stage        Score  Reason
1     Cider Labs     contract     77.0   highest value + recent touches
2     Grove Capital  negotiation  71.0   high value + recent touch
3     Ember Grid     demo         64.0   high value + recent touch
```

### Nudge Example

Command:

```bash
$ app nudge 5
```

Sample console output:

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

## What We’re Evaluating

- **Code clarity & structure:** Is the project easy to follow and idiomatic for the chosen language?
- **Correctness:** Do the commands behave as specified and respect the scoring rule?
- **Tests:** Are there automated checks for core logic or edge cases?
- **Documentation:** Can we run the app and tests in a few commands?
- **Pragmatic decisions:** Did you handle input validation, error paths, and mutable data sensibly given the time box?

Have fun, lean on whatever stack you know best, and keep the total effort near 60–90 minutes.
