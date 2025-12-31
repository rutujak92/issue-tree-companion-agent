
export type ProblemType = 'Business' | 'Product' | 'Strategic' | 'Personal';

export interface IssueNode {
  id: string;
  text: string;
  parentId: string | null;
  children: string[];
  isExpanded: boolean;
  notes?: string;
  level: number;
}

export interface TreeData {
  rootId: string;
  nodes: Record<string, IssueNode>;
  problemStatement: string;
  problemType: ProblemType;
  successCriteria: string;
  scope: string;
}

export interface MeceFeedback {
  id: string;
  type: 'overlap' | 'gap' | 'imbalance' | 'info';
  message: string;
  nodeId?: string;
}

export interface Suggestion {
  text: string;
  description: string;
}
