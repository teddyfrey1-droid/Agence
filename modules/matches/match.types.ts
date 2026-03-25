export type MatchBreakdown = {
  hardMatchPassed: boolean;
  score: number;
  budgetScore: number;
  locationScore: number;
  areaScore: number;
  extractionScore: number;
  activityScore: number;
  urgencyScore: number;
  positiveReasons: string[];
  blockingReasons: string[];
  mismatchNotes?: string;
};
