"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Request, Response, Kid, User } from "@/lib/types";

type RequestWithResponses = Request & { responses: Response[] };
type KidFilter = "all" | "outstanding" | "submitted";
type KidStatus = "outstanding" | "all_submitted" | "no_requests";

type KidEntry = {
  kid: Kid;
  status: KidStatus;
  supplierTasks: { requestId: string; status: "submitted" | "started" | "not_started" }[];
  submittedCount: number;
  expectedCount: number;
};

function OverallBadge({ status }: { status: KidStatus }) {
  if (status === "all_submitted")
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
        Alla inskickade
      </span>
    );
  if (status === "outstanding")
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
        Utestående
      </span>
    );
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400">
      Ingen förfrågan
    </span>
  );
}

function TaskBadge({ status }: { status: "submitted" | "started" | "not_started" }) {
  if (status === "submitted")
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300">
        Inskickad
      </span>
    );
  if (status === "started")
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300">
        Påbörjad
      </span>
    );
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
      Ej påbörjad
    </span>
  );
}

export default function KidsOverviewPage() {
  const [me, setMe] = useState<User | null>(null);
  const [entries, setEntries] = useState<KidEntry[]>([]);
  const [filter, setFilter] = useState<KidFilter>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [meRes, kidsRes, reqsRes] = await Promise.all([
        fetch("/api/auth/me"),
        fetch("/api/kids"),
        fetch("/api/requests"),
      ]);
      const currentUser: User = await meRes.json();
      const allKids: Kid[] = await kidsRes.json();
      const allRequests: Request[] = await reqsRes.json();

      const activeRequests = allRequests.filter((r) => r.status === "active");
      const details = await Promise.all(
        activeRequests.map((r) =>
          fetch(`/api/requests/${r.id}`).then((res) => res.json()) as Promise<RequestWithResponses>
        )
      );

      const visibleKids = allKids; // API already scopes to assigned kids for suppliers

      const computed: KidEntry[] = visibleKids.map((kid) => {
        const kidRequests = details.filter((r) => r.kidIds.includes(kid.id));

        if (currentUser.role === "supplier") {
          const myRequests = kidRequests.filter((r) =>
            r.supplierIds.includes(currentUser.id)
          );
          const supplierTasks = myRequests.map((req) => {
            const resp = req.responses.find(
              (r) => r.kidId === kid.id && r.supplierId === currentUser.id
            );
            const status: "submitted" | "started" | "not_started" = resp?.submittedAt
              ? "submitted"
              : resp
              ? "started"
              : "not_started";
            return { requestId: req.id, status };
          });
          const allDone = supplierTasks.every((t) => t.status === "submitted");
          const kidStatus: KidStatus =
            myRequests.length === 0 ? "no_requests" : allDone ? "all_submitted" : "outstanding";
          return { kid, status: kidStatus, supplierTasks, submittedCount: 0, expectedCount: 0 };
        } else {
          let submitted = 0;
          let expected = 0;
          for (const req of kidRequests) {
            for (const supplierId of req.supplierIds) {
              expected++;
              const resp = req.responses.find(
                (r) => r.kidId === kid.id && r.supplierId === supplierId
              );
              if (resp?.submittedAt) submitted++;
            }
          }
          const kidStatus: KidStatus =
            expected === 0 ? "no_requests" : submitted === expected ? "all_submitted" : "outstanding";
          return {
            kid,
            status: kidStatus,
            supplierTasks: [],
            submittedCount: submitted,
            expectedCount: expected,
          };
        }
      });

      setMe(currentUser);
      setEntries(computed);
      setLoading(false);
    }
    load();
  }, []);

  const filtered = entries.filter((e) => {
    if (filter === "outstanding") return e.status === "outstanding";
    if (filter === "submitted") return e.status === "all_submitted";
    return true;
  });

  if (loading) return <p className="text-gray-400 dark:text-gray-500">Laddar...</p>;

  const counts = {
    all: entries.length,
    outstanding: entries.filter((e) => e.status === "outstanding").length,
    submitted: entries.filter((e) => e.status === "all_submitted").length,
  };

  const filterConfig: { key: KidFilter; label: string }[] = [
    { key: "all", label: `Alla (${counts.all})` },
    { key: "outstanding", label: `Utestående (${counts.outstanding})` },
    { key: "submitted", label: `Inskickade (${counts.submitted})` },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Elever</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        {filterConfig.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
              filter === key
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">Inga elever matchar filtret.</p>
      )}

      <ul className="space-y-2">
        {filtered.map(({ kid, status, supplierTasks, submittedCount, expectedCount }) => (
          <li
            key={kid.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-5 py-4"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <Link
                  href={`/kids/${kid.id}`}
                  className="font-medium text-blue-700 dark:text-blue-400 hover:underline truncate"
                >
                  {kid.label}
                </Link>
                <OverallBadge status={status} />
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                {me?.role === "requester" && expectedCount > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {submittedCount}/{expectedCount} svar
                  </span>
                )}

                {me?.role === "supplier" && supplierTasks.length > 0 && (
                  <div className="flex gap-2 items-center">
                    {supplierTasks.map((task) => (
                      <div key={task.requestId} className="flex items-center gap-1.5">
                        <TaskBadge status={task.status} />
                        {task.status !== "submitted" && (
                          <Link
                            href={`/supplier/requests/${task.requestId}/kids/${kid.id}`}
                            className="text-xs text-blue-600 hover:underline"
                          >
                            {task.status === "started" ? "Fortsätt" : "Svara"}
                          </Link>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <Link
                  href={`/kids/${kid.id}`}
                  className="text-sm text-gray-400 hover:text-blue-600 transition"
                  aria-label={`Visa ${kid.label}`}
                >
                  →
                </Link>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
