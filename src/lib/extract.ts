// Threadline "Claude-grade" decision extraction engine.
//
// Simulates a Claude call: takes raw meeting text and returns structured
// decisions with { decision, owner, deadline, date, reasoning }.

export type ExtractedDecision = {
  decision: string;
  owner: string;
  deadline: string;
  deadlineDate: Date | null;
  reasoning: string;
};

export type ExtractionResult = {
  summary: string | null;
  decisions: ExtractedDecision[];
};

const DECISION_STARTERS = [
  /^\s*(?:the\s+)?(?:we\s+)?(?:decision|action)\s*[:,-]\s*/i,
  /^\s*we\s+(?:have\s+)?(?:decided|agreed|committed|are going to|will|plan to)/i,
  /^\s*we\s+also\s+(?:decided|agreed)/i,
  /^\s*(?:also\s+)?(?:decided|agreed)\b/i,
  /^\s*approved\b/i,
  /^\s*move\s+forward\b/i,
  /^\s*our\s*(?:final\s*)?call\b/i,
];

const OWNER_PATTERNS = [
  /owner(?:\s+is|\s*\:|\s*)\s+([A-Z][A-Za-z]+)/i,
  /(?:owner:\s*|owned by\s+|assigned to\s+)\s*([A-Z][A-Za-z]+)/i,
  /([A-Z][a-z]+)\s+(?:owns|will own|is responsible for|will handle|to own|to lead|to handle)/i,
  /by\s+([A-Z][A-Za-z]+)\s*(?:\.|,|;|$)/i,
];

const REASONING_PATTERNS = [
  /(?:because|since|given that|due to\b|as part of)\s+(.+)/i,
  /(?:rationale|reason(?:\s+is)?|why(?:\s+is)?)\s*[:]?\s*(?:that\s+)?(.+)/i,
];

// --- date resolution ---
const DAY_OFFSET: Record<string, number> = {
  sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
  thursday: 4, friday: 5, saturday: 6,
};

function todayStart(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function monthNum(name: string): number {
  const map: Record<string, number> = {
    january: 0, february: 1, march: 2, april: 3, may: 4, june: 5,
    july: 6, august: 7, september: 8, october: 9, november: 10, december: 11,
  };
  return map[name.toLowerCase()];
}

export function resolveDeadline(raw: string): { text: string; date: Date | null } {
  let text = raw.trim().replace(/[.,;]+$/, "").trim();
  if (!text) return { text: "", date: null };
  const lower = text.toLowerCase();

  // Rebalance "end of week" -> use week-end always relative to today
  const now = todayStart();

  if (/^end\s+of\s+(?:the\s+)?day|cob|close\s+of\s+business|^eod/.test(lower)) return { text, date: now };
  if (lower.startsWith("today")) return { text, date: now };
  if (lower.startsWith("tomorrow")) {
    const d = new Date(now); d.setDate(d.getDate() + 1); return { text, date: d };
  }
  if (/end\s+of\s+(?:the\s+)?week|^eow/.test(lower)) {
    const d = new Date(now); d.setDate(d.getDate() + ((7 - d.getDay()) % 7 || 7)); return { text, date: d };
  }
  if (/end\s+of\s+(?:the\s+)?month/.test(lower)) {
    return { text, date: new Date(now.getFullYear(), now.getMonth() + 1, 0) };
  }
  if (/end\s+of\s+next\s+month|first\s+of\s+next\s+month/.test(lower)) {
    return { text, date: new Date(now.getFullYear(), now.getMonth() + 2, 0) };
  }
  if (lower.startsWith("next week")) {
    const d = new Date(now); d.setDate(d.getDate() + 7); return { text, date: d };
  }
  if (lower.startsWith("next month")) {
    return { text, date: new Date(now.getFullYear(), now.getMonth() + 1, 1) };
  }

  const day = lower.match(/(monday|tuesday|wednesday|thursday|friday|saturday|sunday)/);
  if (day) {
    const d = new Date(now);
    let diff = DAY_OFFSET[day[1]] - d.getDay();
    if (diff <= 0) diff += 7;
    d.setDate(d.getDate() + diff);
    return { text, date: d };
  }

  const nm = lower.match(
    /(january|february|march|april|may|june|july|august|september|october|november|december)(?:\s+\d{1,2}(?:st|nd|rd|th)?)?(?:\s*,?\s*(\d{4}))?/
  );
  if (nm) {
    const month = monthNum(nm[1]);
    const dayMatch = nm[0].match(/\d{1,2}(?:st|nd|rd|th)?/);
    const dayNum = dayMatch ? parseInt(dayMatch[0]) : 1;
    let year = nm[2] ? parseInt(nm[2]) : now.getFullYear();
    const d = new Date(year, month, dayNum);
    if (d.getTime() < now.getTime()) { d.setFullYear(d.getFullYear() + 1); }
    return { text, date: d };
  }

  const q = lower.match(/q([1-4])/);
  if (q) {
    const quarterMonth = (parseInt(q[1]) - 1) * 3;
    let year = now.getFullYear();
    const end = new Date(year, quarterMonth + 2, 1);
    if (end.getTime() < now.getTime()) year += 1;
    return { text, date: new Date(year, quarterMonth + 2, 1) };
  }

  const iso = text.match(/(\d{4})-(\d{2})-(\d{2})/);
  if (iso) return { text, date: new Date(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) };

  const mdy = text.match(/(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?/);
  if (mdy) {
    let year = mdy[3] ? Number(mdy[3].length === 2 ? "20" + mdy[3] : mdy[3]) : now.getFullYear();
    return { text, date: new Date(year, Number(mdy[1]) - 1, Number(mdy[2])) };
  }

  return { text, date: null };
}

// A set of known deadline expressions to recognize.
const DEADLINE_EXPR =
  /(?:end\s+of\s+(?:the\s+)?(?:week|day|month)|end\s+of\s+next\s+month|EOW|EOD|COB|next\s+week|next\s+month|today|tomorrow|q[1-4]|(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s*\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?|\d{1,2}\/\d{1,2}(?:\/\d{2,4})?|\d{4}-\d{2}-\d{2})/i;

// Gather all deadline mentions in a block and pick the most concrete one.
function findDeadline(block: string): { text: string; date: Date | null } {
  const prefixed2 = block.match(
    /(?:deadline(?:\s+is|\s*:)?|due\s+by|due\s+on|by\s+(?:the\s+)?)\s+([^.\n,;]+)/i
  );

  if (prefixed2 && prefixed2[1]) {
    // Capture up to the deadline expression within that phrase.
    const sub = prefixed2[1].trim();
    const dm = sub.match(DEADLINE_EXPR);
    const token = dm ? dm[0] : sub.split(/\s+/).slice(0, 3).join(" ");
    const r = resolveDeadline(token);
    return r;
  }

  // Fall back to scanning the whole block for any deadline expression.
  const any = block.match(DEADLINE_EXPR);
  if (any) {
    const r = resolveDeadline(any[0]);
    if (r.date || /week|month|q[1-4]/i.test(any[0])) return r;
  }

  return { text: "", date: null };
}

export function extractDecisions(raw: string): ExtractionResult {
  const normalized = raw.replace(/\r/g, " ").replace(/[ \t]+/g, " ");

  let summary: string | null = null;
  const sm = normalized.match(/(?:summary:|^\s*summary\s+)\s*(.+?)(?=\.|$)/m);
  if (sm) summary = sm[1].trim();

  // Split into sentence-ish units, keeping phrase boundaries.
  // We want decision groups: a decision sentence + following context sentences.
  const sentences = normalized
    .split(/(?<=[.!?])\s+(?=[A-Z])|(?<=:)\s+(?=[A-Z])|(?<=;)\s+(?=[A-Z])/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const decisions: ExtractedDecision[] = [];
  let i = 0;
  while (i < sentences.length) {
    const sentence = sentences[i];
    if (!DECISION_STARTERS.some((re) => re.test(sentence))) {
      i++;
      continue;
    }

    // Cluster: this decision sentence + following non-decision sentences
    // that carry context (owner, deadline, reasoning).
    const cluster = [sentence];
    let j = i + 1;
    let taken = 0;
    while (j < sentences.length && taken < 4) {
      const nxt = sentences[j];
      if (DECISION_STARTERS.some((re) => re.test(nxt))) break;
      cluster.push(nxt);
      j++;
      taken++;
    }

    const block = cluster.join(" ");

    // Decision core = first sentence, cleaned.
    let decisionText = sentence
      .replace(/^\s*(?:the\s+)?(?:we\s+)?(?:also\s+)?(?:decision|action)\s*[:,-]\s*/i, "")
      .replace(/^\s*we\s+(?:have\s+)?(?:decided|agreed|committed|are going to|will|plan to)\s+/i, "")
      .replace(/^\s*(?:we\s+)?(?:also\s+)?(?:decided|agreed)\s+/i, "")
      .replace(/^\s*(?:approved|move\s+forward|our\s*(?:final\s*)?call)\s*/i, "")
      .trim();

    // Strip reasoning if it leaked into the first sentence; otherwise
    // look for a "because / rationale" phrase in the cluster context.
    let reasoning = "";
    for (const re of REASONING_PATTERNS) {
      const m = block.match(re);
      if (m && m[1]) {
        let cap = m[1].trim();
        // Stop at the start of a new sentence (". <Capital>")
        const nextSent = cap.match(/^(.*?)[.!?]\s+[A-Z]/);
        if (nextSent) cap = nextSent[1];
        // Remove trailing "Owner .../Deadline ..." attribution clauses
        cap = cap.replace(/\s*(?:owner(?:\s+is|\s*:)?\s*[A-Z][A-Za-z]+|deadline(?:\s+is|\s*:)?\s*[^.]*)$/i, "");
        // Drop a leading "is that" / "is"
        cap = cap.replace(/^(?:is\s+that\s+|is\s+|that\s+|the\s+reason(?:ing)?\s+is\s+)/i, "");
        reasoning = cap.replace(/[.;]+$/, "").trim();
        break;
      }
    }
    if (reasoning) {
      decisionText = sentence
        .split(/\b(?:because|since|given that|due to|as part of)\b/i)[0]
        .replace(/^\s*(?:the\s+)?(?:we\s+)?(?:also\s+)?(?:decision|action)\s*[:,-]\s*/i, "")
        .replace(/^\s*we\s+(?:have\s+)?(?:decided|agreed|committed|are going to|will|plan to)\s+/i, "")
        .replace(/^\s*(?:we\s+)?(?:also\s+)?(?:decided|agreed)\s+/i, "")
        .trim();
    }
    decisionText = decisionText.replace(/\s+/g, " ").replace(/[.,;:\s]+$/, "");
    // A decision shouldn't start with "to "
    decisionText = decisionText.replace(/^to\s+/i, "").replace(/^our\s+/i, "");

    // Owner from whole cluster
    let owner = "";
    for (const re of OWNER_PATTERNS) {
      const m = block.match(re);
      if (m && m[1]) { owner = m[1].replace(/[.,;:]/g, "").trim(); break; }
    }

    // If no owner in cluster, search the entire text for a name.
    const fullOwner = normalized.match(
      /owner(?:\s+is|\s*:)?\s*([A-Z][A-Za-z]+)|([A-Z][a-z]+)\s+(?:owns|will own|is responsible for)\s+it/i
    );
    if (!owner && fullOwner && fullOwner[1]) owner = fullOwner[1];

    // Deadline from whole cluster
    const deadline = findDeadline(block);

    decisions.push({
      decision: decisionText || sentence,
      owner: owner || "Unassigned",
      deadline: deadline.text || "—",
      deadlineDate: deadline.date,
      reasoning: reasoning || "Not stated in notes",
    });

    i = j; // continue after cluster
  }

  return { summary, decisions };
}
