"use client";

import { useState } from "react";

type ActionItem = {
  id: number;
  description: string;
};

export default function Home() {
  const [notes, setNotes] = useState("");
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);

  // Very simple rule: treat any non-empty line that
  // - starts with "-" or "*" OR
  // - contains the word "TODO"
  // as an action item.
  const extractActionItems = () => {
    const lines = notes.split("\n");

    const items: ActionItem[] = lines
      .map((rawLine, index) => {
        const line = rawLine.trim();
        if (!line) return null;

        const looksLikeBullet =
          line.startsWith("- ") || line.startsWith("* ");
        const containsTodo = line.toLowerCase().includes("todo");

        if (!looksLikeBullet && !containsTodo) {
          return null;
        }

        // Remove leading bullet marker if present for a cleaner description.
        const cleaned = line.replace(/^[-*]\s+/, "");

        return {
          id: index,
          description: cleaned,
        } satisfies ActionItem;
      })
      .filter((item): item is ActionItem => item !== null);

    setActionItems(items);
  };

  const downloadCsv = () => {
    if (actionItems.length === 0) {
      return;
    }

    // Very small CSV: just one column, "Description".
    const header = "Description";
    const rows = actionItems.map((item) => {
      // Escape double quotes by doubling them.
      const escaped = item.description.replace(/"/g, '""');
      return `"${escaped}"`;
    });

    const csvContent = [header, ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "action-items.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 flex justify-center px-4 py-10">
      <main className="w-full max-w-4xl space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold">
            Notes → Action Items (MVP)
          </h1>
          <p className="text-sm text-zinc-600">
            Paste your meeting notes, click{" "}
            <span className="font-medium">Extract Action Items</span>, then
            download them as a CSV.
          </p>
        </header>

        <section className="space-y-2">
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-zinc-700"
          >
            Meeting notes
          </label>
          <textarea
            id="notes"
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder={`Example:
- Follow up with Alex about budget
- Schedule design review (TODO)
Some regular text that will be ignored.`}
            className="w-full h-56 p-3 border border-zinc-300 rounded-md text-sm font-mono resize-vertical focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900 bg-white"
          />
          <div className="flex flex-wrap gap-3 mt-2">
            <button
              type="button"
              onClick={extractActionItems}
              className="inline-flex items-center rounded-md bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800"
            >
              Extract Action Items
            </button>
            <button
              type="button"
              onClick={downloadCsv}
              disabled={actionItems.length === 0}
              className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download CSV
            </button>
            <span className="text-xs text-zinc-500 self-center">
              {actionItems.length === 0
                ? "No action items yet."
                : `${actionItems.length} action item${
                    actionItems.length === 1 ? "" : "s"
                  } found.`}
            </span>
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="text-sm font-medium text-zinc-700">Action items</h2>
          {actionItems.length === 0 ? (
            <p className="text-sm text-zinc-500">
              After you extract, your action items will appear here.
            </p>
          ) : (
            <ul className="space-y-1 border border-zinc-200 rounded-md bg-white p-3">
              {actionItems.map((item) => (
                <li
                  key={item.id}
                  className="text-sm text-zinc-800 flex items-start gap-2"
                >
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-zinc-400" />
                  <span>{item.description}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
