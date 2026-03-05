"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function OnboardingPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCurrent() {
      const res = await fetch("/api/onboarding");
      if (!res.ok) return;
      const json = await res.json();
      if (!json.success) return;

      setName(json.data.name ?? "");
      setPhone(json.data.phone ?? "");
      setFlatNumber(json.data.flatNumber ?? "");
      setFloorNumber(json.data.floorNumber != null ? String(json.data.floorNumber) : "");
      setBio(json.data.bio ?? "");

      if (json.data.onboardingCompleted && json.data.building) {
        router.replace("/explore");
      }
    }

    loadCurrent();
  }, [router]);

  async function saveProfile() {
    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          flatNumber,
          floorNumber: floorNumber ? Number(floorNumber) : null,
          bio,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error ?? "Failed to save profile details");
        return;
      }

      router.push("/building");
    } catch {
      setError("Failed to save profile details");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full max-w-xl bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Finish your profile</h1>
        <p className="text-sm text-stone-500 mt-1">Step 1 of 2</p>
      </div>

      <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Flat number"
          value={flatNumber}
          onChange={(e) => setFlatNumber(e.target.value)}
        />
        <Input
          label="Floor number"
          value={floorNumber}
          onChange={(e) => setFloorNumber(e.target.value)}
          type="number"
        />
      </div>
      <Input label="Bio (optional)" value={bio} onChange={(e) => setBio(e.target.value)} />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center justify-between gap-3">
        <Link href="/login" className="text-sm text-stone-500 hover:text-stone-700">
          Back
        </Link>
        <Button onClick={saveProfile} loading={saving}>
          Continue to Building
        </Button>
      </div>
    </div>
  );
}
