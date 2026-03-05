import Link from "next/link";

export default function BuildingLandingPage() {
  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-stone-200 p-6 space-y-4">
        <h1 className="text-2xl font-bold text-stone-900">Join your building</h1>
        <p className="text-sm text-stone-500">
          Step 2 of 2 — join an existing building with an invite code or create one.
        </p>

        <div className="grid gap-3">
          <Link
            href="/building/join"
            className="rounded-lg bg-orange-500 text-white text-center py-2.5 font-medium hover:bg-orange-600"
          >
            Join with Invite Code
          </Link>
          <Link
            href="/building/create"
            className="rounded-lg border border-stone-300 text-stone-700 text-center py-2.5 font-medium hover:bg-stone-50"
          >
            Create New Building
          </Link>
        </div>
      </div>
    </main>
  );
}
