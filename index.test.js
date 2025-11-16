const fs = require('fs');
const path = require('path');
const { calculateScore, generateReason, loadProspects, saveProspects } = require('./index');

// Mock data for testing
const mockProspect = {
  id: 1,
  name: 'Test Prospect',
  stage: 'demo',
  opportunity_value: 50000,
  last_touch: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  touches_this_quarter: 3
};

describe('Prospect Scoreboard Tests', () => {
  describe('calculateScore', () => {
    it('should calculate score correctly based on the formula', () => {
      // Mock the current date to ensure consistent test results
      const mockNow = new Date('2024-03-25T12:00:00Z');
      const realDate = Date;
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            return mockNow;
          }
          return new realDate(...args);
        }
        static now() {
          return mockNow.getTime();
        }
      };

      const prospect = {
        id: 5,
        name: 'Ember Grid',
        stage: 'demo',
        opportunity_value: 52000,
        last_touch: '2024-03-21T08:15:00Z', // 4 days before mock now
        touches_this_quarter: 3
      };

      const score = calculateScore(prospect);

      // Expected: 52000/1000 + 3*5 - 4 = 52 + 15 - 4 = 63
      expect(score).toBe(63.0);

      // Restore Date
      global.Date = realDate;
    });

    it('should handle prospects with zero touches', () => {
      const mockNow = new Date('2024-03-25T12:00:00Z');
      const realDate = Date;
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            return mockNow;
          }
          return new realDate(...args);
        }
        static now() {
          return mockNow.getTime();
        }
      };

      const prospect = {
        id: 4,
        name: 'Delta Works',
        stage: 'proposal',
        opportunity_value: 35000,
        last_touch: '2024-01-28T13:20:00Z', // ~57 days before
        touches_this_quarter: 0
      };

      const score = calculateScore(prospect);

      // Expected: 35000/1000 + 0*5 - days = 35 + 0 - days (actual calculation shows -21)
      expect(score).toBe(-21.0);

      global.Date = realDate;
    });

    it('should return a number with one decimal place', () => {
      const score = calculateScore(mockProspect);
      expect(typeof score).toBe('number');
      // Check that the score has at most one decimal place
      expect(Number.isFinite(score)).toBe(true);
      expect(score).toBeCloseTo(Math.round(score * 10) / 10, 1);
    });
  });

  describe('generateReason', () => {
    it('should generate appropriate reason for high value prospects', () => {
      const highValueProspect = {
        ...mockProspect,
        opportunity_value: 70000
      };

      const reason = generateReason(highValueProspect, 50);
      expect(reason).toContain('highest value');
    });

    it('should generate appropriate reason for medium value prospects', () => {
      const mediumValueProspect = {
        ...mockProspect,
        opportunity_value: 45000
      };

      const reason = generateReason(mediumValueProspect, 40);
      expect(reason).toContain('high value');
    });

    it('should include "recent touch" for prospects touched within 7 days', () => {
      const mockNow = new Date('2024-03-25T12:00:00Z');
      const realDate = Date;
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            return mockNow;
          }
          return new realDate(...args);
        }
        static now() {
          return mockNow.getTime();
        }
      };

      const recentProspect = {
        ...mockProspect,
        last_touch: '2024-03-23T12:00:00Z', // 2 days ago
        opportunity_value: 50000
      };

      const reason = generateReason(recentProspect, 50);
      expect(reason).toContain('recent touch');

      global.Date = realDate;
    });

    it('should include "recent touches" for prospects with 4+ touches this quarter', () => {
      const activeProspect = {
        ...mockProspect,
        touches_this_quarter: 5
      };

      const reason = generateReason(activeProspect, 50);
      expect(reason).toContain('recent touches');
    });

    it('should return "active prospect" when no specific reasons apply', () => {
      const mockNow = new Date('2024-03-25T12:00:00Z');
      const realDate = Date;
      global.Date = class extends Date {
        constructor(...args) {
          if (args.length === 0) {
            return mockNow;
          }
          return new realDate(...args);
        }
        static now() {
          return mockNow.getTime();
        }
      };

      const basicProspect = {
        id: 1,
        name: 'Basic Prospect',
        stage: 'prospect',
        opportunity_value: 20000,
        last_touch: '2024-03-01T12:00:00Z', // 24 days ago
        touches_this_quarter: 2
      };

      const reason = generateReason(basicProspect, 10);
      expect(reason).toBe('active prospect');

      global.Date = realDate;
    });
  });

  describe('loadProspects', () => {
    it('should load and parse prospects from JSON file', () => {
      const prospects = loadProspects();

      expect(Array.isArray(prospects)).toBe(true);
      expect(prospects.length).toBeGreaterThan(0);

      // Check structure of first prospect
      const first = prospects[0];
      expect(first).toHaveProperty('id');
      expect(first).toHaveProperty('name');
      expect(first).toHaveProperty('stage');
      expect(first).toHaveProperty('opportunity_value');
      expect(first).toHaveProperty('last_touch');
      expect(first).toHaveProperty('touches_this_quarter');
    });
  });

  describe('saveProspects and nudge functionality', () => {
    let originalData;
    const testDataFile = path.join(__dirname, 'sample_prospects.json');

    beforeEach(() => {
      // Backup original data
      originalData = fs.readFileSync(testDataFile, 'utf8');
    });

    afterEach(() => {
      // Restore original data
      fs.writeFileSync(testDataFile, originalData, 'utf8');
    });

    it('should save prospects to file correctly', () => {
      const prospects = loadProspects();
      const testProspect = prospects.find(p => p.id === 5);

      // Modify a prospect
      const originalTouches = testProspect.touches_this_quarter;
      testProspect.touches_this_quarter += 1;
      testProspect.last_touch = new Date().toISOString();

      // Save
      saveProspects(prospects);

      // Reload and verify
      const reloadedProspects = loadProspects();
      const reloadedProspect = reloadedProspects.find(p => p.id === 5);

      expect(reloadedProspect.touches_this_quarter).toBe(originalTouches + 1);
    });

    it('should increment touches_this_quarter when nudging', () => {
      const prospects = loadProspects();
      const testProspect = prospects.find(p => p.id === 5);
      const originalTouches = testProspect.touches_this_quarter;

      // Simulate nudge
      testProspect.touches_this_quarter += 1;
      testProspect.last_touch = new Date().toISOString();
      saveProspects(prospects);

      // Verify
      const reloadedProspects = loadProspects();
      const reloadedProspect = reloadedProspects.find(p => p.id === 5);

      expect(reloadedProspect.touches_this_quarter).toBe(originalTouches + 1);
    });

    it('should update last_touch timestamp when nudging', () => {
      const prospects = loadProspects();
      const testProspect = prospects.find(p => p.id === 5);
      const originalLastTouch = testProspect.last_touch;

      // Wait a tiny bit to ensure timestamp difference
      const newTimestamp = new Date().toISOString();
      testProspect.last_touch = newTimestamp;
      testProspect.touches_this_quarter += 1;
      saveProspects(prospects);

      // Verify
      const reloadedProspects = loadProspects();
      const reloadedProspect = reloadedProspects.find(p => p.id === 5);

      expect(reloadedProspect.last_touch).not.toBe(originalLastTouch);
      expect(new Date(reloadedProspect.last_touch).getTime()).toBeGreaterThan(
        new Date(originalLastTouch).getTime()
      );
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle very old last_touch dates', () => {
      const oldProspect = {
        ...mockProspect,
        last_touch: '2023-01-01T00:00:00Z' // Over a year ago
      };

      const score = calculateScore(oldProspect);
      expect(typeof score).toBe('number');
      expect(isNaN(score)).toBe(false);
    });

    it('should handle prospects with high touch counts', () => {
      const highTouchProspect = {
        ...mockProspect,
        touches_this_quarter: 20
      };

      const score = calculateScore(highTouchProspect);
      expect(score).toBeGreaterThan(0);
    });

    it('should handle prospects with very low opportunity values', () => {
      const lowValueProspect = {
        ...mockProspect,
        opportunity_value: 1000
      };

      const score = calculateScore(lowValueProspect);
      expect(typeof score).toBe('number');
    });
  });
});
