export interface FeedbackCategory {
  score: number;
  comments: string[];
}

export interface AIFeedback {
  overallAssessment: string;
  clarity: FeedbackCategory;
  viability: FeedbackCategory;
  appeal: FeedbackCategory;
}
