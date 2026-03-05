import prisma from "@/lib/db";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export interface OnboardingSnapshot {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  flatNumber: string | null;
  floorNumber: number | null;
  bio: string | null;
  onboardingCompleted: boolean;
  building: {
    id: string;
    name: string;
    address: string;
    city: string;
    pincode: string;
    inviteCode: string;
  } | null;
}

interface ProfileUpdateInput {
  name: string;
  phone: string;
  flatNumber: string;
  floorNumber: number | null;
  bio: string | null;
}

interface CreateBuildingInput {
  name: string;
  address: string;
  city: string;
  pincode: string;
}

function generateInviteCode(length = 8) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function isSupabaseTableMissing(errorMessage: string | undefined) {
  if (!errorMessage) return false;
  return errorMessage.includes("Could not find the table") || errorMessage.includes("schema cache");
}

async function readFromPrisma(userId: string): Promise<OnboardingSnapshot | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { building: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    flatNumber: user.flatNumber,
    floorNumber: user.floorNumber,
    bio: user.bio,
    onboardingCompleted: user.onboardingCompleted,
    building: user.building
      ? {
          id: user.building.id,
          name: user.building.name,
          address: user.building.address,
          city: user.building.city,
          pincode: user.building.pincode,
          inviteCode: user.building.inviteCode,
        }
      : null,
  };
}

async function readFromSupabase(userId: string): Promise<OnboardingSnapshot | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const { data: profile, error } = await supabase
    .from("app_profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    if (isSupabaseTableMissing(error.message)) {
      return null;
    }
    throw new Error(`Failed to fetch onboarding profile: ${error.message}`);
  }

  if (!profile) return null;

  let building: OnboardingSnapshot["building"] = null;
  if (profile.building_id) {
    const { data: buildingRow, error: buildingError } = await supabase
      .from("app_buildings")
      .select("*")
      .eq("id", profile.building_id as string)
      .maybeSingle();

    if (buildingError && !isSupabaseTableMissing(buildingError.message)) {
      throw new Error(`Failed to fetch building: ${buildingError.message}`);
    }

    if (buildingRow) {
      building = {
        id: String(buildingRow.id),
        name: String(buildingRow.name),
        address: String(buildingRow.address),
        city: String(buildingRow.city),
        pincode: String(buildingRow.pincode),
        inviteCode: String(buildingRow.invite_code),
      };
    }
  }

  return {
    id: String(profile.id),
    name: String(profile.full_name ?? ""),
    email: String(profile.email ?? ""),
    phone: profile.phone ? String(profile.phone) : null,
    flatNumber: profile.flat_number ? String(profile.flat_number) : null,
    floorNumber:
      profile.floor_number != null ? Number(profile.floor_number) : null,
    bio: profile.bio ? String(profile.bio) : null,
    onboardingCompleted: Boolean(profile.onboarding_completed),
    building,
  };
}

export async function getOnboardingSnapshot(userId: string) {
  const supabaseSnapshot = await readFromSupabase(userId);
  if (supabaseSnapshot) return supabaseSnapshot;
  return readFromPrisma(userId);
}

export async function updateOnboardingProfile(userId: string, input: ProfileUpdateInput) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      name: input.name,
      phone: input.phone,
      flatNumber: input.flatNumber,
      floorNumber: input.floorNumber,
      bio: input.bio,
    },
  });

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { error } = await supabase.from("app_profiles").upsert(
      {
        id: updatedUser.id,
        full_name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        flat_number: updatedUser.flatNumber,
        floor_number: updatedUser.floorNumber,
        bio: updatedUser.bio,
      },
      { onConflict: "id" }
    );

    if (error && !isSupabaseTableMissing(error.message)) {
      throw new Error(`Failed to sync onboarding profile: ${error.message}`);
    }
  }

  return getOnboardingSnapshot(userId);
}

export async function createBuildingAndAssignUser(
  userId: string,
  input: CreateBuildingInput
) {
  let building = null as null | {
    id: string;
    name: string;
    address: string;
    city: string;
    pincode: string;
    inviteCode: string;
  };

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const created = await prisma.building.create({
        data: {
          name: input.name,
          address: input.address,
          city: input.city,
          pincode: input.pincode,
          inviteCode: generateInviteCode(),
        },
      });

      building = {
        id: created.id,
        name: created.name,
        address: created.address,
        city: created.city,
        pincode: created.pincode,
        inviteCode: created.inviteCode,
      };
      break;
    } catch {
      // retry invite code collision
    }
  }

  if (!building) {
    throw new Error("Could not generate unique invite code");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      buildingId: building.id,
      onboardingCompleted: true,
    },
  });

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { error: buildingError } = await supabase.from("app_buildings").upsert(
      {
        id: building.id,
        name: building.name,
        address: building.address,
        city: building.city,
        pincode: building.pincode,
        invite_code: building.inviteCode,
      },
      { onConflict: "id" }
    );

    if (buildingError && !isSupabaseTableMissing(buildingError.message)) {
      throw new Error(`Failed to sync building: ${buildingError.message}`);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const { error: profileError } = await supabase.from("app_profiles").upsert(
        {
          id: user.id,
          full_name: user.name,
          email: user.email,
          phone: user.phone,
          flat_number: user.flatNumber,
          floor_number: user.floorNumber,
          bio: user.bio,
          building_id: building.id,
          onboarding_completed: true,
        },
        { onConflict: "id" }
      );

      if (profileError && !isSupabaseTableMissing(profileError.message)) {
        throw new Error(`Failed to sync building assignment: ${profileError.message}`);
      }
    }
  }

  return getOnboardingSnapshot(userId);
}

export async function joinBuildingAndAssignUser(userId: string, inviteCode: string) {
  const normalizedCode = inviteCode.trim().toUpperCase();

  const building = await prisma.building.findUnique({
    where: { inviteCode: normalizedCode },
  });

  if (!building) {
    throw new Error("Invalid invite code");
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      buildingId: building.id,
      onboardingCompleted: true,
    },
  });

  const supabase = createSupabaseAdminClient();
  if (supabase) {
    const { error: buildingError } = await supabase.from("app_buildings").upsert(
      {
        id: building.id,
        name: building.name,
        address: building.address,
        city: building.city,
        pincode: building.pincode,
        invite_code: building.inviteCode,
      },
      { onConflict: "id" }
    );

    if (buildingError && !isSupabaseTableMissing(buildingError.message)) {
      throw new Error(`Failed to sync building: ${buildingError.message}`);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      const { error: profileError } = await supabase.from("app_profiles").upsert(
        {
          id: user.id,
          full_name: user.name,
          email: user.email,
          phone: user.phone,
          flat_number: user.flatNumber,
          floor_number: user.floorNumber,
          bio: user.bio,
          building_id: building.id,
          onboarding_completed: true,
        },
        { onConflict: "id" }
      );

      if (profileError && !isSupabaseTableMissing(profileError.message)) {
        throw new Error(`Failed to sync building assignment: ${profileError.message}`);
      }
    }
  }

  return getOnboardingSnapshot(userId);
}

export async function getMyBuilding(userId: string) {
  const snapshot = await getOnboardingSnapshot(userId);
  if (!snapshot?.building) return null;

  const members = await prisma.user.findMany({
    where: { buildingId: snapshot.building.id },
    select: {
      id: true,
      name: true,
      flatNumber: true,
      role: true,
    },
  });

  return {
    ...snapshot.building,
    residents: members,
  };
}
