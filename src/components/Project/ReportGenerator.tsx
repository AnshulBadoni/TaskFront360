"use client";
import React, { useMemo, useState } from "react";
import { getProjectTasksById } from "@/services/api/tasks";
import type { Task, User } from "@/types";

type ReportGeneratorProps = {
  projectId: string | number;
  project: any;
  users: User[];
};

const ReportGenerator = ({ projectId, project, users }: ReportGeneratorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<string>("");
  const [isReportOpen, setIsReportOpen] = useState(true);

  const filteredUsers = useMemo(() => {
    if (!search.trim()) return users;
    const q = search.toLowerCase();
    return users.filter((u) =>
      `${u.username ?? ""} ${u.email ?? ""}`.toLowerCase().includes(q)
    );
  }, [users, search]);

  const selectedUsersLabel = useMemo(() => {
    if (isAllSelected || selectedUserIds.length === 0) return "All";
    if (selectedUserIds.length === 1) {
      const u = users.find((x) => String(x.id) === selectedUserIds[0]);
      return u?.username ?? "1 user";
    }
    return `${selectedUserIds.length} users`;
  }, [isAllSelected, selectedUserIds, users]);

  const toggleAll = () => {
    setIsAllSelected(true);
    setSelectedUserIds([]);
  };

  const toggleUser = (userId: string) => {
    setIsAllSelected(false);
    setSelectedUserIds((prev) => {
      if (prev.includes(userId)) {
        return prev.filter((id) => id !== userId);
      }
      return [...prev, userId];
    });
  };

  const filterTasksForUsers = (tasks: Task[], userIds: string[]) => {
    if (isAllSelected || userIds.length === 0) return tasks;
    const set = new Set(userIds.map(String));
    return tasks.filter((task) => {
      const assignedToId = task.assignedTo?.id ? String(task.assignedTo.id) : "";
      if (set.has(assignedToId)) return true;
      if (Array.isArray(task.taskAssignments)) {
        return task.taskAssignments.some((a: any) => {
          const id = a?.userId ?? a?.user?.id;
          return id != null && set.has(String(id));
        });
      }
      return false;
    });
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);
      setReport("");

      const res = await getProjectTasksById(projectId.toString());
      const allTasks: Task[] = Array.isArray(res) ? res : res?.data || [];
      const tasksToSend = filterTasksForUsers(allTasks, selectedUserIds);
      const selectedUsers =
        isAllSelected || selectedUserIds.length === 0
          ? "ALL"
          : users.filter((u) => selectedUserIds.includes(String(u.id)));

      const reportRes = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          tasks: tasksToSend,
          selectedUsers,
        }),
      });

      if (!reportRes.ok) {
        const err = await reportRes.json().catch(() => ({}));
        throw new Error(err?.error || "Failed to generate report.");
      }

      const data = await reportRes.json();
      setReport(data?.report || "No report content returned.");
    } catch (e: any) {
      setError(e?.message || "Failed to generate report.");
    } finally {
      setLoading(false);
    }
  };

  const downloadPdf = () => {
    const now = new Date();
    const dateLabel = now.toISOString().slice(0, 10);
    const title = `Project Report - ${project?.name ?? "Project"} - ${dateLabel}`;
    const fullText = [title, "", report].join("\n");

    const blob = buildPdfBlob(fullText);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `project-report-${dateLabel}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const buildPdfBlob = (text: string) => {
    const pageWidth = 612;
    const pageHeight = 792;
    const marginLeft = 50;
    const marginTop = 50;
    const fontSize = 12;
    const lineHeight = 14;
    const maxLinesPerPage = Math.floor((pageHeight - marginTop * 2) / lineHeight);

    const lines = text.split(/\r?\n/);
    const pages: string[][] = [];
    for (let i = 0; i < lines.length; i += maxLinesPerPage) {
      pages.push(lines.slice(i, i + maxLinesPerPage));
    }

    const objects: string[] = [];
    const offsets: number[] = [];
    const pushObj = (obj: string) => {
      offsets.push(currentOffset);
      objects.push(obj);
      currentOffset += obj.length;
    };

    const escapeText = (s: string) =>
      s.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

    let currentOffset = 0;
    let output = "%PDF-1.4\n";
    currentOffset = output.length;

    // 1: Catalog
    pushObj("1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n");
    // 2: Pages
    const pageRefs = pages
      .map((_, i) => `${4 + i * 2} 0 R`)
      .join(" ");
    pushObj(
      `2 0 obj\n<< /Type /Pages /Count ${pages.length} /Kids [${pageRefs}] >>\nendobj\n`
    );
    // 3: Font
    pushObj(
      "3 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n"
    );

    pages.forEach((pageLines, i) => {
      const pageObjNum = 4 + i * 2;
      const contentObjNum = pageObjNum + 1;

      const content = [
        "BT",
        `/F1 ${fontSize} Tf`,
        `${marginLeft} ${pageHeight - marginTop} Td`,
        `${lineHeight} TL`,
        ...pageLines.map((line) => `(${escapeText(line)}) Tj T*`),
        "ET",
      ].join("\n");
      const contentObj = `${contentObjNum} 0 obj\n<< /Length ${content.length} >>\nstream\n${content}\nendstream\nendobj\n`;

      const pageObj =
        `${pageObjNum} 0 obj\n` +
        `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] ` +
        `/Resources << /Font << /F1 3 0 R >> >> /Contents ${contentObjNum} 0 R >>\n` +
        "endobj\n";

      pushObj(pageObj);
      pushObj(contentObj);
    });

    output += objects.join("");
    const xrefOffset = output.length;
    output += "xref\n";
    output += `0 ${objects.length + 1}\n`;
    output += "0000000000 65535 f \n";
    offsets.forEach((off) => {
      output += `${String(off).padStart(10, "0")} 00000 n \n`;
    });
    output += "trailer\n";
    output += `<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
    output += "startxref\n";
    output += `${xrefOffset}\n`;
    output += "%%EOF";

    return new Blob([output], { type: "application/pdf" });
  };

  const renderMarkdown = (source: string) => {
    const lines = source.replace(/\r\n/g, "\n").split("\n");
    const blocks: Array<{ type: string; content: string[] | string }> = [];
    let i = 0;

    while (i < lines.length) {
      const line = lines[i];
      if (line.trim().startsWith("```")) {
        const code: string[] = [];
        i += 1;
        while (i < lines.length && !lines[i].trim().startsWith("```")) {
          code.push(lines[i]);
          i += 1;
        }
        blocks.push({ type: "code", content: code.join("\n") });
        i += 1;
        continue;
      }

      if (/^#{1,3}\s/.test(line)) {
        const level = line.match(/^#{1,3}/)?.[0].length ?? 1;
        blocks.push({ type: `h${level}`, content: line.replace(/^#{1,3}\s*/, "") });
        i += 1;
        continue;
      }

      if (/^(\-|\*)\s+/.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^(\-|\*)\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^(\-|\*)\s+/, ""));
          i += 1;
        }
        blocks.push({ type: "ul", content: items });
        continue;
      }

      if (/^\d+\.\s+/.test(line)) {
        const items: string[] = [];
        while (i < lines.length && /^\d+\.\s+/.test(lines[i])) {
          items.push(lines[i].replace(/^\d+\.\s+/, ""));
          i += 1;
        }
        blocks.push({ type: "ol", content: items });
        continue;
      }

      if (line.trim() === "") {
        i += 1;
        continue;
      }

      const paragraph: string[] = [line];
      i += 1;
      while (i < lines.length && lines[i].trim() !== "") {
        paragraph.push(lines[i]);
        i += 1;
      }
      blocks.push({ type: "p", content: paragraph.join("\n") });
    }

    const inline = (text: string) => {
      const parts: React.ReactNode[] = [];
      let remaining = text;
      const patterns = [
        { regex: /\*\*(.+?)\*\*/, type: "strong" },
        { regex: /\*(.+?)\*/, type: "em" },
        { regex: /`(.+?)`/, type: "code" },
      ];

      while (remaining.length > 0) {
        let matchIndex = -1;
        let match: RegExpMatchArray | null = null;
        let matchType = "";

        for (const p of patterns) {
          const m = remaining.match(p.regex);
          if (m && (matchIndex === -1 || (m.index ?? 0) < matchIndex)) {
            matchIndex = m.index ?? 0;
            match = m;
            matchType = p.type;
          }
        }

        if (!match) {
          parts.push(remaining);
          break;
        }

        if (matchIndex > 0) {
          parts.push(remaining.slice(0, matchIndex));
        }

        const content = match[1];
        if (matchType === "strong") {
          parts.push(<strong key={`${matchIndex}-strong`}>{content}</strong>);
        } else if (matchType === "em") {
          parts.push(<em key={`${matchIndex}-em`}>{content}</em>);
        } else if (matchType === "code") {
          parts.push(
            <code
              key={`${matchIndex}-code`}
              className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[0.85em] text-slate-800"
            >
              {content}
            </code>
          );
        }

        remaining = remaining.slice(matchIndex + match[0].length);
      }
      return parts;
    };

    return blocks.map((block, idx) => {
      if (block.type === "code") {
        return (
          <pre
            key={`code-${idx}`}
            className="overflow-auto rounded-lg border border-slate-200 bg-slate-950/95 p-4 text-xs text-slate-100"
          >
            <code className="font-mono">{block.content as string}</code>
          </pre>
        );
      }

      if (block.type === "ul") {
        return (
          <ul key={`ul-${idx}`} className="list-disc pl-6 text-slate-700">
            {(block.content as string[]).map((item, i2) => (
              <li key={`uli-${i2}`} className="mb-1">
                {inline(item)}
              </li>
            ))}
          </ul>
        );
      }

      if (block.type === "ol") {
        return (
          <ol key={`ol-${idx}`} className="list-decimal pl-6 text-slate-700">
            {(block.content as string[]).map((item, i2) => (
              <li key={`oli-${i2}`} className="mb-1">
                {inline(item)}
              </li>
            ))}
          </ol>
        );
      }

      if (block.type === "h1") {
        return (
          <h2 key={`h1-${idx}`} className="text-2xl font-semibold text-slate-900">
            {inline(block.content as string)}
          </h2>
        );
      }
      if (block.type === "h2") {
        return (
          <h3 key={`h2-${idx}`} className="text-xl font-semibold text-slate-900">
            {inline(block.content as string)}
          </h3>
        );
      }
      if (block.type === "h3") {
        return (
          <h4 key={`h3-${idx}`} className="text-lg font-semibold text-slate-900">
            {inline(block.content as string)}
          </h4>
        );
      }

      return (
        <p key={`p-${idx}`} className="leading-relaxed text-slate-700">
          {inline(block.content as string)}
        </p>
      );
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-row items-end gap-3">
        <button
          className="px-4 py-2 bg-indigo-600 text-white font-semibold rounded-sm hover:bg-indigo-700 transition disabled:opacity-60"
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Report"}
        </button>
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsOpen((v) => !v)}
            className="inline-flex items-center gap-2 rounded-sm border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <span className="text-slate-500">User</span>
            <span className="font-semibold">{selectedUsersLabel}</span>
            <svg className="h-4 w-4 text-slate-500" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isOpen && (
            <div className="absolute right-0 z-20 mt-2 w-72 rounded-md border border-slate-200 bg-white p-4 shadow-lg">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search user..."
                className="mb-2 w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
              />

              <div className="max-h-56 overflow-auto pr-1">
                <button
                  type="button"
                  onClick={toggleAll}
                  className={`mb-1 flex w-full items-center justify-between rounded-md px-2 py-2 text-sm ${isAllSelected ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
                    }`}
                >
                  <span>All</span>
                  {isAllSelected && (
                    <span className="text-xs font-semibold">Selected</span>
                  )}
                </button>

                {filteredUsers.map((u) => {
                  const id = String(u.id);
                  const checked = !isAllSelected && selectedUserIds.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => toggleUser(id)}
                      className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm ${checked ? "bg-blue-50 text-blue-700" : "hover:bg-slate-50"
                        }`}
                    >
                      <span className="truncate">{u.username}</span>
                      {checked && <span className="text-xs font-semibold">Selected</span>}
                    </button>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <div className="px-2 py-2 text-sm text-slate-500">No users found.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {error && <div className="text-sm text-red-600">{error}</div>}

      </div>
      {report && (
        <div className="w-full rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
                  <path d="M19 3H8a2 2 0 0 0-2 2v2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-2h1a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm-3 16H5V9h11v10Zm3-4h-1V9a2 2 0 0 0-2-2H8V5h11v10Z" />
                </svg>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">Report Ready</div>
                <div className="text-xs text-slate-500">Markdown supported</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsReportOpen((v) => !v)}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {isReportOpen ? "Collapse" : "Expand"}
              </button>
              <button
                type="button"
                onClick={downloadPdf}
                className="rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
              >
                Download PDF
              </button>
            </div>
          </div>

          <div
            className={`transition-[max-height,opacity] duration-300 ease-in-out ${isReportOpen ? "max-h-[1200px] opacity-100" : "max-h-0 opacity-0"
              } overflow-hidden`}
          >
            <div className="px-5 py-4 space-y-3">{renderMarkdown(report)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportGenerator;
