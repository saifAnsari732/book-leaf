import { resetAndSeedDatabase } from "../src/lib/repository";

async function main() {
  console.log("==============================================================");
  console.log(" BookLeaf Publishing — Database Seed & Verification Utility");
  console.log("==============================================================");

  const result = await resetAndSeedDatabase();

  console.log(`✓ Storage Mode      : ${result.mode.toUpperCase()}`);
  console.log(`✓ Authors Imported  : ${result.authorsCount} (AUTH001..AUTH010)`);
  console.log(`✓ Admins Provisioned: ${result.adminsCount} (admin@bookleafpub.com)`);
  console.log(`✓ Books Imported    : ${result.booksCount} (BK001..BK018, including 2 In-Production records)`);
  console.log(`✓ Initial Tickets   : ${result.ticketsCount} (TKT-1001..TKT-1006 across all categories)`);
  console.log("--------------------------------------------------------------");
  console.log(" Demo Credentials:");
  console.log(" • Admin  : admin@bookleafpub.com      | Password: admin123");
  console.log(" • Author : priya.sharma@email.com     | Password: author123");
  console.log(" • Author : kavita.deshmukh@email.com  | Password: author123");
  console.log(" • Author : sneha.kulkarni@email.com   | Password: author123");
  console.log("==============================================================");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
