import { extractDecisions } from "@/lib/extract";
import type { Decision, Meeting } from "@/lib/types";

const STORAGE_KEY = "threadline-data-v1";

type Store = { meetings: Meeting[]; decisions: Decision[]; nextMeetingId: number; nextDecisionId: number };

const demoNotes = "We decided to renew the CRM because it keeps customer history in one place. Owner is Maya. Deadline is next month. We agreed to publish the accessibility checklist because it reduces launch risk. Theo will own it. Deadline is Friday.";

function demoStore(): Store {
  const createdAt = new Date().toISOString();
  const meeting: Meeting = { id: 1, title: "Q2 planning — sample", rawNote: demoNotes, source: "manual", createdAt, decisionCount: 2, doneCount: 0 };
  const decisions = extractDecisions(demoNotes).decisions.map((d, index) => ({
    ...d,
    id: index + 1,
    meetingId: meeting.id,
    deadlineDate: d.deadlineDate?.toISOString() ?? null,
    status: "pending" as const,
    createdAt,
  }));
  return { meetings: [meeting], decisions, nextMeetingId: 2, nextDecisionId: decisions.length + 1 };
}

function read(): Store {
  if (typeof window === "undefined") return demoStore();
  const saved = window.localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    const seeded = demoStore();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }
  try { return JSON.parse(saved) as Store; } catch { return demoStore(); }
}

function write(store: Store) { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }

export function listGroups() {
  const store = read();
  return store.meetings.map((meeting) => ({ meeting, decisions: store.decisions.filter((d) => d.meetingId === meeting.id) }));
}

export function createMeeting(title: string, rawNote: string, source: string) {
  const store = read();
  const createdAt = new Date().toISOString();
  const meetingId = store.nextMeetingId++;
  const extracted = extractDecisions(rawNote).decisions;
  const meeting: Meeting = { id: meetingId, title: title.trim() || `Meeting — ${new Date().toLocaleDateString()}`, rawNote, source, createdAt, decisionCount: extracted.length, doneCount: 0 };
  const decisions: Decision[] = extracted.map((d) => ({ ...d, id: store.nextDecisionId++, meetingId, deadlineDate: d.deadlineDate?.toISOString() ?? null, status: "pending", createdAt }));
  store.meetings.unshift(meeting); store.decisions.unshift(...decisions); write(store);
  return { extractedCount: decisions.length };
}

export function updateDecision(id: number, patch: Partial<Decision>) {
  const store = read();
  const index = store.decisions.findIndex((d) => d.id === id);
  if (index < 0) return null;
  store.decisions[index] = { ...store.decisions[index], ...patch };
  write(store); return store.decisions[index];
}

export function deleteMeeting(id: number) {
  const store = read();
  store.meetings = store.meetings.filter((m) => m.id !== id);
  store.decisions = store.decisions.filter((d) => d.meetingId !== id);
  write(store);
}

export function recall(question: string) {
  const terms = question.toLowerCase().split(/[^a-z0-9]+/).filter((term) => term.length > 2);
  const store = read();
  return store.decisions.map((decision) => {
    const haystack = `${decision.decision} ${decision.reasoning} ${decision.owner}`.toLowerCase();
    const score = terms.reduce((total, term) => total + (haystack.includes(term) ? 1 : 0), 0);
    const meeting = store.meetings.find((m) => m.id === decision.meetingId);
    return { ...decision, meetingTitle: meeting?.title ?? "Unknown meeting", currentStatus: decision.status, score };
  }).filter((result) => result.score > 0).sort((a, b) => b.score - a.score).slice(0, 5);
}
