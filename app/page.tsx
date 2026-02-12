"use client";

import { useState } from "react";

type ActionItem = {
  id: number;
  description: string;
};

export default function Home() {
  const [notes, setNotes] = useState("");
  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [nextId, setNextId] = useState(1000); // Start high to avoid conflicts with extracted items

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

        // Accept lines starting with "- " or "* " (with space) OR
        // lines starting with "-" or "*" followed by any character (more flexible)
        const looksLikeBullet =
          line.startsWith("- ") ||
          line.startsWith("* ") ||
          (line.startsWith("-") && line.length > 1) ||
          (line.startsWith("*") && line.length > 1);
        const containsTodo = line.toLowerCase().includes("todo");

        if (!looksLikeBullet && !containsTodo) {
          return null;
        }

        // Remove leading bullet marker if present for a cleaner description.
        // Handles both "- " and "-" (with or without space)
        const cleaned = line.replace(/^[-*]\s*/, "");

        return {
          id: nextId + index,
          description: cleaned,
        } satisfies ActionItem;
      })
      .filter((item): item is ActionItem => item !== null);

    setActionItems(items);
    // Update nextId to be higher than any extracted item
    if (items.length > 0) {
      const maxId = Math.max(...items.map((item) => item.id));
      setNextId(maxId + 1);
    }
  };

  const addActionItem = () => {
    const newItem: ActionItem = {
      id: nextId,
      description: "",
    };
    setActionItems([...actionItems, newItem]);
    setNextId(nextId + 1);
    // Start editing the new item immediately
    setEditingId(newItem.id);
    setEditingValue("");
  };

  const startEditing = (id: number, currentValue: string) => {
    setEditingId(id);
    setEditingValue(currentValue);
  };

  const saveEdit = (id: number) => {
    setActionItems(
      actionItems.map((item) =>
        item.id === id ? { ...item, description: editingValue } : item
      )
    );
    setEditingId(null);
    setEditingValue("");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingValue("");
  };

  const deleteActionItem = (id: number) => {
    setActionItems(actionItems.filter((item) => item.id !== id));
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
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-zinc-700">Action items</h2>
            <button
              type="button"
              onClick={addActionItem}
              className="inline-flex items-center rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100"
            >
              + Add Action Item
            </button>
          </div>
          {actionItems.length === 0 ? (
            <p className="text-sm text-zinc-500">
              After you extract, your action items will appear here. Or click
              "Add Action Item" to create one manually.
            </p>
          ) : (
            <div className="border border-zinc-200 rounded-md bg-white overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="text-left text-xs font-medium text-zinc-700 px-3 py-2">
                      Description
                    </th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {actionItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-zinc-100 last:border-b-0 hover:bg-zinc-50"
                    >
                      <td className="px-3 py-2">
                        {editingId === item.id ? (
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            onBlur={() => saveEdit(item.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                saveEdit(item.id);
                              } else if (e.key === "Escape") {
                                cancelEdit();
                              }
                            }}
                            autoFocus
                            className="w-full text-sm text-zinc-800 px-2 py-1 border border-zinc-300 rounded focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-zinc-900"
                          />
                        ) : (
                          <div
                            onClick={() => startEditing(item.id, item.description)}
                            className="text-sm text-zinc-800 cursor-text hover:bg-zinc-100 px-2 py-1 rounded -mx-2 -my-1 min-h-[1.5rem] flex items-center"
                          >
                            {item.description || (
                              <span className="text-zinc-400 italic">
                                Click to edit
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => deleteActionItem(item.id)}
                          className="text-zinc-400 hover:text-zinc-600 text-xs"
                          title="Delete"
                        >
                          ×
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
