"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Request, Response, User, Kid } from "@/lib/types";

type RequestDetail = Request & { responses: Response[]; reminders: unknown[] };

function supplierStatus(
  request: RequestDetail,
  supplierId: string
): "submitted" | "started" | "not_started" {
  const supplierResponses = request.responses.filter((r) => r.supplierId === supplierId);
  if (supplierResponses.length === 0) return "not_started";
  const allSubmitted = request.kidIds.every((kidId) =>
    supplierResponses.some((r) => r.kidId === kidId && r.submittedAt)
  );
  if (allSubmitted) return "submitted";
  const anyActivity = supplierResponses.some((r) => r.lastActivityAt);
  return anyActivity ? "started" : "not_started";
}

function StatusBadge({ status }: { status: "submitted" | "started" | "not_started" }) {
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

export default function RequesterPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestDetail[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const meRes = await fetch("/api/auth/me");
    if (meRes.ok) {
      const me: User = await meRes.json();
      if (me.role !== "requester") {
        router.replace("/login");
        return;
      }
    }

    const [reqRes, usersRes, kidsRes] = await Promise.all([
      fetch("/api/requests"),
      fetch("/api/users"),
      fetch("/api/kids"),
    ]);
    const allRequests: Request[] = await reqRes.json();
    const allUsers: User[] = await usersRes.json();
    const allKids: Kid[] = await kidsRes.json();

    const details = await Promise.all(
      allRequests
        .filter((r) => r.status === "active")
        .map(async (r) => {
          const detail = await fetch(`/api/requests/${r.id}`).then((res) => res.json());
          return detail as RequestDetail;
        })
    );
    setRequests(details);
    setUsers(allUsers);
    setKids(allKids);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleRemoveSupplier(requestId: string, supplierId: string) {
    await fetch(`/api/requests/${requestId}/suppliers/${supplierId}`, { method: "DELETE" });
    load();
  }

  async function handleClose(requestId: string) {
    await fetch(`/api/requests/${requestId}`, { method: "DELETE" });
    load();
  }

  const getUserName = (id: string) => users.find((u) => u.id === id)?.name ?? id;
  const getKidLabel = (id: string) => kids.find((k) => k.id === id)?.label ?? id;

  if (loading) return <p className="text-gray-400 dark:text-gray-500">Laddar...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Förfrågningar</h1>
        <Link
          href="/requester/requests/new"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition text-sm font-medium"
        >
          Skapa ny förfrågan
        </Link>
      </div>

      {requests.length === 0 && (
        <p className="text-gray-500 dark:text-gray-400">Inga aktiva förfrågningar.</p>
      )}

      <ul className="space-y-6">
        {requests.map((request) => {
          const submittedCount = request.supplierIds.reduce((acc, sId) => {
            const status = supplierStatus(request, sId);
            return status === "submitted" ? acc + request.kidIds.length : acc;
          }, 0);
          const expectedCount = request.supplierIds.length * request.kidIds.length;

          return (
            <li key={request.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    Skapad {new Date(request.createdAt).toLocaleDateString("sv-SE")}
                  </p>
                  {request.dueDate && (
                    <p className={`text-sm mt-0.5 ${new Date(request.dueDate) < new Date(new Date().toDateString()) ? "underline text-red-600" : "text-gray-500 dark:text-gray-400"}`}>
                      Svaras senast {new Date(request.dueDate).toLocaleDateString("sv-SE")}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    {submittedCount}/{expectedCount} svar inskickade
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {request.kidIds.map((kidId) => (
                      <span key={kidId} className="inline-block px-2 py-0.5 rounded text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-700">
                        {getKidLabel(kidId)}
                      </span>
                    ))}
                  </div>
                  {request.note && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">{request.note}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/requester/requests/${request.id}`}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    Visa detaljer
                  </Link>
                  <button
                    onClick={() => handleClose(request.id)}
                    className="text-sm text-red-500 hover:underline ml-2"
                  >
                    Stäng förfrågan
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {request.supplierIds.map((sId) => {
                  const status = supplierStatus(request, sId);
                  return (
                    <div key={sId} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded px-3 py-2">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{getUserName(sId)}</span>
                        <StatusBadge status={status} />
                      </div>
                      <button
                        onClick={() => handleRemoveSupplier(request.id, sId)}
                        className="text-xs text-gray-400 hover:text-red-500 transition"
                      >
                        Ta bort tilldelning
                      </button>
                    </div>
                  );
                })}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
