"use client";

import { useState } from "react";
import CaptureForm from "./CaptureForm";
import Recall from "./Recall";
import ThreadBoard from "./ThreadBoard";

export default function Dashboard() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <main className="mx-auto max-w-7xl px-4 pb-24 pt-8 sm:px-6 lg:px-8">
      <div id="capture" className="grid scroll-mt-24 gap-6 lg:grid-cols-2">
        <CaptureForm
          onCreated={() => setRefreshKey((k) => k + 1)}
        />
        <Recall />
      </div>

      <section id="thread" className="mt-10 scroll-mt-24">
        <ThreadBoard key={refreshKey} />
      </section>
    </main>
  );
}
