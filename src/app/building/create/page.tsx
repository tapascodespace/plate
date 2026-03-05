"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function CreateBuildingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createBuilding() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/buildings/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, city, pincode }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Failed to create building");
        return;
      }

      router.push("/explore");
    } catch {
      setError("Failed to create building");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <h1 className="text-2xl font-bold text-stone-900">Create Building</h1>

        <Input label="Building name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input label="Address" value={address} onChange={(e) => setAddress(e.target.value)} />
        <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
        <Input label="Pincode" value={pincode} onChange={(e) => setPincode(e.target.value)} />

        {error && <p className="text-sm text-red-600">{error}</p>}

        <Button className="w-full" onClick={createBuilding} loading={loading}>
          Create & Continue
        </Button>
      </div>
    </main>
  );
}
