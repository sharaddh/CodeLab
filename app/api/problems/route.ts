import { NextResponse } from "next/server";
import problemsData from "@/data/problems.json";
import type { Problem } from "@/lib/types";

const allProblems = problemsData as Problem[];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";
  const difficulty = searchParams.get("difficulty") || "all";
  const topic = searchParams.get("topic") || "all";
  const company = searchParams.get("company") || "all";
  const sort = searchParams.get("sort") || "id";
  const max = Math.min(Number(searchParams.get("max") || 4000), allProblems.length);

  let list = [...allProblems];

  if (difficulty !== "all") {
    list = list.filter((p) => p.difficulty === difficulty);
  }
  if (topic !== "all") {
    list = list.filter((p) =>
      (p.topics || []).some((x) => String(x.name || x) === topic)
    );
  }
  if (company !== "all") {
    list = list.filter((p) =>
      (p.companies || []).some(
        (c) => c.name.toLowerCase() === company.toLowerCase()
      )
    );
  }
  if (q) {
    const ql = q.toLowerCase();
    list = list.filter((p) =>
      `${p.id} ${p.title} ${(p.topics || []).map((x) => x.name || x).join(" ")} ${(p.companies || []).map((c) => c.name).join(" ")}`
        .toLowerCase()
        .includes(ql)
    );
  }

  if (sort === "freq") {
    list.sort(
      (a, b) =>
        (b.askedBy - a.askedBy) ||
        (b.frequency - a.frequency) ||
        (Number(a.id) - Number(b.id))
    );
  } else {
    list.sort((a, b) => Number(a.id) - Number(b.id));
  }

  return NextResponse.json({
    total: list.length,
    problems: list.slice(0, max),
  });
}
