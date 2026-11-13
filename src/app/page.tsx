import Dashboard from "@/components/Dashboard";

const STEPS = [
  {
    icon: "📥",
    title: "Capture",
    desc: "Paste any meeting notes, transcript, or chat thread. AI finds every concrete decision automatically — no manual logging.",
  },
  {
    icon: "🧵",
    title: "Track",
    desc: "Each decision becomes a card on a visual thread timeline, color-coded pending, overdue, or resolved.",
  },
  {
    icon: "🔎",
    title: "Recall",
    desc: "Ask “why did we decide X?” and get a grounded answer pulled straight from your actual tracked decisions.",
  },
];

export default function HomePage() {
  return (
    <>
      <section className="relative py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            {STEPS.map((s) => (
              <div
                key={s.title}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <span className="text-2xl">{s.icon}</span>
                <h3 className="mt-2 font-semibold text-slate-900">{s.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-slate-600">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Dashboard />
    </>
  );
}
