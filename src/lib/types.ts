export type Decision = {
  id: number;
  meetingId: number;
  decision: string;
  owner: string;
  deadline: string;
  deadlineDate: string | null;
  reasoning: string;
  status: "pending" | "overdue" | "resolved";
  createdAt: string;
};

export type Meeting = {
  id: number;
  title: string;
  rawNote: string;
  source: string;
  createdAt: string;
  decisionCount: number;
  doneCount: number;
};
