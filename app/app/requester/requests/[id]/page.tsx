"use client";

import { useEffect, useState, use } from "react";
import type { Request, Response, Reminder, User, Kid } from "@/lib/types";

type RequestDetail = Request & { responses: Response[]; reminders: Reminder[] };

function supplierStatusForKid(
  responses: Response[],
  supplierId: string,
  kidId: string
): "submitted" | "started" | "not_started" {
  const r = responses.find((x) => x.supplierId === supplierId && x.kidId === kidId);
  if (!r) return "not_started";
  if (r.submittedAt) return "submitted";
  return "started";
}

function CellBadge({ status, lastActivity }: { status: "submitted" | "started" | "not_started"; lastActivity?: string }) {
  if (status === "submitted")
    return <span className="text-xs text-green-700 font-medium">Inskickad</span>;
  if (status === "started")
    return (
      <span className="text-xs text-yellow-700 font-medium">
        Påbörjad
        {lastActivity && (
          <span className="ml-1 text-gray-400">
            ({new Date(lastActivity).toLocaleString("sv-SE", { dateStyle: "short", timeStyle: "short" })})
          </span>
        )}
      </span>
    );
  return <span className="text-xs text-gray-400">Ej påbörjad</span>;
}

export default function RequesterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [detail, setDetail] = useState<RequestDetail | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    const [detailRes, usersRes, kidsRes] = await Promise.all([
      fetch(`/api/requests/${id}`).then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/kids").then((r) => r.json()),
    ]);
    setDetail(detailRes);
    setUsers(usersRes);
    setKids(kidsRes);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function handleReminder(supplierId: string) {
    await fetch(`/api/requests/${id}/reminders/${supplierId}`, { method: "POST" });
    load();
  }

  if (loading) return <p className="text-gray-400">Laddar...</p>;
  if (!detail) return <p className="text-red-500">Förfrågan hittades inte.</p>;

  const getUserName = (uid: string) => users.find((u) => u.id === uid)?.name ?? uid;
  const getKidLabel = (kid: string) => kids.find((k) => k.id === kid)?.label ?? kid;

  const requestKids = detail.kidIds;
  const requestSuppliers = detail.supplierIds;

  return (
    <div>
      <div className="mb-6">
        <a href="/requester" className="text-sm text-blue-600 hover:underline">
          ← Tillbaka
        </a>
        <h1 className="text-2xl font-bold mt-2">Förfrågan detaljer</h1>
        <p className="text-sm text-gray-400">
          Skapad {new Date(detail.createdAt).toLocaleDateString("sv-SE")}
        </p>
        {detail.dueDate && (
          <p className={`text-sm mt-0.5 ${new Date(detail.dueDate) < new Date(new Date().toDateString()) ? "underline text-red-600" : "text-gray-500"}`}>
            Svaras senast {new Date(detail.dueDate).toLocaleDateString("sv-SE")}
          </p>
        )}
        {detail.note && <p className="text-sm text-gray-600 mt-1 italic">{detail.note}</p>}
      </div>

      {/* Answer table */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold mb-3">Svarsstatus</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-left px-3 py-2 font-medium text-gray-600 border-b border-gray-200">
                  Elev
                </th>
                {requestSuppliers.map((sId) => (
                  <th
                    key={sId}
                    className="text-left px-3 py-2 font-medium text-gray-600 border-b border-gray-200"
                  >
                    {getUserName(sId)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {requestKids.map((kidId) => (
                <tr key={kidId} className="border-b border-gray-100">
                  <td className="px-3 py-2 font-medium">{getKidLabel(kidId)}</td>
                  {requestSuppliers.map((sId) => {
                    const status = supplierStatusForKid(detail.responses, sId, kidId);
                    const resp = detail.responses.find(
                      (r) => r.supplierId === sId && r.kidId === kidId
                    );
                    return (
                      <td key={sId} className="px-3 py-2">
                        <CellBadge status={status} lastActivity={resp?.lastActivityAt} />
                        {status === "submitted" && resp && (
                          <p className="mt-1 text-xs text-gray-500">
                            {resp.answers.traits || "Inga utmärkande drag"}
                          </p>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Reminder panel */}
      <section>
        <h2 className="text-lg font-semibold mb-3">Påminnelser</h2>
        <div className="space-y-3">
          {requestSuppliers.map((sId) => {
            const supplierReminders = detail.reminders.filter((r) => r.supplierId === sId);
            const allSubmitted = requestKids.every((kidId) => {
              const r = detail.responses.find((x) => x.supplierId === sId && x.kidId === kidId);
              return r?.submittedAt != null;
            });
            const firstReminder = supplierReminders.length > 0
              ? new Date(supplierReminders[0].sentAt).toLocaleDateString("sv-SE")
              : null;

            return (
              <div key={sId} className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{getUserName(sId)}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {supplierReminders.length === 0
                      ? "Inga påminnelser skickade"
                      : `${supplierReminders.length} påminnelse(r) · Första: ${firstReminder}`}
                  </p>
                </div>
                <button
                  onClick={() => handleReminder(sId)}
                  disabled={allSubmitted}
                  className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded transition disabled:opacity-40"
                >
                  Skicka påminnelse
                </button>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
