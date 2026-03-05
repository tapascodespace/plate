/**
 * One-time cleanup script: finds Supabase auth users that have no matching
 * Prisma record (orphaned from a partially-failed registration) and creates
 * the missing Prisma record so those users can sign in.
 *
 * Run with:
 *   npx tsx scripts/fix-orphaned-users.ts
 */
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";
import bcrypt from "bcryptjs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const prisma = new PrismaClient({
  accelerateUrl: process.env.DATABASE_URL || process.env.DIRECT_DATABASE_URL,
}).$extends(withAccelerate());

async function main() {
  console.log("Fetching Supabase auth users...");
  const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 });
  if (error) {
    console.error("Failed to list Supabase users:", error.message);
    process.exit(1);
  }

  const supabaseUsers = data.users;
  console.log(`Found ${supabaseUsers.length} Supabase user(s).`);

  let fixed = 0;
  let skipped = 0;

  for (const sbUser of supabaseUsers) {
    if (!sbUser.email) continue;

    const prismaUser = await prisma.user.findFirst({
      where: {
        OR: [{ id: sbUser.id }, { email: sbUser.email }],
      },
    });

    if (prismaUser) {
      skipped++;
      continue;
    }

    // Orphaned user — create a Prisma record linked to their Supabase ID
    const name =
      (sbUser.user_metadata?.full_name as string | undefined) ??
      sbUser.email.split("@")[0];

    await prisma.user.create({
      data: {
        id: sbUser.id,
        name,
        email: sbUser.email,
        // Placeholder hash — user will authenticate via Supabase
        passwordHash: await bcrypt.hash(Math.random().toString(36), 12),
        role: "CUSTOMER",
      },
    });

    console.log(`  ✔ Created Prisma record for orphaned user: ${sbUser.email}`);
    fixed++;
  }

  console.log(`\nDone. Created: ${fixed}, Already present: ${skipped}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
