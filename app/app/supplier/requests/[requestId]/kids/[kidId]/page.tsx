"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { QUESTIONS, AREA_LABELS, type Field } from "@/lib/screening";
import type { Request, Response, User, Kid } from "@/lib/types";

const FIELD_CONFIG: Record<Field, {
  label: string;
  border: string;
  bg: string;
  checkedBg: string;
  text: string;
  dot: string;
  badge: string;
}> = {
  1: { label: "Fält 1", border: "border-red-400", bg: "bg-red-50", checkedBg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", badge: "bg-red-100 text-red-700" },
  2: { label: "Fält 2", border: "border-amber-400", bg: "bg-amber-50", checkedBg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", badge: "bg-amber-100 text-amber-700" },
  3: { label: "Fält 3", border: "border-green-500", bg: "bg-green-50", checkedBg: "bg-green-100", text: "text-green-700", dot: "bg-green-500", badge: "bg-green-100 text-green-700" },
  4: { label: "Fält 4", border: "border-blue-400", bg: "bg-blue-50", checkedBg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-400", badge: "bg-blue-100 text-blue-700" },
};

const AREAS = Object.keys(AREA_LABELS);

type RequestDetail = Request & { responses: Response[] };

function kidStatusInRequest(
  req: RequestDetail,
  kidId: string,
  supplierId: string
): "submitted" | "started" | "not_started" {
  const r = req.responses.find((x) => x.supplierId === supplierId && x.kidId === kidId);
  if (!r) return "not_started";
  if (r.submittedAt) return "submitted";
  return "started";
}

function kidProgress(req: RequestDetail, kidId: string, supplierId: string): number {
  const r = req.responses.find((x) => x.supplierId === supplierId && x.kidId === kidId);
  if (!r) return 0;
  if (r.submittedAt) return 100;
  const trueCount = Object.values(r.answers).filter((v) => v === "true").length;
  return Math.round((trueCount / QUESTIONS.length) * 100);
}

function WheelGraph({ percent }: { percent: number }) {
  const r = 6;
  const cx = 8;
  const circ = 2 * Math.PI * r;
  const done = percent === 100;
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" className="flex-shrink-0">
      {done ? (
        <>
          <circle cx={cx} cy={cx} r={7} fill="#16a34a" />
          <path d="M4.5 8.5 L6.5 10.5 L11 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </>
      ) : (
        <>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#d1d5db" strokeWidth="2" />
          {percent > 0 && (
            <circle
              cx={cx} cy={cx} r={r}
              fill="none"
              stroke="#16a34a"
              strokeWidth="2"
              strokeDasharray={`${(percent / 100) * circ} ${circ}`}
              strokeLinecap="round"
              transform="rotate(-90 8 8)"
            />
          )}
        </>
      )}
    </svg>
  );
}

function isOverdue(dueDate?: string): boolean {
  if (!dueDate) return false;
  return new Date(dueDate) < new Date(new Date().toDateString());
}

export default function SupplierAnswerPage({
  params,
}: {
  params: Promise<{ requestId: string; kidId: string }>;
}) {
  const { requestId, kidId } = use(params);

  const [checked, setChecked] = useState<Record<string, boolean>>({});
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [submitted, setSubmitted] = useState(false);
  const [reopened, setReopened] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [kidLabel, setKidLabel] = useState(kidId);
  const [otherResponses, setOtherResponses] = useState<Response[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allKids, setAllKids] = useState<Kid[]>([]);
  const [allRequests, setAllRequests] = useState<RequestDetail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setChecked({});
    setSubmitted(false);
    setReopened(false);
    setError(null);

    Promise.all([
      fetch("/api/auth/me").then((r) => r.json()),
      fetch(`/api/requests/${requestId}`).then((r) => r.json()),
      fetch("/api/kids").then((r) => r.json()),
      fetch("/api/users").then((r) => r.json()),
      fetch("/api/requests").then((r) => r.json()),
    ]).then(([me, detail, kids, users, requestList]: [User, RequestDetail, Kid[], User[], Request[]]) => {
      setCurrentUser(me);
      setRequest(detail);
      setAllUsers(users);
      setAllKids(kids);
      const kid = (kids as Kid[]).find((k) => k.id === kidId);
      if (kid) setKidLabel(kid.label);

      setOtherResponses(
        detail.responses.filter(
          (r) => r.kidId === kidId && r.supplierId !== me?.id && r.submittedAt
        )
      );

      // Fetch full details for sidebar (only active requests assigned to this supplier)
      const myActive = (requestList as Request[]).filter(
        (r) => r.status === "active" && r.supplierIds.includes(me?.id)
      );
      Promise.all(
        myActive.map((r) =>
          r.id === requestId
            ? Promise.resolve(detail)
            : fetch(`/api/requests/${r.id}`).then((res) => res.json())
        )
      ).then((details) => setAllRequests(details as RequestDetail[]));

      fetch(`/api/requests/${requestId}/responses/${me?.id}/${kidId}`)
        .then((r) => (r.status === 404 ? null : r.json()))
        .then((existing: Response | null) => {
          if (existing?.submittedAt) {
            setSubmitted(true);
          } else if (existing) {
            const restored: Record<string, boolean> = {};
            for (const [k, v] of Object.entries(existing.answers)) {
              if (k !== "screeningId" && k !== "traits") {
                restored[k] = v === "true";
              }
            }
            setChecked(restored);
          }
          setLoading(false);
        });
    });
  }, [requestId, kidId]);

  const toggle = (qId: string) =>
    setChecked((prev) => ({ ...prev, [qId]: !prev[qId] }));

  const toggleArea = (area: string) =>
    setCollapsed((prev) => ({ ...prev, [area]: !prev[area] }));

  const totalChecked = Object.values(checked).filter(Boolean).length;

  const checkboxAnswers = (): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const q of QUESTIONS) {
      out[q.id] = String(!!checked[q.id]);
    }
    return out;
  };

  async function handleSaveDraft() {
    if (!currentUser) return;
    setSaving(true);
    setError(null);
    await fetch(
      `/api/requests/${requestId}/responses/${currentUser.id}/${kidId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: checkboxAnswers() }),
      }
    );
    setSaving(false);
  }

  async function handleSubmit() {
    if (!currentUser) return;
    setSaving(true);
    setError(null);

    const screeningAnswers = QUESTIONS.map((q) => ({
      questionId: q.id,
      checked: !!checked[q.id],
    }));

    const scrRes = await fetch(`/api/kids/${kidId}/screenings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: screeningAnswers }),
    });

    if (!scrRes.ok) {
      setError("Kunde inte spara kartläggningen. Försök igen.");
      setSaving(false);
      return;
    }

    const screening = await scrRes.json();

    await fetch(
      `/api/requests/${requestId}/responses/${currentUser.id}/${kidId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submit: true,
          answers: {
            screeningId: screening.id,
            traits: screening.traits.join(", "),
          },
        }),
      }
    );

    setSubmitted(true);
    setReopened(false);
    setSaving(false);

    // Update sidebar status by refreshing the current request detail
    fetch(`/api/requests/${requestId}`)
      .then((r) => r.json())
      .then((updated: RequestDetail) => {
        setAllRequests((prev) =>
          prev.map((r) => (r.id === requestId ? updated : r))
        );
        setRequest(updated);
      });
  }

  async function handleReopen() {
    if (!currentUser) return;
    setSaving(true);
    await fetch(
      `/api/requests/${requestId}/responses/${currentUser.id}/${kidId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers: {}, reopen: true }),
      }
    );
    setChecked({});
    setSubmitted(false);
    setReopened(true);
    setSaving(false);

    // Refresh sidebar
    fetch(`/api/requests/${requestId}`)
      .then((r) => r.json())
      .then((updated: RequestDetail) => {
        setAllRequests((prev) =>
          prev.map((r) => (r.id === requestId ? updated : r))
        );
        setRequest(updated);
      });
  }

  const getKidLabel = (id: string) => allKids.find((k) => k.id === id)?.label ?? id;
  const getUserName = (id: string) => allUsers.find((u) => u.id === id)?.name ?? id;

  if (loading) return <p className="text-gray-400">Laddar...</p>;

  return (
    <div className="flex gap-6 items-start">
      {/* Sidebar */}
      {allRequests.length > 0 && (
        <aside className="w-52 flex-shrink-0 sticky top-8 self-start bg-white border border-gray-200 rounded-lg p-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Mina förfrågningar</p>
          <div className="space-y-3">
            {allRequests.map((req) => {
              const overdue = isOverdue(req.dueDate);
              const reqLabel = req.note
                ? req.note.slice(0, 30) + (req.note.length > 30 ? "…" : "")
                : new Date(req.createdAt).toLocaleDateString("sv-SE");
              return (
                <div key={req.id}>
                  <p className={`text-xs font-semibold mb-1 px-1 ${overdue ? "underline text-red-600" : "text-gray-600"}`}>
                    {reqLabel}
                    {req.dueDate && <span className="ml-1 font-normal text-gray-400">({req.dueDate})</span>}
                  </p>
                  <ul className="space-y-0.5">
                    {req.kidIds.map((kid) => {
                      const status = kidStatusInRequest(req, kid, currentUser?.id ?? "");
                      const isActive = req.id === requestId && kid === kidId;
                      return (
                        <li key={kid}>
                          <Link
                            href={`/supplier/requests/${req.id}/kids/${kid}`}
                            className={`flex items-center gap-1.5 px-2 py-1 rounded text-sm transition-colors ${
                              isActive
                                ? "bg-blue-50 text-blue-700 font-medium"
                                : "text-gray-700 hover:bg-gray-100"
                            }`}
                          >
                            <WheelGraph percent={kidProgress(req, kid, currentUser?.id ?? "")} />
                            <span className={status === "submitted" ? "text-gray-500" : ""}>{getKidLabel(kid)}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </aside>
      )}

      {/* Main form */}
      <div className="flex-1 min-w-0 max-w-2xl">
        <div className="mb-6">
          <a href="/supplier" className="text-sm text-blue-600 hover:underline">
            ← Tillbaka
          </a>
          <h1 className="text-2xl font-bold mt-2">
            Skolkompassen: {kidLabel}
          </h1>
          {request?.dueDate && (
            <p className={`text-sm mt-0.5 ${isOverdue(request.dueDate) ? "underline text-red-600" : "text-gray-500"}`}>
              Svaras senast {new Date(request.dueDate).toLocaleDateString("sv-SE")}
            </p>
          )}
          {request?.note && (
            <p className="text-sm text-gray-500 mt-1 italic">{request.note}</p>
          )}
          {submitted && !reopened && (
            <div className="mt-3 flex items-center gap-4">
              <p className="text-sm text-green-700 font-medium">
                Kartläggningen är inskickad.
              </p>
              <button
                onClick={handleReopen}
                disabled={saving}
                className="text-sm text-gray-500 hover:text-blue-600 underline disabled:opacity-50"
              >
                Redigera svar
              </button>
            </div>
          )}
          {reopened && (
            <p className="mt-2 text-sm text-blue-700 font-medium">
              Svaret är återöppnat — fyll i och skicka in igen.
            </p>
          )}
        </div>

        {!submitted && (
          <>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mb-6 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-xs font-semibold text-gray-500 self-center">Prioritet:</span>
              {([1, 2, 3, 4] as Field[]).map((field) => {
                const cfg = FIELD_CONFIG[field];
                return (
                  <div key={field} className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ${cfg.dot}`} />
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                );
              })}
              <span className="text-xs text-gray-400 self-center ml-1">
                (Fält 1 = störst påverkan på lärandet)
              </span>
            </div>

            {/* Areas */}
            <div className="space-y-4">
              {AREAS.map((area) => {
                const areaQuestions = QUESTIONS.filter((q) => q.area === area);
                const areaChecked = areaQuestions.filter((q) => checked[q.id]).length;
                const isOpen = !collapsed[area];
                const subAreas = Array.from(
                  new Map(areaQuestions.map((q) => [q.subArea, q.field])).entries()
                ).sort(([, fa], [, fb]) => fa - fb);

                return (
                  <section key={area} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => toggleArea(area)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition text-left"
                    >
                      <span className="font-semibold text-gray-800 text-sm">
                        {AREA_LABELS[area]}
                      </span>
                      <div className="flex items-center gap-2">
                        {areaChecked > 0 && (
                          <span className="text-xs bg-gray-700 text-white px-2 py-0.5 rounded-full">
                            {areaChecked}
                          </span>
                        )}
                        <span className="text-gray-400 text-xs">{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-gray-100">
                        {subAreas.map(([subArea, field]) => {
                          const cfg = FIELD_CONFIG[field as Field];
                          const items = areaQuestions.filter((q) => q.subArea === subArea);
                          return (
                            <div key={subArea} className={`border-l-4 ${cfg.border}`}>
                              <div className={`px-4 pt-3 pb-1 ${cfg.bg}`}>
                                <div className="flex items-center gap-2">
                                  <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                                  <span className={`text-xs font-semibold ${cfg.text}`}>
                                    {cfg.label} — {subArea}
                                  </span>
                                </div>
                              </div>
                              <div className="px-4 pb-3 space-y-1">
                                {items.map((q) => {
                                  const isChecked = !!checked[q.id];
                                  return (
                                    <label
                                      key={q.id}
                                      className={`flex items-start gap-3 py-1.5 px-2 rounded cursor-pointer transition-colors ${
                                        isChecked ? cfg.checkedBg : "hover:bg-gray-50"
                                      }`}
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggle(q.id)}
                                        className="mt-0.5 h-4 w-4 flex-shrink-0 accent-gray-700 cursor-pointer"
                                      />
                                      <span className={`text-sm leading-snug ${isChecked ? "font-medium" : "text-gray-700"}`}>
                                        {q.text}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </section>
                );
              })}
            </div>

            {error && <p className="mt-4 text-red-600 text-sm">{error}</p>}
            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={saving}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded hover:border-blue-400 transition text-sm font-medium disabled:opacity-50"
              >
                {saving ? "Sparar..." : "Spara utkast"}
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={saving}
                className="bg-gray-800 text-white px-5 py-2 rounded hover:bg-gray-900 transition text-sm font-medium disabled:opacity-50"
              >
                Skicka in kartläggning
              </button>
              <span className="text-sm text-gray-400">
                {totalChecked === 0
                  ? "Inga påståenden markerade"
                  : `${totalChecked} markerade`}
              </span>
            </div>
          </>
        )}

        {otherResponses.length > 0 && (
          <section className="mt-10">
            <h2 className="text-lg font-semibold mb-4">Vad andra har svarat</h2>
            <div className="space-y-3">
              {otherResponses.map((resp) => (
                <div key={resp.id} className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    {getUserName(resp.supplierId)}
                  </p>
                  <p className="text-sm text-gray-600">
                    {resp.answers.traits
                      ? resp.answers.traits
                      : "Inga utmärkande drag"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
