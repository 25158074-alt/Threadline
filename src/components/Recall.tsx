"use client";

import { useState } from "react";
import type { Decision } from "@/lib/types";
import { recall } from "@/lib/client-store";

type RecallResult = Decision & {
  meetingTitle: string;
  currentStatus: string;
};

const SUGGESTIONS = [
  "Why are we renewing the CRM?",
  "Who owns the design system migration?",
  "What did we decide about the analytics SDK?",
];

export default function Recall() {
  const [question, setQuestion] = useState("");
  const [results, setResults] = useState<RecallResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [asked, setAsked] = useState(false);
  const [error, setError] = useState("");

  function ask(q: string) {
    const query = q.trim();
    if (!query) return;
    setLoading(true);
    setError("");
    setAsked(true);
    try {
      setResults(recall(query));
    } catch {
      setError("Could not search your local decision record.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="recall" className="scroll-mt-24 rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7">
      <div className="flex items-center gap-2">
        <span className="text-lg">🔎</span>
        <h2 className="text-lg font-semibold text-slate-900">Recall a decision</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Ask <em>why did we decide X?</em> in plain language. Threadline answers from the
        actual tracked decisions — your institutional memory, searchable.
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder='e.g. "Why did we delay the mobile relaunch?"'
          className="w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-200"
        />
        <button
          type="submit"
          disabled={loading || !question.trim()}
          className="shrink-0 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Searching…" : "Ask"}
        </button>
      </form>

      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => {
              setQuestion(s);
              ask(s);
            }}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition hover:border-violet-300 hover:text-violet-700"
          >
            {s}
          </button>
        ))}
      </div>

      {asked && !loading && (
        <div className="mt-5">
          {error ? (
            <p className="text-sm text-rose-600">{error}</p>
          ) : results.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-5 text-center">
              <p className="text-sm text-slate-500">
                No tracked decision matches that question yet. Try capturing the meeting
                that made it first.
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {results.length} grounded result{results.length === 1 ? "" : "s"}
              </p>
              {results.map((r) => (
                <div
                  key={r.id}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-800">{r.decision}</p>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${
                        r.currentStatus === "resolved"
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : r.currentStatus === "overdue"
                            ? "bg-rose-50 text-rose-700 ring-rose-200"
                            : "bg-amber-50 text-amber-700 ring-amber-200"
                      }`}
                    >
                      {r.currentStatus}
                    </span>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">{r.reasoning}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                    <span>
                      Owner: <span className="font-medium text-slate-700">{r.owner}</span>
                    </span>
                    <span>
                      Due: <span className="font-medium text-slate-700">{r.deadline}</span>
                    </span>
                    <span>From: {r.meetingTitle}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
