
import { ProblemType } from './types';

export const PROBLEM_TYPES: ProblemType[] = ['Business', 'Product', 'Strategic', 'Personal'];

export const INITIAL_SUGGESTIONS: Record<ProblemType, string[]> = {
  Business: ['Revenue vs. Cost', 'Internal vs. External', 'Acquisition vs. Retention'],
  Product: ['Usage vs. Retention', 'User Needs vs. Technical Feasibility', 'New Users vs. Existing Users'],
  Strategic: ['Strengths vs. Weaknesses', 'Market Trends vs. Operational Capabilities', 'Short-term Growth vs. Long-term Stability'],
  Personal: ['Physical Health vs. Mental Wellbeing', 'Career Goals vs. Work-Life Balance', 'Immediate Rewards vs. Future Value'],
};

export const MECE_GUIDELINES = [
  "Mutually Exclusive: Ensure branches don't overlap in scope.",
  "Collectively Exhaustive: Together, the branches must cover the entire parent issue.",
  "Same Level of Abstraction: Try to keep sibling nodes at a similar depth of reasoning.",
  "Depth vs. Breadth: Aim for 2-5 branches per level for clarity."
];
