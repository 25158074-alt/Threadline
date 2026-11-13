"use client";

import { useState } from "react";
import type { Decision } from "@/lib/types";
import { formatDate, daysUntil, STATUS_META, computeStatus } from "@/lib/status";
import { updateDecision } from "@/lib/client-store";

export default function DecisionCard({
  decision: initial,
  onUpdate,
  meetingTitle,
}: {
  decision: Decision;
  onUpdate: (d: Decision) => void;
  meetingTitle?: string;
}) {
  const [decision, setDecision] = useState(initial);
  const [updating, setUpdating] = useState(false);

  const st = computeStatus(
    decision.deadlineDate ? new Date(decision.deadlineDate) : null,
    decision.status
  );
  const meta = STATUS_META[st];
  const dUntil = daysUntil(decision.deadlineDate ? new Date(decision.deadlineDate) : null);
  const dDate = decision.deadlineDate ? new Date(decision.deadlineDate) : null;

  function patch(body: Partial<Decision>) {
    setUpdating(true);
    const updated = updateDecision(decision.id, body);
    if (updated) {
      setDecision(updated);
      onUpdate(updated);
    }
    setUpdating(false);
  }

  function toggleResolved() {
    patch({
      status: decision.status === "resolved" ? "pending" : "resolved",
    });
  }

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md sm:p-5 ${meta.ring} border-l-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="text-[15px] font-semibold leading-snug text-slate-900">
          {decision.decision}
        </p>
        <button
          onClick={toggleResolved}
          disabled={updating}
          title={decision.status === "resolved" ? "Mark as pending" : "Mark as resolved"}
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${meta.badge}`}
        >
          {meta.label}
          <span className={`ml-1.5 inline-block h-1.5 w-1.5 rounded-full ${meta.dot}`} />
        </button>
      </div>

      {meetingTitle && (
        <p className="mt-1 text-xs text-slate-400">{meetingTitle}</p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-slate-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="text-slate-400">Owner</span>
          <span className="font-medium text-slate-800">{decision.owner || "Unassigned"}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="text-slate-400">Due</span>
          {dDate ? (
            <span className="font-medium text-slate-800">
              {decision.deadline || formatDate(dDate)}
              {dUntil !== null && dUntil >= 0 && st !== "resolved" && (
                <span className="ml-1 text-xs text-slate-400">
                  ({dUntil === 0 ? "today" : `${dUntil}d`})
                </span>
              )}
              {dUntil !== null && dUntil < 0 && st !== "resolved" && (
                <span className="ml-1 text-xs text-rose-500">
                  ({Math.abs(dUntil)}d overdue)
                </span>
              )}
            </span>
          ) : (
            <span className="font-medium text-slate-800">{decision.deadline || "—"}</span>
          )}
        </span>
      </div>

      {decision.reasoning && decision.reasoning !== "Not stated in notes" && (
        <div className="mt-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Reasoning
          </p>
          <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
            {decision.reasoning}
          </p>
        </div>
      )}
    </div>
  );
}
