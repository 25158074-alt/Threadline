"use client";

import { useEffect, useMemo, useState } from "react";
import type { Decision, Meeting } from "@/lib/types";
import DecisionCard from "./DecisionCard";
import { computeStatus } from "@/lib/status";
import { deleteMeeting, listGroups } from "@/lib/client-store";

type MeetingWithDecisions = {
  meeting: Meeting;
  decisions: Decision[];
};

export default function ThreadBoard() {
  const [data, setData] = useState<MeetingWithDecisions[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "open" | "overdue" | "resolved">("all");

  function load() {
    setData(listGroups());
    setLoading(false);
  }

  useEffect(() => {
    const timer = window.setTimeout(load, 0);
    return () => window.clearTimeout(timer);
  }, []);

  function handleUpdate(updated: Decision) {
    setData((prev) =>
      prev.map((g) => ({
        ...g,
        decisions: g.decisions.map((d) => (d.id === updated.id ? updated : d)),
      }))
    );
  }

  const counts = useMemo(() => {
    let open = 0,
      overdue = 0,
      resolved = 0;
    for (const g of data)
      for (const d of g.decisions) {
        const st = computeStatus(d.deadlineDate ? new Date(d.deadlineDate) : null, d.status);
        if (st === "resolved") resolved++;
        else if (st === "overdue") overdue++;
        else open++;
      }
    return { open, overdue, resolved, total: open + overdue + resolved };
  }, [data]);

  const filtered = useMemo(() => {
    return data
      .map((g) => {
        const decs = g.decisions.filter((d) => {
          const st = computeStatus(
            d.deadlineDate ? new Date(d.deadlineDate) : null,
            d.status
          );
          if (filter === "all") return true;
          if (filter === "open") return st === "pending";
          if (filter === "overdue") return st === "overdue";
          if (filter === "resolved") return st === "resolved";
          return true;
        });
        return { ...g, decisions: decs };
      })
      .filter((g) => g.decisions.length > 0);
  }, [data, filter]);

  const tabs = [
    { key: "all" as const, label: "All", value: counts.total },
    { key: "open" as const, label: "Pending", value: counts.open },
    { key: "overdue" as const, label: "Overdue", value: counts.overdue },
    { key: "resolved" as const, label: "Resolved", value: counts.resolved },
  ];

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Decision thread</h2>
          <p className="text-sm text-slate-500">
            Every decision on a living, color-coded timeline.
          </p>
        </div>
        <div className="flex gap-1 rounded-xl border border-slate-200 bg-white p-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setFilter(t.key)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                filter === t.key
                  ? "bg-slate-900 text-white shadow"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {t.label}
              <span className={filter === t.key ? "ml-1.5 text-slate-300" : "ml-1.5 text-slate-400"}>
                {t.value}
              </span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-44 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white py-14 text-center">
          <p className="text-3xl">🧵</p>
          <p className="mt-3 text-slate-500">
            No decisions here yet. Capture a meeting above to start your thread.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-6">
          {filtered.map((g) => (
            <div key={g.meeting.id}>
              <div className="mb-3 flex items-center gap-3">
                <button
                  onClick={() => {
                    deleteMeeting(g.meeting.id);
                    load();
                  }}
                  title="Delete meeting"
                  className="text-slate-300 transition hover:text-rose-500"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
                  </svg>
                </button>
                <span className="h-2 w-2 rounded-full bg-fuchsia-400" />
                <h3 className="text-sm font-semibold text-slate-800">{g.meeting.title}</h3>
                <span className="ml-auto rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-500">
                  {new Date(g.meeting.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </div>
              <div className="grid gap-3 pl-3 sm:grid-cols-2 lg:grid-cols-3 lg:pl-4">
                {g.decisions.map((d) => (
                  <DecisionCard key={d.id} decision={d} onUpdate={handleUpdate} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
