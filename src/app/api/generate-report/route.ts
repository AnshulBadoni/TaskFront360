import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const apiKey = process.env.pollination_key;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing pollination_key in environment." },
        { status: 500 }
      );
    }

    const body = await req.json();
    const project = body?.project ?? {};
    const tasks = body?.tasks ?? [];
    const selectedUsers = body?.selectedUsers ?? "ALL";

    const messages = [
      {
        role: "system",
        content:
          "You are a project reporting assistant. Generate a clear, concise project report.",
      },
      {
        role: "user",
        content: [
          "Generate a report with these rules:",
          "1) If selectedUsers is ALL, summarize the full project progress and overall task status.",
          "2) If selectedUsers is a list, focus only on those users' contributions and tasks.",
          "3) Include: summary, key accomplishments, blockers/risks, next steps.",
          "",
          "Project:",
          JSON.stringify(project, null, 2),
          "",
          "Selected Users:",
          JSON.stringify(selectedUsers, null, 2),
          "",
          "Tasks:",
          JSON.stringify(tasks, null, 2),
        ].join("\n"),
      },
    ];

    const response = await fetch("https://gen.pollinations.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        model: "openai",
        messages,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json(
        { error: "Pollinations API error.", details: errText },
        { status: response.status }
      );
    }

    const data = await response.json();
    const report =
      data?.choices?.[0]?.message?.content ||
      data?.choices?.[0]?.text ||
      data?.message?.content ||
      "";

    return NextResponse.json({ report, raw: data });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "Failed to generate report." },
      { status: 500 }
    );
  }
}
