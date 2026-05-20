"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Request, Response, Kid } from "@/lib/types";

type RequestDetail = Request & { responses: Response[] };

function kidStatus(
  responses: Response[],
  kidId: string
): "submitted" | "started" | "not_started" {
  const r = responses.find((x) => x.kidId === kidId);
  if (!r) return "not_started";
  if (r.submittedAt) return "submitted";
  return "started";
}

function StatusBadge({ status }: { status: "submitted" | "started" | "not_started" }) {
  if (status === "submitted")
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
        Inskickad
      </span>
    );
  if (status === "started")
    return (
      <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
        Påbörjad
      </span>
    );
  return (
    <span className="inline-block px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
      Ej påbörjad
    </span>
  );
}

export default function SupplierPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<RequestDetail[]>([]);
  const [kids, setKids] = useState<Kid[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/requests").then((r) => r.json()),
      fetch("/api/kids").then((r) => r.json()),
      fetch("/api/auth/me").then((r) => r.json()),
    ]).then(([allRequests, allKids, me]) => {
      if (me?.role !== "supplier") {
        router.replace("/login");
        return;
      }
      const active = (allRequests as Request[]).filter((r) => r.status === "active");
      Promise.all(
        active.map((r) =>
          fetch(`/api/requests/${r.id}`).then((res) => res.json())
        )
      ).then((details) => {
        setRequests(details as RequestDetail[]);
        setKids(allKids);
        setCurrentUserId(me?.id ?? null);
        setLoading(false);
      });
    });
  }, []);

  const getKidLabel = (id: string) => kids.find((k) => k.id === id)?.label ?? id;

  if (loading) return <p className="text-gray-400">Laddar...</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Mina förfrågningar</h1>

      {requests.length === 0 && (
        <p className="text-gray-500">Inga aktiva förfrågningar tilldelade dig.</p>
      )}

      <ul className="space-y-6">
        {requests.map((request) => {
          const myResponses = request.responses.filter(
            (r) => r.supplierId === currentUserId
          );

          return (
            <li key={request.id} className="bg-white border border-gray-200 rounded-lg p-5">
              <div className="mb-3">
                <p className="text-sm text-gray-400">
                  Skapad {new Date(request.createdAt).toLocaleDateString("sv-SE")}
                </p>
                {request.note && (
                  <p className="text-sm text-gray-600 mt-1 italic">{request.note}</p>
                )}
              </div>
              <div className="space-y-2">
                {request.kidIds.map((kidId) => {
                  const status = kidStatus(myResponses, kidId);
                  return (
                    <div
                      key={kidId}
                      className="flex items-center justify-between bg-gray-50 rounded px-3 py-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">{getKidLabel(kidId)}</span>
                        <StatusBadge status={status} />
                      </div>
                      {status !== "submitted" && (
                        <Link
                          href={`/supplier/requests/${request.id}/kids/${kidId}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          {status === "started" ? "Fortsätt" : "Svara"}
                        </Link>
                      )}
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
