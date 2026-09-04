import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });
import { db } from "./lib/db/index";
import { funds, payments } from "./lib/db/schema";
import { like, desc } from "drizzle-orm";

async function run() {
  const fundList = await db.query.funds.findMany({
    where: like(funds.title, '%TEST FON PEŞİN HAVALE%'),
    orderBy: [desc(funds.createdAt)]
  });
  if (fundList.length === 0) { console.log("Fund not found"); return; }
  
  for (const fund of fundList.slice(0, 3)) {
      console.log("-------------------");
      console.log("Fund:", fund.id, fund.title);
      const fundPayments = await db.query.payments.findMany({
        where: (payments, { eq }) => eq(payments.fundId, fund.id)
      });
      console.log("Payments count:", fundPayments.length);
      if (fundPayments.length > 0) {
        console.log("First payment status:", fundPayments[0].status);
        console.log("First payment notes:", fundPayments[0].notes);
        console.log("First payment receipt:", fundPayments[0].receiptUrl);
      }
  }
  process.exit(0);
}
run();
