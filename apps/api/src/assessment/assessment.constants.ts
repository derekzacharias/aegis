export const ASSESSMENT_STATUS_VALUES = ['draft', 'in-progress', 'complete'] as const;
export type AssessmentStatusValue = (typeof ASSESSMENT_STATUS_VALUES)[number];

export const CONTROL_STATUS_VALUES = [
  'unassessed',
  'satisfied',
  'partial',
  'unsatisfied',
  'not-applicable'
] as const;

export type ControlStatusValue = (typeof CONTROL_STATUS_VALUES)[number];

export const TASK_STATUS_VALUES = ['open', 'in-progress', 'blocked', 'complete'] as const;
export type TaskStatusValue = (typeof TASK_STATUS_VALUES)[number];

export const TASK_PRIORITY_VALUES = ['low', 'medium', 'high', 'critical'] as const;
export type TaskPriorityValue = (typeof TASK_PRIORITY_VALUES)[number];
