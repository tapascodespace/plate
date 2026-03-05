"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface CookProfileData {
  id: string;
  bio: string | null;
  specialties: string | null;
  neighborhood: string | null;
  city: string | null;
  kitchen: string | null;
  user: {
    name: string;
    email: string;
    avatar: string | null;
  };
}

export default function CookProfilePage() {
  const [profile, setProfile] = useState<CookProfileData | null>(null);
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [kitchen, setKitchen] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch("/api/cook/profile");
        const json = await res.json();
        if (!res.ok || !json.success) return;

        const data = json.data as CookProfileData;
        setProfile(data);
        setBio(data.bio ?? "");
        setSpecialties(data.specialties ?? "");
        setNeighborhood(data.neighborhood ?? "");
        setCity(data.city ?? "");
        setKitchen(data.kitchen ?? "");
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, []);

  async function onSave() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/cook/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bio, specialties, neighborhood, city, kitchen }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage(json.error ?? "Failed to save profile");
        return;
      }

      setMessage("Profile updated");
    } catch {
      setMessage("Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p className="text-sm text-stone-500">Loading profile...</p>;
  }

  if (!profile) {
    return <p className="text-sm text-stone-500">Cook profile not found.</p>;
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Cook Profile</h1>
        <p className="text-sm text-stone-500 mt-1">{profile.user.email}</p>
      </div>

      <Input label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
      <Input
        label="Specialties"
        value={specialties}
        onChange={(e) => setSpecialties(e.target.value)}
        placeholder="North Indian, Bengali, Street Food"
      />
      <Input
        label="Neighborhood"
        value={neighborhood}
        onChange={(e) => setNeighborhood(e.target.value)}
      />
      <Input label="City" value={city} onChange={(e) => setCity(e.target.value)} />
      <Input
        label="Kitchen/Pickup notes"
        value={kitchen}
        onChange={(e) => setKitchen(e.target.value)}
      />

      <div className="flex items-center gap-3">
        <Button onClick={onSave} loading={saving}>
          Save Profile
        </Button>
        {message && <p className="text-sm text-stone-500">{message}</p>}
      </div>
    </div>
  );
}
