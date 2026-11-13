"use client";

import { useState } from "react";
import { createMeeting } from "@/lib/client-store";

export default function CaptureForm({
  onCreated,
}: {
  onCreated: (count: number) => void;
}) {
  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [source, setSource] = useState("manual");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState<null | number>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setDone(null);
    setLoading(true);
    try {
      const data = createMeeting(title, notes, source);
      setDone(data.extractedCount);
      setNotes("");
      setTitle("");
      onCreated(data.extractedCount);
    } catch {
      setError("Could not save this meeting in your browser.");
    } finally {
      setLoading(false);
    }
  }

  const sample = `We decided to launch the pricing change next quarter because it aligns with our customer survey. Owner is Maya. Deadline is Friday. We also agreed to sunset the legacy API by end of week, owned by Theo, so we can reduce maintenance cost.`;

  return (
    <form
      onSubmit={submit}
      className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xl shadow-slate-200/50 sm:p-7"
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-fuchsia-400 opacity-75" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-fuchsia-500" />
          </span>
          <h2 className="text-lg font-semibold text-slate-900">Capture a meeting</h2>
        </div>
        <p className="text-sm text-slate-500">
          Paste any meeting notes, transcript, or chat thread. Threadline&rsquo;s AI extracts every decision, owner, deadline, and reason — automatically.
        </p>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Meeting title <span className="font-normal normal-case text-slate-400">(optional)</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Design Review — March 4"
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
          />
        </div>
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Source
          </label>
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 focus:border-fuchsia-500 focus:outline-none"
          >
            <option value="manual">Meeting notes</option>
            <option value="transcript">Transcript</option>
            <option value="chat">Chat thread</option>
          </select>
        </div>
      </div>

      <div className="mt-4">
        <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Meeting text
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={6}
          placeholder="Paste the raw text here…"
          className="mt-1.5 w-full resize-y rounded-xl border border-slate-300 bg-slate-50 px-3.5 py-3 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-fuchsia-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-fuchsia-200"
        />
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={() => setNotes(sample)}
          className="text-left text-xs font-medium text-fuchsia-600 underline-offset-2 hover:underline"
        >
          Load sample meeting
        </button>
        <div className="flex items-center gap-3">
          {error && <p className="text-sm text-rose-600">{error}</p>}
          {done !== null && (
            <p className="text-sm font-medium text-emerald-600">
              {done === 0
                ? "No decisions detected — try more detail."
                : `Captured ${done} decision${done === 1 ? "" : "s"}.`}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !notes.trim()}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-violet-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-fuchsia-500/30 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                Extracting…
              </>
            ) : (
              <>✨ Extract decisions</>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
