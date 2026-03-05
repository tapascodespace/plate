"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function JoinBuildingPage() {
  const router = useRouter();
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function joinBuilding() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/buildings/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode }),
      });
      const json = await res.json();

      if (!res.ok || !json.success) {
        setError(json.error ?? "Failed to join building");
        return;
      }

      router.push("/explore");
    } catch {
      setError("Failed to join building");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <h1 className="text-2xl font-bold text-stone-900">Join Building</h1>
        <Input
          label="Invite code"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
          placeholder="AB12CD34"
        />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button className="w-full" onClick={joinBuilding} loading={loading}>
          Join Building
        </Button>
      </div>
    </main>
  );
}
