"use client";

import { useEffect, useState } from "react";
import type { User } from "@/lib/types";

export default function LoginPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  async function handleSelect(user: User) {
    setPending(user.id);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: user.id }),
    });
    if (!res.ok) {
      setPending(null);
      return;
    }
    const { role } = await res.json();
    window.location.href = role === "requester" ? "/requester" : "/supplier";
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-2">Vem är du?</h1>
      <p className="text-gray-500 mb-6">Välj din profil för att fortsätta.</p>
      {loading ? (
        <p className="text-gray-400">Laddar...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {users.map((user) => (
            <button
              key={user.id}
              onClick={() => handleSelect(user)}
              disabled={pending !== null}
              className="bg-white border border-gray-200 rounded-lg px-5 py-6 text-left hover:border-blue-400 hover:shadow-sm transition disabled:opacity-60"
            >
              <p className="font-semibold text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-500 mt-1 capitalize">
                {user.role === "supplier" ? "Lärare (svarar)" : "Samordnare (frågar)"}
              </p>
              {pending === user.id && (
                <p className="text-xs text-blue-500 mt-2">Loggar in...</p>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
